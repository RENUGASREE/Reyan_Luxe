import mongoose, { Schema, Document, Model } from "mongoose";
import { CouponType } from "../types/index.js";

export interface ICoupon extends Document {
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    startsAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ expiresAt: 1 });

export const Coupon: Model<ICoupon> =
  mongoose.models.Coupon ?? mongoose.model<ICoupon>("Coupon", couponSchema);
