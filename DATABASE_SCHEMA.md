# Reyan Luxe — Database Schema

**Database:** MongoDB Atlas  
**ODM:** Mongoose 8  
**API prefix:** `/api/v1`

---

## Collections Overview

| Collection | Model File | Description |
|------------|------------|-------------|
| `users` | `User.ts` | Customer and admin accounts |
| `categories` | `Category.ts` | Dynamic product taxonomy |
| `products` | `Product.ts` | Unified product catalog |
| `carts` | `Cart.ts` | Shopping carts |
| `orders` | `Order.ts` | Order records |
| `reviews` | `Review.ts` | Product reviews |
| `coupons` | `Coupon.ts` | Discount codes |
| `customizationconfigs` | `CustomizationConfig.ts` | Configurator schemas |
| `inventorylogs` | `InventoryLog.ts` | Stock change audit log |

---

## users

| Field | Type | Required | Index | Notes |
|-------|------|----------|-------|-------|
| `_id` | ObjectId | auto | PK | |
| `email` | string | yes | unique | lowercase |
| `passwordHash` | string | no | | select: false |
| `username` | string | yes | | display name |
| `firstName` | string | no | | |
| `lastName` | string | no | | |
| `phone` | string | no | | |
| `role` | enum | yes | yes | `customer`, `admin` |
| `googleId` | string | no | sparse unique | OAuth |
| `avatarUrl` | string | no | | |
| `addresses[]` | subdoc | no | | shipping/billing book |
| `isEmailVerified` | boolean | yes | | default false |
| `refreshTokenHash` | string | no | | select: false |
| `passwordResetToken` | string | no | | select: false |
| `passwordResetExpires` | Date | no | | |
| `lastLoginAt` | Date | no | | |
| `createdAt` | Date | auto | | |
| `updatedAt` | Date | auto | | |

**Indexes:** `{ email: 1 }`, `{ role: 1, createdAt: -1 }`

---

## categories

| Field | Type | Required | Index | Notes |
|-------|------|----------|-------|-------|
| `_id` | ObjectId | auto | PK | |
| `name` | string | yes | text | |
| `slug` | string | yes | unique | URL-safe |
| `description` | string | no | text | |
| `parentId` | ObjectId | no | yes | ref categories |
| `productType` | enum | yes | yes | bracelet, earring, bangle, other |
| `imageUrl` | string | no | | |
| `isActive` | boolean | yes | yes | default true |
| `showInMenu` | boolean | yes | | nav visibility |
| `sortOrder` | number | yes | | menu ordering |
| `customizationFields[]` | array | no | | embedded field defs |
| `seoTitle` | string | no | | |
| `seoDescription` | string | no | | |
| `createdAt` | Date | auto | | |
| `updatedAt` | Date | auto | | |

**customizationFields[] item:**

| Field | Type | Notes |
|-------|------|-------|
| `key` | string | machine key, e.g. `beadColor` |
| `label` | string | display label |
| `type` | enum | select, multiselect, color, text, number |
| `options[]` | array | value, label, priceModifier, imageUrl |
| `required` | boolean | |
| `sortOrder` | number | |

**Indexes:**
- `{ slug: 1 }` unique
- `{ isActive: 1, showInMenu: 1, sortOrder: 1 }`
- `{ parentId: 1, sortOrder: 1 }`
- text on `name`, `description`

---

## products

| Field | Type | Required | Index | Notes |
|-------|------|----------|-------|-------|
| `_id` | ObjectId | auto | PK | |
| `name` | string | yes | text | |
| `slug` | string | yes | unique | |
| `description` | string | yes | text | |
| `shortDescription` | string | no | | |
| `categoryId` | ObjectId | yes | yes | ref categories |
| `subcategoryId` | ObjectId | no | yes | ref categories |
| `price` | number | yes | yes | INR base price |
| `salePrice` | number | no | yes | optional discount |
| `currency` | string | yes | | default INR |
| `sku` | string | yes | unique | uppercase |
| `stock` | number | yes | yes | current inventory |
| `lowStockThreshold` | number | yes | | default 5 |
| `weightGrams` | number | no | | shipping calc |
| `materialInfo` | string | no | | |
| `careInstructions` | string | no | | |
| `media[]` | array | no | | images + videos |
| `colors[]` | string | no | yes | filter facet |
| `materials[]` | string | no | yes | filter facet |
| `tags[]` | string | no | text | |
| `badge` | string | no | | Bestseller, etc. |
| `isSignaturePiece` | boolean | yes | yes | homepage feature |
| `signatureCategory` | enum | no | | fashion, trending, latest, none |
| `isActive` | boolean | yes | yes | |
| `isCustomizable` | boolean | yes | | |
| `averageRating` | number | yes | yes | denormalized |
| `reviewCount` | number | yes | | denormalized |
| `createdAt` | Date | auto | yes | sort newest |
| `updatedAt` | Date | auto | | |

**media[] item:**

| Field | Type | Notes |
|-------|------|-------|
| `url` | string | CDN URL |
| `alt` | string | accessibility |
| `type` | enum | image, video |
| `isPrimary` | boolean | card thumbnail |
| `sortOrder` | number | gallery order |

**Virtuals:** `effectivePrice`, `isInStock`

**Indexes:**
- text: `name`, `description`, `tags`, `sku`
- `{ categoryId: 1, isActive: 1, price: 1 }`
- `{ isActive: 1, stock: 1 }`
- `{ averageRating: -1 }`

---

## carts

| Field | Type | Required | Index | Notes |
|-------|------|----------|-------|-------|
| `_id` | ObjectId | auto | PK | |
| `userId` | ObjectId | no | unique sparse | logged-in cart |
| `sessionId` | string | no | unique sparse | guest cart |
| `items[]` | array | yes | | line items |
| `couponCode` | string | no | | applied coupon |
| `createdAt` | Date | auto | | |
| `updatedAt` | Date | auto | | |

