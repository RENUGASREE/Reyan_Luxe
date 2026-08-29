import slugify from "slugify";
import { Types } from "mongoose";

export function toSlug(value: string): string {
  return slugify(value, { lower: true, strict: true, trim: true });
}

export function parseObjectId(id: string, fieldName = "id"): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return new Types.ObjectId(id);
}

export function paginate(page: number, limit: number) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export function generateOrderNumber(): string {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `RL${stamp}${rand}`;
}

export function generateSku(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}
