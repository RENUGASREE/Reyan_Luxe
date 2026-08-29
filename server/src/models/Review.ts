import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReview extends Document {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  orderId?: Types.ObjectId;
  rating: number;
  title: string;
  body: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    images: { type: [String], default: [] },
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false, index: true },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Review: Model<IReview> =
  mongoose.models.Review ?? mongoose.model<IReview>("Review", reviewSchema);
