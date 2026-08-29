import { Types } from "mongoose";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { AppError } from "../middleware/errorHandler.js";

export async function listProductReviews(_productType: string, productId: string) {
  if (!Types.ObjectId.isValid(productId)) return [];
  return Review.find({
    productId: new Types.ObjectId(productId),
    isApproved: true,
  })
    .populate("userId", "username email")
    .sort({ createdAt: -1 })
    .lean();
}

export async function createReview(
  userId: string,
  input: {
    product_type: string;
    product_id: number | string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }
) {
  const productId = String(input.product_id);
  if (!Types.ObjectId.isValid(productId)) throw new AppError("Invalid product", 400);

  const existing = await Review.findOne({
    userId: new Types.ObjectId(userId),
    productId: new Types.ObjectId(productId),
  });
  if (existing) throw new AppError("You already reviewed this product", 409);

  const paidOrder = await Order.findOne({
    userId: new Types.ObjectId(userId),
    paymentStatus: { $in: ["paid", "pending"] },
    status: { $ne: "cancelled" },
    "items.productId": new Types.ObjectId(productId),
  });

  const review = await Review.create({
    userId: new Types.ObjectId(userId),
    productId: new Types.ObjectId(productId),
    orderId: paidOrder?._id,
    rating: input.rating,
    title: input.title,
    comment: input.comment,
    images: input.images ?? [],
    isVerifiedPurchase: Boolean(paidOrder),
    isApproved: false,
  });

  await recalculateProductRating(productId);
  return review;
}

async function recalculateProductRating(productId: string) {
  const stats = await Review.aggregate([
    { $match: { productId: new Types.ObjectId(productId), isApproved: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    averageRating: stats[0]?.averageRating ?? 0,
    reviewCount: stats[0]?.reviewCount ?? 0,
  });
}

export function toLegacyReview(review: Record<string, unknown>) {
  const user = review.userId as { username?: string; email?: string } | undefined;
  return {
    id: (review._id as { toString(): string }).toString(),
    user: typeof user === "object" && user && "_id" in user ? (user as { _id: unknown })._id : review.userId,
    user_name: user?.username ?? user?.email?.split("@")[0] ?? "Customer",
    product_type: review.productType ?? "bracelet",
    product_id: review.productId,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    is_verified_purchase: review.isVerifiedPurchase,
    created_at: review.createdAt,
    is_approved: review.isApproved,
    images: review.images ?? [],
  };
}
