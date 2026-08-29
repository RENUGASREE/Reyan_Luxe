# Reyan Luxe — Project Audit

**Audit Date:** June 30, 2026  
**Scope:** Full codebase review (frontend, backend, deployment, data layer)  
**Purpose:** Phase 1 baseline before production rebuild  
**Status:** Audit complete — no code changes made

---

## Executive Summary

Reyan Luxe is a **partially implemented** jewelry e-commerce prototype with a **React + TypeScript + Vite** frontend and a **Django REST Framework** backend backed by **SQLite**. The UI design language is polished (Playfair Display + Inter, magenta `#FF0066` primary, dark/light theme, Framer Motion effects, shadcn/ui components), but **most business-critical flows are incomplete, inconsistent, or broken**.

The live deployment on **GitHub Pages** serves **static frontend only**. There is **no production backend**, so authenticated features (cart, checkout, orders, admin API) **cannot work** for real customers today.

A full rebuild is warranted—not a patch pass—to meet production goals: MongoDB Atlas, Render deployment, JWT auth, Razorpay, dynamic categories (Crystal Bead Bracelets, Kundan Earrings, Kundan Bangles), customization engine, inventory, coupons, analytics, and comprehensive testing.

---

## 1. Current Architecture

### 1.1 Repository Structure

```
reyan/
├── frontend/          # React 18 + TypeScript + Vite + Tailwind + React Query
├── backend/           # Django 4.x + DRF + SQLite
│   ├── reyan_backend/ # Project settings, URLs, WSGI
│   ├── store/         # Core e-commerce app (products, cart, orders, auth)
│   ├── contact/       # Contact form API
│   └── newsletter/    # Newsletter subscription API
├── docs/              # Built frontend copied for GitHub Pages
├── .github/workflows/ # CI: build frontend → deploy to GitHub Pages
├── requirements.txt   # Incomplete backend dependencies
└── deploy.sh          # Manual GitHub Pages deployment script
```

### 1.2 Frontend Architecture

| Layer | Technology | Notes |
|-------|------------|-------|
| Build | Vite 5 | `base: "/Reyan_Luxe/"` for GitHub Pages |
| UI | React 18, TypeScript | shadcn/ui (Radix), Tailwind CSS 3 |
| Routing | React Router 7 | `basename="/Reyan_Luxe/"` |
| State / Data | TanStack React Query 5 | Configured but **underused**; most pages use raw `fetch`/`axios` |
| Auth | Custom `AuthContext` | Token stored in `localStorage`; no refresh token |
| SEO | `react-helmet-async` | Per-page meta tags; partial structured data |
| Animation | Framer Motion | Loading screen, navbar, scroll reveals |
| Forms | react-hook-form + zod | Login/register only |

**Pages implemented:** Home, Products, Product Detail, Customization, Cart, Checkout, Wishlist, Account, Login, Register, Forgot/Reset Password, Admin (stub), About, Contact, Order Success, 404.

