import { Types } from "mongoose";
import { Product, InventoryLog } from "../models/index.js";
import { AppError } from "../middleware/errorHandler.js";
import type { InventoryAction } from "../types/index.js";

export async function adjustStock(params: {
  productId: string;
  quantityChange: number;
  action: InventoryAction;
  reason?: string;
  orderId?: string;
  performedBy?: string;
}): Promise<{ productId: string; previousStock: number; newStock: number }> {
  if (!Types.ObjectId.isValid(params.productId)) {
    throw new AppError("Invalid product id", 400);
  }

  const product = await Product.findById(params.productId);
  if (!product) throw new AppError("Product not found", 404);

  const previousStock = product.stock;
  const newStock = previousStock + params.quantityChange;

  if (newStock < 0) {
    throw new AppError("Insufficient stock", 400);
  }

  product.stock = newStock;
  await product.save();

  await InventoryLog.create({
    productId: product._id,
    sku: product.sku,
    action: params.action,
    quantityChange: params.quantityChange,
    previousStock,
    newStock,
    reason: params.reason,
    orderId: params.orderId ? new Types.ObjectId(params.orderId) : undefined,
    performedBy: params.performedBy ? new Types.ObjectId(params.performedBy) : undefined,
  });

  return { productId: product.id, previousStock, newStock };
}

export async function deductStockForOrder(
  items: { productId: string; quantity: number }[],
  orderId: string,
  performedBy?: string
): Promise<void> {
  for (const item of items) {
    await adjustStock({
      productId: item.productId,
      quantityChange: -item.quantity,
      action: "deduct",
      reason: "Order placement",
      orderId,
      performedBy,
    });
  }
}

// Inventory reservation strategy
// Reserve stock when payment is initiated, release on failure, confirm on success
const RESERVATION_TIMEOUT_MINUTES = 30;

export async function reserveStockForOrder(
  items: { productId: string; quantity: number }[],
  orderId: string,
  performedBy?: string
): Promise<void> {
  for (const item of items) {
    await adjustStock({
      productId: item.productId,
      quantityChange: -item.quantity,
      action: "reserve",
      reason: "Payment initiated - stock reserved",
      orderId,
      performedBy,
    });
  }
}

export async function releaseReservedStock(
  items: { productId: string; quantity: number }[],
  orderId: string,
  performedBy?: string
): Promise<void> {
  for (const item of items) {
    await adjustStock({
      productId: item.productId,
      quantityChange: item.quantity,
      action: "release",
      reason: "Payment failed - reservation released",
      orderId,
      performedBy,
    });
  }
}

export async function confirmReservedStock(
  items: { productId: string; quantity: number }[],
  orderId: string,
  performedBy?: string
): Promise<void> {
  for (const item of items) {
    await adjustStock({
      productId: item.productId,
      quantityChange: 0,
      action: "confirm",
      reason: "Payment confirmed - reservation converted to sale",
      orderId,
      performedBy,
    });
  }
}

// Clean up expired reservations (should be run periodically via cron)
export async function cleanupExpiredReservations(): Promise<void> {
  const cutoffTime = new Date(Date.now() - RESERVATION_TIMEOUT_MINUTES * 60 * 1000);
  
  const expiredLogs = await InventoryLog.find({
    action: "reserve",
    createdAt: { $lt: cutoffTime },
  }).populate("orderId");

  for (const log of expiredLogs) {
    const order = log.orderId as any;
    if (order && order.paymentStatus === "pending") {
      // Release the reservation
      await adjustStock({
        productId: log.productId.toString(),
        quantityChange: Math.abs(log.quantityChange),
        action: "release",
        reason: "Reservation expired",
        orderId: order._id.toString(),
      });
      
      // Update order status
      order.paymentStatus = "failed";
      order.notes = `${order.notes ?? ""}\nStock reservation expired`.trim();
      await order.save();
    }
  }
}
