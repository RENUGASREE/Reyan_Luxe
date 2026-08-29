import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { Review } from "../models/Review.js";
import { listLowStockProducts } from "./product.service.js";

export async function getDashboardStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRevenueAgg,
    ordersLast30,
    totalOrders,
    totalUsers,
    totalProducts,
    pendingReviews,
    topProducts,
    lowStock,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Order.countDocuments(),
    User.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Review.countDocuments({ isApproved: false }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
    ]),
    listLowStockProducts(),
  ]);

  const revenueLast30Agg = await Order.aggregate([
    {
      $match: {
        paymentStatus: "paid",
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);

  return {
    revenue: {
      allTime: totalRevenueAgg[0]?.total ?? 0,
      last30Days: revenueLast30Agg[0]?.total ?? 0,
    },
    orders: {
      total: totalOrders,
      last30Days: ordersLast30,
    },
    users: { total: totalUsers },
    products: { active: totalProducts },
    reviews: { pendingModeration: pendingReviews },
    topProducts: topProducts.map((p) => ({
      productId: String(p._id),
      name: p.name,
      quantitySold: p.quantitySold,
      revenue: p.revenue,
    })),
    inventory: {
      lowStockCount: lowStock.length,
      lowStockItems: lowStock.slice(0, 10).map((p) => ({
        id: String(p._id),
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
      })),
    },
  };
}
