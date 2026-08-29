import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWishlistItem extends Document {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlistItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const WishlistItem: Model<IWishlistItem> =
  mongoose.models.WishlistItem ??
  mongoose.model<IWishlistItem>("WishlistItem", wishlistSchema);