**items[] line:**

| Field | Type | Notes |
|-------|------|-------|
| `productId` | ObjectId | ref products |
| `sku` | string | snapshot |
| `name` | string | snapshot |
| `imageUrl` | string | snapshot |
| `unitPrice` | number | at add-to-cart time |
| `quantity` | number | min 1 |
| `customization` | object | selections, preview, engraving |
| `savedForLater` | boolean | save-for-later flag |

---

## orders

| Field | Type | Required | Index | Notes |
|-------|------|----------|-------|-------|
| `_id` | ObjectId | auto | PK | |
| `orderNumber` | string | yes | unique | RL{timestamp}{rand} |
| `userId` | ObjectId | yes | yes | |
| `status` | enum | yes | yes | pending → refunded |
| `paymentStatus` | enum | yes | yes | pending, paid, failed, refunded |
| `items[]` | array | yes | | order line snapshot |
| `subtotal` | number | yes | | |
| `discount` | number | yes | | coupon amount |
| `tax` | number | yes | | |
| `shipping` | number | yes | | |
| `total` | number | yes | | |
| `currency` | string | yes | | INR |
| `couponCode` | string | no | | |
| `shippingAddress` | object | yes | | address snapshot |
| `billingAddress` | object | yes | | |
| `email` | string | yes | | |
| `phone` | string | yes | | |
| `notes` | string | no | | |
| `paymentMethod` | string | yes | | razorpay, cod |
| `razorpayOrderId` | string | no | sparse | |
| `razorpayPaymentId` | string | no | | |
| `razorpaySignature` | string | no | | |
| `trackingNumber` | string | no | | |
| `invoiceUrl` | string | no | | PDF URL |
| `statusHistory[]` | array | no | | audit trail |
| `createdAt` | Date | auto | yes | |
| `updatedAt` | Date | auto | | |

**Order statuses:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`

---

## reviews

| Field | Type | Required | Index | Notes |
|-------|------|----------|-------|-------|
| `_id` | ObjectId | auto | PK | |
| `userId` | ObjectId | yes | yes | |
| `productId` | ObjectId | yes | yes | |
| `orderId` | ObjectId | no | | verified purchase link |
| `rating` | number | yes | yes | 1–5 |
| `title` | string | yes | | max 200 |
| `comment` | string | yes | | |
| `images[]` | string | no | | review photo URLs |
| `isVerifiedPurchase` | boolean | yes | | |
| `isApproved` | boolean | yes | yes | moderation |
| `helpfulCount` | number | yes | | |
| `createdAt` | Date | auto | yes | |
| `updatedAt` | Date | auto | | |

**Unique:** `{ userId: 1, productId: 1 }`

---

## coupons

| Field | Type | Required | Index | Notes |
|-------|------|----------|-------|-------|
| `_id` | ObjectId | auto | PK | |
| `code` | string | yes | unique | uppercase |
| `description` | string | no | | |
| `type` | enum | yes | | percentage, fixed |
| `value` | number | yes | | |
| `minOrderAmount` | number | yes | | |
| `maxDiscount` | number | no | | cap for % coupons |
| `usageLimit` | number | no | | |
| `usedCount` | number | yes | | |
| `isActive` | boolean | yes | yes | |
| `startsAt` | Date | no | | |
| `expiresAt` | Date | no | yes | |
| `createdAt` | Date | auto | | |
| `updatedAt` | Date | auto | | |

---

## customizationconfigs

| Field | Type | Required | Index | Notes |
|-------|------|----------|-------|-------|
| `_id` | ObjectId | auto | PK | |
| `name` | string | yes | | |
| `productType` | enum | yes | yes | |
| `categoryId` | ObjectId | no | yes | optional scope |
| `fields[]` | array | yes | | same shape as category fields |
| `basePriceModifier` | number | yes | | |
| `previewLayers[]` | array | no | | 2D compositor layers |
| `isActive` | boolean | yes | | |
| `createdAt` | Date | auto | | |
| `updatedAt` | Date | auto | | |

**previewLayers[] item:** `layerId`, `imageUrl`, `zIndex`, `linkedFieldKey`

---

## inventorylogs

| Field | Type | Required | Index | Notes |
|-------|------|----------|-------|-------|
| `_id` | ObjectId | auto | PK | |
| `productId` | ObjectId | yes | yes | |
| `sku` | string | yes | yes | |
| `action` | enum | yes | | add, deduct, adjust, reserve, release |
| `quantityChange` | number | yes | | +/- |
| `previousStock` | number | yes | | |
| `newStock` | number | yes | | |
| `reason` | string | no | | |
| `orderId` | ObjectId | no | | |
| `performedBy` | ObjectId | no | | admin user |
| `createdAt` | Date | auto | yes | |

---

## Seed Data (Phase 2)

Run `npm run seed` in `server/` to populate:

- 3 root categories (bracelets, earrings, bangles)
- 6 sample products
- 3 customization configs
- 1 sample coupon (`WELCOME10`)

Use `npm run seed -- --reset` to clear catalog collections first.

---

## Migration from Legacy Django/SQLite

| Legacy | New |
|--------|-----|
| `Bracelet` + `Chain` models | single `products` collection |
| `Category.group` enum | `Category.productType` |
| `CartItem` denormalized | `carts.items[]` with snapshots |
| DRF Token | JWT (Phase 3) |
| Missing Razorpay fields | `orders.razorpayOrderId` etc. |

A one-time migration script will be added in Phase 4 to import existing SQLite data if needed.
