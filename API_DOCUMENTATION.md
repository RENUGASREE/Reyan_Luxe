# Reyan Luxe — API Documentation

**Base URL (local):** `http://localhost:8000/api/v1`  
**Base URL (production):** `https://<your-render-service>.onrender.com/api/v1`  
**Content-Type:** `application/json`

---

## Response Format

### Success

```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

`meta` is included on paginated list endpoints only.

### Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email"]
  }
}
```

---

## Authentication

| Phase | Method |
|-------|--------|
| **Phase 2 (now)** | Admin mutations: header `X-Admin-Key: <ADMIN_API_KEY>` |
| **Phase 3** | `Authorization: Bearer <access_token>` |
| **Phase 3** | Refresh token via HTTP-only cookie |

In development, if `ADMIN_API_KEY` is unset, admin routes are open (local use only).

---

## Health

### GET `/health`

Returns API and database status.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-06-30T12:00:00.000Z",
    "database": "connected"
  }
}
```

---

## Categories

### GET `/categories`

List categories with optional filters.

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `active` | `true\|false` | Filter by `isActive` |
| `menu` | `true\|false` | Filter by `showInMenu` |
| `productType` | string | `bracelet`, `earring`, `bangle`, `other` |
| `parentId` | string | Parent category ID; use empty/null root |

**Response 200:** array of category objects.

---

### GET `/categories/:id`

Get category by MongoDB ObjectId.

---

### GET `/categories/slug/:slug`

Get category by slug (e.g. `crystal-bead-bracelets`).

---

### POST `/categories` 🔒 Admin

Create a category.

**Body:**

```json
{
  "name": "Crystal Bead Bracelets",
  "productType": "bracelet",
  "description": "Optional description",
  "parentId": null,
  "showInMenu": true,
  "sortOrder": 1,
  "customizationFields": []
}
```

**Response 201:** created category.

---

### PATCH `/categories/:id` 🔒 Admin

Partial update. All create fields optional.

---

### DELETE `/categories/:id` 🔒 Admin

Delete category. Fails if subcategories exist.

---

## Products

### GET `/products`

Paginated product listing with filters.

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `q` | string | | Full-text search |
| `categoryId` | string | | Filter by category |
| `subcategoryId` | string | | Filter by subcategory |
| `minPrice` | number | | Minimum price (INR) |
| `maxPrice` | number | | Maximum price (INR) |
| `material` | string | | Filter by materials array |
| `color` | string | | Filter by colors array |
| `minRating` | number | | Minimum average rating |
| `inStock` | `true\|false` | | Stock availability |
| `isSignaturePiece` | `true\|false` | | Signature collection |
| `sort` | string | `newest` | `price_asc`, `price_desc`, `newest`, `rating`, `name` |

**Response 200:**

```json
{
  "success": true,
  "data": [ { "...product" } ],
  "meta": { "page": 1, "limit": 20, "total": 6, "totalPages": 1 }
}
```

---

### GET `/products/search`

Alias for product search. Same query params as `GET /products` (use `q` for search term).

---

### GET `/products/:id`

Get product by ObjectId.

---

### GET `/products/slug/:slug`

Get active product by slug.

---

### POST `/products` 🔒 Admin

Create product.

**Body (required fields):**

```json
{
  "name": "Aura Rose Crystal Bracelet",
  "description": "Full description",
  "categoryId": "665abc123...",
  "price": 1299,
  "stock": 25,
  "salePrice": 1099,
  "sku": "BRC-AURA-001",
  "media": [
    { "url": "https://...", "type": "image", "isPrimary": true }
  ],
  "colors": ["rose"],
  "materials": ["crystal"],
  "isCustomizable": true
}
```

**Response 201:** created product.

---

### PATCH `/products/:id` 🔒 Admin

Partial product update.

---

### DELETE `/products/:id` 🔒 Admin

Delete product.

---

### GET `/products/inventory/low-stock` 🔒 Admin

Products at or below their `lowStockThreshold`.

**Query:** `threshold` (optional number override)

---

## Product Object Reference

```json
{
  "_id": "665...",
  "name": "Aura Rose Crystal Bracelet",
  "slug": "aura-rose-crystal-bracelet",
  "description": "...",
  "shortDescription": "...",
  "categoryId": "665...",
  "subcategoryId": null,
  "price": 1299,
  "salePrice": 1099,
  "currency": "INR",
  "sku": "BRC-AURA-001",
  "stock": 25,
  "lowStockThreshold": 5,
  "weightGrams": 12,
  "materialInfo": "Crystal beads, gold-plated spacer",
  "careInstructions": "Avoid water and perfumes",
  "media": [
    { "url": "https://...", "type": "image", "isPrimary": true, "alt": "..." }
  ],
  "colors": ["rose", "pink"],
  "materials": ["crystal", "gold-plated"],
  "tags": ["reyan-luxe"],
  "badge": "Bestseller",
  "isSignaturePiece": true,
  "signatureCategory": "trending",
  "isActive": true,
  "isCustomizable": true,
  "averageRating": 0,
  "reviewCount": 0,
  "effectivePrice": 1099,
  "isInStock": true,
  "createdAt": "2026-06-30T...",
  "updatedAt": "2026-06-30T..."
}
```

---

## Endpoints — Coming in Later Phases

| Endpoint | Phase | Description |
|----------|-------|-------------|
| `POST /auth/register` | 3 | Email registration |
| `POST /auth/login` | 3 | JWT login |
| `POST /auth/refresh` | 3 | Refresh access token |
| `POST /auth/google` | 3 | Google OAuth |
| `POST /auth/forgot-password` | 3 | Password reset request |
| `POST /auth/reset-password` | 3 | Reset with token |
| `GET/POST /cart` | 6 | Cart operations |
| `POST /checkout` | 6 | Create order from cart |
| `POST /payments/razorpay/order` | 6 | Razorpay order |
| `POST /payments/razorpay/verify` | 6 | Payment verification |
| `GET/POST /reviews` | 4 | Product reviews |
| `GET/POST /admin/orders` | 4 | Order management |
| `GET /admin/analytics` | 4 | Dashboard metrics |
| `GET/POST /customization/config` | 5 | Configurator API |

---

## Error Codes

| HTTP | Meaning |
|------|---------|
| 400 | Validation error / bad request |
| 401 | Authentication required |
| 404 | Resource not found |
| 409 | Duplicate slug/SKU/email |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Rate Limits

- **Production:** 300 requests per 15 minutes per IP (global)
- **Development:** 1000 requests per 15 minutes per IP

Auth routes will have stricter limits in Phase 3.

---

## Local Development

```bash
cd server
cp .env.example .env
# Set MONGODB_URI (local MongoDB or Atlas)
npm install
npm run seed
npm run dev
```

**Example requests:**

```bash
# Health
curl http://localhost:8000/api/v1/health

# List categories
curl http://localhost:8000/api/v1/categories

# List products
curl "http://localhost:8000/api/v1/products?categoryId=<ID>&sort=price_asc"

# Create category (admin)
curl -X POST http://localhost:8000/api/v1/categories \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: dev-admin-key-change-me" \
  -d '{"name":"New Category","productType":"bracelet"}'
```

---

## Legacy API Compatibility

The Django API at `/api/` (no version prefix) remains during migration. New frontend work should target **`/api/v1`** only.

| Legacy | Replacement |
|--------|-------------|
| `GET /api/bracelets/` | `GET /api/v1/products?categoryId=<braceletCatId>` |
| `GET /api/chains/` | `GET /api/v1/products?categoryId=<chainCatId>` |
| `GET /api/categories/` | `GET /api/v1/categories` |

A compatibility adapter route may be added in Phase 4 if needed for gradual frontend migration.
