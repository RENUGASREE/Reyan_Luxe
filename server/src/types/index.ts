export const PRODUCT_TYPES = ["bracelet", "earring", "bangle", "other"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const USER_ROLES = ["customer", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const COUPON_TYPES = ["percentage", "fixed"] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

export const INVENTORY_ACTIONS = ["add", "deduct", "adjust", "reserve", "release", "confirm"] as const;
export type InventoryAction = (typeof INVENTORY_ACTIONS)[number];

export interface ProductMedia {
  url: string;
  alt?: string;
  type: "image" | "video";
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
