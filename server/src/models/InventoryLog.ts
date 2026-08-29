import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { InventoryAction } from "../types/index.js";

export interface IInventoryLog extends Document {
  productId: Types.ObjectId;
  sku: string;
  action: InventoryAction;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  orderId?: Types.ObjectId;
  performedBy?: Types.ObjectId;
  createdAt: Date;
}

const inventoryLogSchema = new Schema<IInventoryLog>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    sku: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ["add", "deduct", "adjust", "reserve", "release"],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: String,
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

inventoryLogSchema.index({ productId: 1, createdAt: -1 });
inventoryLogSchema.index({ sku: 1, createdAt: -1 });
inventoryLogSchema.index({ createdAt: -1 });

export const InventoryLog: Model<IInventoryLog> =
  mongoose.models.InventoryLog ??
  mongoose.model<IInventoryLog>("InventoryLog", inventoryLogSchema);