**Design tokens (preserve in rebuild):**
- Primary: `hsl(330, 100%, 50%)` (#FF0066)
- Fonts: Playfair Display (headings), Inter (body)
- Light/dark theme via `ThemeContext`
- Visual effects: floating particles, page transitions, scroll reveal

### 1.3 Backend Architecture

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Django ≥4.2 | Monolithic WSGI app |
| API | Django REST Framework | ViewSets + token auth |
| Database | **SQLite** (`db.sqlite3`) | Not production-suitable |
| Auth | DRF `TokenAuthentication` | Not JWT; no refresh tokens |
| Admin | Custom Django AdminSite | Separate from frontend admin stub |
| Static/Media | WhiteNoise + local `media/` | No CDN or image optimization |
| Email | Console (dev) / SMTP Gmail (prod) | Credentials hardcoded in settings |
| Payments | Razorpay Python SDK | Partially wired; model mismatches |

### 1.4 Database Schema (Current)

**User model:** Custom `store.User` (email as `USERNAME_FIELD`).

**Product models:** Split into two parallel tables—not a unified product catalog:
- `Bracelet` — name, description, price, single image/imageUrl, stock, SKU, badge, signature flags, `category_ref` FK
- `Chain` — same shape as Bracelet (used for chains/necklaces, not earrings/bangles)

**Category model:** Hierarchical (`parent` FK), slug, `group` enum limited to **`bracelet` | `chain`** only.

**Cart:** `CartItem` — denormalized (product_id string, name, price, quantity, image_url); no FK to products; no customization snapshot linkage in practice.

**Orders:** `Order` + `OrderItem` — basic fields; order items store `product_type` + `product_id` integers, optional `customization_details` JSON.

**Customization:** `Material`, `ChainType`, `BraceletSize`, `CustomizationOption`, `CustomizedProduct`.

**Reviews:** `ProductReview` — rating, title, comment, `is_verified_purchase`, `is_approved`.

**Other:** `OTP`, `WishlistItem`.

**Not present:** Coupons, tax rules, shipping zones, inventory audit log, admin analytics aggregates, invoice records, refresh tokens, OAuth identities, unified product media (videos), weight/material/care fields.

### 1.5 Authentication System (Current)

| Feature | Status |
|---------|--------|
| Email registration | ✅ Basic (`/api/register/`) |
| Email login | ✅ Token-based (`/api/login/`) |
| Google login | ❌ Not implemented |
| Forgot password | ⚠️ OTP flow (not secure reset link) |
| Reset password | ⚠️ OTP + new password |
| JWT | ❌ Uses DRF opaque tokens |
| Refresh tokens | ❌ |
| Session persistence | ⚠️ Token in localStorage only |
| Password validators | ❌ Disabled (`AUTH_PASSWORD_VALIDATORS = []`) |
| Rate limiting | ❌ |
| Admin role enforcement (frontend) | ❌ Any logged-in user can access `/admin/*` |

### 1.6 Deployment Architecture (Current)

| Component | Current | Target (per vision) |
|-----------|---------|---------------------|
| Frontend | GitHub Pages (static) | Render Static Site |
| Backend | Local dev only (`localhost:8000`) | Render Web Service |
| Database | SQLite file | MongoDB Atlas |
| CI/CD | Frontend-only GitHub Action | Full stack Render deploy |
| API URL (prod) | Defaults to `http://localhost:8000` | Env-configured production API |

**Critical gap:** GitHub Pages cannot run Django. Without a hosted backend, the storefront is a **non-functional demo** in production.

---

## 2. Existing Features

### 2.1 Working or Partially Working (Local Dev)

- **Visual storefront:** Home hero, collection section, products grid, product detail pages
- **Theme toggle:** Light/dark mode with brand colors
- **Product listing:** Fetches bracelets + chains, category/signature filters, client-side search
- **Wishlist:** Backend API + frontend add/remove (when authenticated + backend running)
- **User registration/login:** Token auth with localStorage persistence
- **OTP password reset:** Email OTP in dev (console backend); Twilio SMS optional
- **Contact form API:** Sends email via Django
- **Newsletter subscribe:** Stores email, sends welcome email
- **Django admin:** Product/category/user/order management (server-side)
- **SEO component:** Title, description, OG tags, basic JSON-LD on key pages
- **Responsive layout:** Tailwind breakpoints, mobile navbar menu
- **Customization UI skeleton:** Tabbed panel for materials, sizes, charms, color picker
- **Checkout UI:** Shipping/billing forms, order summary, Razorpay button component
- **Reviews UI:** Display and submit reviews (backend moderation via `is_approved`)

### 2.2 UI/UX Assets to Preserve

- Loading screen with brand animation
- Navbar blur on scroll, Framer Motion transitions
- Product cards with badges (Modern Classic, Bestseller, etc.)
- Magenta accent, Playfair + Inter typography
- Footer, about/contact sections
- shadcn/ui component library (buttons, cards, dialogs, etc.)

---

## 3. Broken Features

### 3.1 Critical Runtime Failures

| Issue | Location | Impact |
|-------|----------|--------|
| `Order.razorpay_order_id` referenced but **field does not exist** on model | `payment_views.py` | Razorpay order creation crashes |
| `Order.tracking_number` referenced but **field does not exist** | `views.py` (update_status) | Order status updates crash |
| `OrderItem.product` referenced but **no FK exists** (only `product_id`) | `payment_views.py` | Payment confirmation email crashes |
| `payment_status = 'completed'` used but model choices are **`paid`** | `payment_views.py` | Invalid enum value saved |
| `CartItem.objects.create(product_type=...)` but **CartItem has no `product_type` field** | `views.py` (add_to_cart) | Customized add-to-cart crashes |
| `MaterialSerializer` fields (`price_per_unit`, `image`) **don't match model** (`price_modifier`, `image_url`) | `serializers.py` | Customization API returns errors |
| `BraceletSizeSerializer` uses `length_cm` but model has **`measurement_inches`** | `serializers.py` | Size API broken |
| `CustomizationOptionSerializer` uses `image` but model has **`image_url`** | `serializers.py` | Options API broken |
| `CustomizedProductSerializer` includes **`updated_at`** but model lacks it | `serializers.py` | Serializer validation failure |

### 3.2 Functional Gaps (UI Exists, Logic Broken/Incomplete)

| Feature | Problem |
|---------|---------|
| **Cart quantity update / remove** | Updates React state only; **no PATCH/DELETE API calls** |
| **Checkout order creation** | POST creates `Order` header but **does not create OrderItems from cart** |
| **Checkout on GitHub Pages** | No backend → all API calls fail |
| **Razorpay flow** | Blocked by missing model fields + empty order items |
| **COD checkout** | Order created but no cart clearing, no inventory deduction |
| **Customization preview** | Returns **placeholder URL** only; no real 2D/3D preview |
| **Customization add to cart** | Backend crash (see above) |
| **Frontend admin dashboard** | Links to `/admin/products`, `/admin/orders`, `/admin/users` — **routes not defined** in `App.tsx` |
| **Admin authorization** | No `is_staff` check; any user reaches admin UI |
| **Verified purchase reviews** | `is_verified_purchase` never set true on create |
| **Review image upload** | Not implemented |
| **Invoice download** | Not implemented |
| **Order invoice PDF** | Not implemented |
| **Global search route** | SEO schema references `/search` — **page does not exist** |
| **Save for later (cart)** | Not implemented (wishlist is separate) |
| **Guest cart persistence** | Cart requires login; no localStorage merge on login |
| **Inventory deduction** | No stock decrement on order/payment |
| **Low stock alerts** | Not implemented |
| **Coupons / taxes** | Not implemented (checkout has flat shipping only) |
| **Refund orders (admin)** | Status exists in model but no refund workflow/API |
| **Google OAuth** | Not implemented |

### 3.3 Deployment / Environment Breaks

- Production frontend calls `http://localhost:8000` unless `VITE_API_BASE_URL` is set at build time
- GitHub Pages deployment **does not build with production API URL**
- `requirements.txt` missing: `django-cors-headers`, `django-filter`, `razorpay`, `twilio`, `Pillow`, `psycopg2`/MongoDB driver, etc.
- Duplicate `CustomAuthToken` class in `views.py` (dead code; URLs use `authentication.py`)
- `UserViewSet`, `BraceletViewSet`, `ChainViewSet` expose **full CRUD with `AllowAny`** — public can create/delete products/users

---

## 4. Security Issues

### 4.1 Critical

| Severity | Issue |
|----------|-------|
| **Critical** | `SECRET_KEY = 'replace-me-with-secure-key'` hardcoded |
| **Critical** | Gmail app password **hardcoded in `settings.py`** (line 54) |
| **Critical** | `DEBUG = True`, `ALLOWED_HOSTS = ['*']` |
| **Critical** | Public write access to products, categories, users via unauthenticated ViewSets |
| **Critical** | OTP returned in API response when email fails (`debug.otp_preview` in DEBUG) |
| **Critical** | No HTTPS enforcement; tokens in localStorage (XSS theft risk) |

### 4.2 High

| Severity | Issue |
|----------|-------|
| **High** | No rate limiting on login, OTP, registration (brute force / OTP spam) |
| **High** | `AUTH_PASSWORD_VALIDATORS = []` — weak passwords allowed |
| **High** | No CSRF protection on token API (acceptable for token auth, but cookies used with `credentials: include` inconsistently) |
| **High** | Razorpay webhook may process events without signature when `RAZORPAY_WEBHOOK_SECRET` empty |
| **High** | User profile readable/updatable by any anonymous user via `/api/users/` |
| **High** | No input sanitization layer beyond DRF serializers |
| **High** | Admin frontend not protected by role |

### 4.3 Medium

| Severity | Issue |
|----------|-------|
| **Medium** | Email credentials in source control |
| **Medium** | No audit logging for admin actions |
| **Medium** | CORS allows GitHub Pages origin but backend not deployed to receive credentialed requests securely |
| **Medium** | OTP stored in plaintext in database |

---

## 5. Performance Issues

| Area | Issue | Impact |
|------|-------|--------|
| **Initial load** | Full-screen loading gate blocks entire app | Poor LCP, hurts Lighthouse |
| **Code splitting** | No `React.lazy` / route-based chunks | Large initial bundle |
| **React Query** | `staleTime: Infinity`, default queryFn broken (uses raw URL join) | Cache misconfiguration; inconsistent data fetching |
| **Images** | No lazy loading, no WebP/srcset, no CDN | Slow product pages |
| **API** | N+1 potential minimal (simple models), but no pagination enforced on product lists | Scale issues with catalog growth |
| **SQLite** | File DB, no connection pooling | Cannot handle concurrent production traffic |
| **Static assets** | Served via WhiteNoise from Django in prod config | Not ideal for global CDN delivery |
| **Duplicate HTTP clients** | `axios`, `fetch`, `apiRequest` in queryClient, unused `api-request.ts` | Maintenance overhead |
| **Framer Motion particles** | Always rendered | Unnecessary main-thread work on low-end mobile |

**Lighthouse target (>90):** Unlikely achievable without addressing loading screen, bundle splitting, image optimization, and backend latency.

---

## 6. Missing Functionality (vs. Production Vision)

### 6.1 Product Catalog

- [ ] Unified product model with category/subcategory
- [ ] Crystal Bead Bracelets, Kundan Stone Earrings, Kundan Stone Bangles as **dynamic admin-managed categories**
- [ ] Sale price, multiple images, videos
- [ ] Weight, material info, care instructions
- [ ] SKU management at scale
- [ ] Full-text search with filters (price, material, color, rating, availability)

### 6.2 Customization Engine

- [ ] Bracelet: bead color/type/size, bracelet size, charms, metal finish, engraving
- [ ] Earrings: stone color/shape, metal finish, hook type
- [ ] Bangles: size, stone color, arrangement, metal finish
- [ ] Live preview: Three.js/R3F **or** layer-based 2D configurator
- [ ] Admin-managed customization configurations per category

### 6.3 Commerce

- [ ] Persistent cart (guest + authenticated merge)
- [ ] Save for later
- [ ] Coupons
- [ ] Tax calculation
- [ ] Configurable shipping charges
- [ ] Razorpay (all payment methods) — end-to-end tested
- [ ] Order tracking, invoice download
- [ ] Refund workflow

### 6.4 Inventory

- [ ] Automatic stock deduction
- [ ] Low stock alerts
- [ ] Admin stock management UI
- [ ] Out-of-stock enforcement at checkout

### 6.5 Admin Dashboard (Frontend)

- [ ] Products CRUD
- [ ] Categories CRUD (unlimited, no code changes)
- [ ] Orders management
- [ ] Inventory
- [ ] Review moderation
- [ ] Coupons
- [ ] Users
- [ ] Analytics (revenue, orders, top products, inventory insights)

### 6.6 Auth

- [ ] Google OAuth
- [ ] JWT + refresh tokens
- [ ] Secure httpOnly cookies option
- [ ] Proper password reset flow (tokenized link)

### 6.7 SEO & Content

- [ ] `sitemap.xml` — **missing**
- [ ] `robots.txt` — **missing**
- [ ] Product structured data (Product schema)
- [ ] Search results page

### 6.8 Testing & Documentation

- [ ] Frontend tests — **zero test files**
- [ ] Backend tests — **empty stubs only**
- [ ] API documentation
- [ ] Architecture documentation
- [ ] Deployment guide for Render + MongoDB Atlas

---

## 7. Technical Debt

### 7.1 Architecture Debt

1. **Dual product models (Bracelet + Chain)** instead of one `Product` collection with `categoryType` — blocks earrings/bangles and creates duplicate logic everywhere.
2. **Category `group` enum hardcoded** to bracelet/chain — prevents unlimited category types without migrations/code changes.
3. **Denormalized cart items** — drift from catalog prices, no customization linkage.
4. **Django monolith serving React** — complicates Render split deployment; GitHub Pages + Django mismatch.
5. **Token auth without refresh** — poor UX and security for long sessions.

### 7.2 Code Quality Debt

1. **Serializer/model field mismatches** — customization and payment modules non-functional.
2. **Mixed data fetching patterns** — React Query configured but bypassed.
3. **Unused dependencies** — `wouter` in package.json while using React Router.
4. **Duplicate files** — `api-request.ts` vs `queryClient.ts` `apiRequest`; duplicate `CustomAuthToken`.
5. **Type safety gaps** — many `any` types in products.tsx, checkout interfaces incomplete.
6. **Currency inconsistency** — UI shows ₹ (INR) in checkout/cart but `$` in customization panel.
7. **Incomplete requirements.txt** — fresh install will fail.
8. **No environment variable strategy** — no `.env.example`.

### 7.3 Data Debt

1. SQLite with no migration path documented to MongoDB.
2. Sample data via management commands only (`populate_products`, `add_user_products`).
3. No seed data for customization options in repo guarantee.

### 7.4 Operational Debt

1. Secrets in source code.
2. No health check endpoint.
3. No structured logging (print statements in payment flow).
4. No monitoring/alerting.
5. Email templates exist for orders but depend on broken order item structure.

---

## 8. Refactoring Recommendations

### 8.1 Strategic Decision: Backend Stack

**Recommendation: Node.js + Express + TypeScript** (preferred per vision)

| Criterion | Node/Express | Keep Django REST |
|-----------|--------------|------------------|
| MongoDB integration | Native (`mongoose` / `mongodb`) | Requires `djongo` or raw PyMongo (unmaintained patterns) |
| Render deployment | Excellent | Good |
| Shared types with React | TypeScript end-to-end | Separate Python types |
| Team alignment with vision | ✅ Preferred | Alternative |

Django can work, but **MongoDB + Render + React** aligns best with **Node/Express**. A full rewrite of the backend is required either way due to schema/model breakage.

### 8.2 Recommended Target Architecture

```
┌─────────────────────┐     HTTPS      ┌──────────────────────┐
│  Render Static Site │ ◄────────────► │  Render Web Service   │
│  React + Vite + RQ  │    REST API    │  Express + TypeScript │
└─────────────────────┘                └──────────┬───────────┘
                                                    │
                                         ┌──────────▼───────────┐
                                         │    MongoDB Atlas      │
                                         │  Products, Orders,    │
                                         │  Users, Customizations  │
                                         └──────────────────────┘
         External: Razorpay · Google OAuth · Email (SendGrid/SES)
                     Cloudinary/S3 for optimized media
```

### 8.3 Phased Rebuild Plan (Recommended)

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| **1** | Audit + Architecture | ✅ This document, `ARCHITECTURE.md` plan |
| **2** | Backend + MongoDB | Express API, schemas, indexes, env config |
| **3** | Auth + Admin | JWT, refresh, Google OAuth, admin RBAC, dashboard shell |
| **4** | Products + Inventory | Unified catalog, dynamic categories, stock management |
| **5** | Customization Engine | Category-specific configs, 2D/3D preview |
| **6** | Checkout + Razorpay | Cart persistence, coupons, tax, shipping, payments |
| **7** | Testing + Deployment | Test suites, Render deploy, `DEPLOYMENT_GUIDE.md` |

### 8.4 Data Model Recommendations (MongoDB)

**Core collections:**
- `users` — credentials, OAuth profiles, addresses, roles
- `categories` — tree structure, `productType` template for customization schema
- `products` — unified document with media array, pricing, inventory, attributes
- `customizationConfigs` — per-category option definitions
- `carts` — userId/sessionId, line items with customization snapshots
- `orders` — full checkout snapshot, Razorpay IDs, status history
- `reviews` — with purchase verification reference
- `coupons` — code, rules, usage limits
- `inventoryLogs` — audit trail

**Indexes:** text search on products, compound on `categoryId + isActive`, `orders.userId + createdAt`, `products.sku` unique.

### 8.5 Frontend Refactoring Priorities

1. **Keep:** `index.css` tokens, layout components, shadcn/ui, page structure, SEO component pattern.
2. **Replace:** Auth with JWT + refresh interceptor; centralize API client.
3. **Add:** Route lazy loading, image `loading="lazy"`, React Query for all server state.
4. **Fix:** Single currency (INR), consistent API error handling.
5. **Build:** Real admin routes under `/admin/*` with role guard.
6. **Implement:** Customization preview (start with 2D layered compositing; upgrade to R3F if assets available).

### 8.6 Security Hardening Checklist

- [ ] Environment-based secrets (Render env vars)
- [ ] Helmet, CORS allowlist, rate limiting (`express-rate-limit`)
- [ ] bcrypt password hashing (cost factor ≥12)
- [ ] JWT access (15m) + refresh (7d) rotation
- [ ] Google OAuth via official library
- [ ] Input validation (Zod backend + frontend)
- [ ] RBAC middleware (`customer`, `admin`)
- [ ] Razorpay webhook signature verification required
- [ ] CSP headers on frontend
- [ ] Remove all secrets from git history before public launch

### 8.7 Preserve vs. Rebuild Matrix

| Component | Action |
|-----------|--------|
| Visual design / CSS tokens | **Preserve** |
| Page layouts & routing structure | **Preserve** (extend) |
| shadcn/ui components | **Preserve** |
| Django backend | **Replace** with Express + MongoDB |
| SQLite schema | **Replace** |
| Token auth | **Replace** with JWT |
| Cart/Order logic | **Rebuild** |
| Customization backend | **Rebuild** |
| GitHub Pages deploy | **Replace** with Render Static Site |
| Django admin | **Replace** with custom admin dashboard |

---

## 9. API Inventory (Current)

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/api/register/` | POST | Public | ⚠️ Works; no validation strength |
| `/api/login/` | POST | Public | ✅ Token issued |
| `/api/send-otp/` | POST | Public | ⚠️ Works; leaks OTP in debug |
| `/api/verify-otp/` | POST | Public | ✅ |
| `/api/reset-password/` | POST | Public | ✅ |
| `/api/bracelets/` | CRUD | Public | ⚠️ Unauthenticated writes |
| `/api/chains/` | CRUD | Public | ⚠️ Unauthenticated writes |
| `/api/categories/` | CRUD | Public | ⚠️ Unauthenticated writes |
| `/api/cart-items/` | CRUD | Auth | ⚠️ Create works; update/delete unused in UI |
| `/api/orders/` | CRUD | Auth | ⚠️ Create incomplete (no items) |
| `/api/reviews/` | CRUD | Mixed | ⚠️ No verified purchase check |
| `/api/wishlist/` | CRUD | Auth | ✅ |
| `/api/materials/` | CRUD | Public | ❌ Serializer broken |
| `/api/chain-types/` | CRUD | Public | ✅ |
| `/api/bracelet-sizes/` | CRUD | Public | ❌ Serializer broken |
| `/api/customization-options/` | CRUD | Public | ❌ Serializer broken |
| `/api/customized-products/` | CRUD | Auth | ❌ Add to cart broken |
| `/api/payments/razorpay/create_order/` | POST | Auth | ❌ Model field missing |
| `/api/payments/razorpay/verify_payment/` | POST | Auth | ❌ Multiple bugs |
| `/api/contact/` | POST | Public | ✅ |
| `/api/newsletter/subscribe/` | POST | Public | ✅ |

---

## 10. Category & Product Gap Analysis

**Business requirement:**
- Crystal Bead Bracelets
- Kundan Stone Earrings
- Kundan Stone Bangles

**Current state:**
- Products split into `Bracelet` and `Chain` models
- Categories limited to `group: bracelet | chain`
- Chains used as proxy for necklaces/chains — **no earring or bangle product type**
- Admin can add categories in Django admin, but product models cannot represent earrings/bangles without code changes
- Frontend customization supports only `bracelet | chain`

**Conclusion:** Dynamic unlimited categories **cannot be achieved** without unified product architecture and category-driven customization schemas.

---

## 11. Testing Status

| Area | Files | Coverage |
|------|-------|----------|
| Frontend unit/integration | 0 | None |
| Backend API | 2 empty stubs (`contact/tests.py`, `newsletter/tests.py`) | None |
| E2E | 0 | None |
| Manual HTML tests in `docs/` | 4 files | Deployment smoke tests only |

---

## 12. Conclusion

The Reyan Luxe project is a **strong UI foundation** attached to an **immature, insecure, and largely non-functional e-commerce backend**. It is suitable as a **design reference** but **not suitable for real sales** without the phased rebuild outlined above.

**Immediate blockers for production:**
1. No hosted backend API
2. Broken payment and order pipelines
3. Broken customization API serializers
4. Hardcoded secrets and open write endpoints
5. Wrong product/category model for the jewelry catalog vision
6. SQLite instead of MongoDB
7. No tests or deployment documentation for Render

**Next step:** Proceed to **Phase 2** — architecture design documents (`ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `API_DOCUMENTATION.md`) and backend rebuild on Express + MongoDB Atlas, preserving the existing visual design language.

---

*End of audit.*
