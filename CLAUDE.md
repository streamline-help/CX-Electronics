# CW Electronics — Project Context

> This file is the canonical context for AI agents and new contributors working on this codebase. Read it end-to-end before making changes. When something changes substantially (new integration, schema migration, brand rule), update this file in the same PR.

---

## 1. The Business

**CW Electronics** is a direct importer and wholesaler/retailer of consumer electronics based in Johannesburg, South Africa. Trading since 2022.

- **Categories stocked**: CCTV cameras & NVR kits, WiFi routers & networking, USB chargers & cables, solar street lights, smartwatches & wearables, phone/laptop accessories.
- **Customer mix**: walk-in retail, installers, resellers, small businesses. Wholesale tier from 6+ units per product line.
- **Owners / contacts**:
  - **Emily** — 064 953 3333 (primary sales + WhatsApp)
  - **Kevin** — 062 805 8899 (customer support)
  - Shared email: `info@cw-electronics.co.za`
- **Showroom**: **Unit 303**, China Cash and Carry, Cnr Discovery Drive & Renaissance Blvd, **Crown Mines**, Johannesburg, **2092**. (Email/receipt/invoice templates still show the old China Mart / Shop C15 address — only the storefront was updated 2026-05-25.)
- **Trading hours**: Mon–Sun, 09:00–15:00. **Open every day.**
- **Website**: https://cw-electronics.co.za
- **Built by**: Christiaan @ streamline-automations.

---

## 2. What This Site Does

A single React SPA with three audiences:

| Surface | Routes | Audience |
|---|---|---|
| Public storefront | `/`, `/shop`, `/shop/:slug`, `/wholesale`, `/deals`, `/about`, `/terms`, `/cart`, `/checkout`, `/receipt/:id` | Customers (anon + logged-in) |
| Customer account | `/account/login`, `/account/register`, `/account/profile`, `/account/orders`, `/account/orders/:id`, `/account/wishlist` | Registered customers |
| Admin panel | `/admin/login`, `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/messages` | **Single admin** (`info@cw-electronics.co.za`) |

**Key flows**:
- Browse → add to cart → checkout (collection or 3 paid delivery tiers) → place order → receipt + confirmation email → order tracking via `/account/orders/:id`.
- Contact form on `/about` → persists to DB **and** fires n8n webhook.
- Admin manages products (with bulk price changer + EN/中文 toggle), processes orders through status pipeline, replies to customer messages.

---

## 3. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | **React 18 + TypeScript + Vite + Tailwind 3** |
| Routing | react-router-dom v7 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts (admin dashboard) |
| Backend | **Supabase** (Postgres + Auth + Storage) — single project shared across the user's other apps |
| Image hosting | **Cloudinary** (account: `dzhwylkfr`) |
| Payments | **PayFast** (account verification pending — currently bypassed in test mode) |
| Email/automation | **n8n** webhooks |
| SEO meta | react-helmet-async |
| PWA | vite-plugin-pwa (workbox) |
| Compression | vite-plugin-compression (gzip + brotli) |
| Hosting | Static SPA (Netlify-style — `public/_redirects` present) |
| Crypto | crypto-js (used for PayFast signing) |

**Scripts**: `npm run dev`, `npm run build`, `npm run typecheck`, `npm run lint`, `npm run preview`, `npm run seed`.

**Repo**: `streamline-help/CX-Electronics` on GitHub. Main branch: `main`. User: `streamline-autmations` (yes, typo'd handle).

---

## 4. Architecture Decisions Worth Knowing

### 4.1 Dual Supabase clients sharing one auth.users table
- `supabase` — admin client, storage key `cxx-admin-auth`. Used by `/admin/*` and product/order writes.
- `customerSupabase` — customer client, storage key `cw-customer-auth`. Used by `/account/*`.
- Both target the same Supabase project + same `auth.users` table.
- **Why two clients**: a session in one tab/scope doesn't accidentally invalidate the other. Without this, the admin and customer flows fought each other on token refresh.
- `signOut({ scope: 'local' })` is used in BOTH `useAuth.ts` and `CustomerAuthContext.tsx` — this is intentional. Never change it to global scope.

### 4.2 Admin login enforcement (defense in depth)
Admins (currently TWO: `info@cw-electronics.co.za` and `martin@cw-electronics.co.za`):
1. **Allow-list** — `src/lib/adminEmails.ts` defines `ADMIN_EMAILS`. To add/remove an admin: edit this array (layers 2–4 all read from it).
2. **Pre-auth client gate** — `src/pages/admin/Login.tsx` rejects non-allow-listed emails BEFORE calling Supabase auth (saves round-trip + log noise).
3. **Post-auth client re-check** — same file re-verifies after auth in case the server returned a different email.
4. **Route protection** — `src/components/admin/ProtectedRoute.tsx` blocks `/admin/*` unless `useAuth().user.email` matches the allow-list.
5. **Server-side RLS** — admin write/read access is gated by the SQL helper `public.is_cw_admin()` (`lower(auth.jwt()->>'email') IN ('info@cw-electronics.co.za','martin@cw-electronics.co.za')`). It governs the `*_admin_all` policies on `orders`, `customers`, `order_items`, `order_status_events`. `cw_contact_messages` still uses its own admin policy.

**If a new admin is added, ALL FOUR places must be updated: (a) create the Supabase `auth.users` user with `email_confirm`, (b) add the email to `ADMIN_EMAILS`, (c) add the email to the `IN (...)` list in `is_cw_admin()`. There is NO `profiles` table — access is purely the JWT email check, so no profiles row is needed.**

### 4.3 Customer sign-ups stay OPEN
Any visitor can register at `/account/register` to track orders + use the wishlist. This is intentional — do NOT disable Supabase auth signups, that would break customer registration. The defense against customer accounts accessing admin data is RLS, not signup gating.

### 4.4 PayFast is bypassed — manual EFT flow via `place_order` RPC
- `src/pages/store/Checkout.tsx#handleSubmit` calls the `public.place_order(payload jsonb)` Postgres RPC. It does NOT write tables directly and does NOT redirect to PayFast.
- `place_order` is **SECURITY DEFINER**: upserts the customer by email, creates the order + items + first `pending` status event atomically, and returns `{ order_id, order_number, customer_id }`. Orders start `status='pending'`, `payment_status='unpaid'`, `payment_method='eft'`, `payment_reference = order_number`. The unique `CW-YYYY-NNNN` number is generated server-side.
- **Why an RPC**: table RLS has no anon SELECT, so the old `insert().select()` returned nothing for guests and every guest checkout silently "failed" (0 `CW-` orders ever reached the DB). The definer RPC is the single trusted write path for both guests and logged-in customers.
- Admin confirms the EFT in `/admin/orders/:id` ("Mark as Paid" → `markOrderPaid`), flipping `payment_status='paid'` + `status='processing'` and firing the receipt email.
- **Switch back to PayFast**: re-introduce `redirectToPayFast(...)` from `src/lib/payfast.ts` in `handleSubmit` (or branch on `paymentMethod`); `place_order` can remain the order-creation primitive.

### 4.5 Bilingual admin (EN / 中文)
- **Admin only.** Storefront is English-only (Chinese product names exist in DB as a fallback but the storefront `useLang` defaults to English).
- `src/context/AdminLangContext.tsx` — admin-only language context, persisted to `localStorage['cw-admin-lang']`.
- Use `const { t } = useAdminLang()` and `t('keyName')` for every admin label.
- **Never hardcode "Orders 订单"** style mixes — they ignore the toggle. If a key is missing, add it to the `ADMIN_TRANSLATIONS` const.
- Toggle lives in the admin sidebar (desktop) + top bar (mobile).

### 4.6 Wholesale pricing model
- `src/lib/wholesale.ts` — uniform 6+ unit minimum, deterministic 15–25% discount per product (hash-seeded by product id so it's stable across renders).
- `bulk_price` column in `products` table overrides the hash-calculated price when present.
- Wholesale qty is uniform (`WHOLESALE_MIN_QTY = 6`) — the `bulk_min_qty` column is ignored by the wholesale view but admins can still set it.

### 4.7 No free shipping, no VAT
- Flat-rate per delivery method. Cart shows "Calculated at checkout" — shipping is only added on the checkout page once a method is selected.
- `src/lib/cart.ts` — `CartState.shippingFee` is always 0 in cart context. The checkout adds method-specific fees at submit time.
- VAT removed from all invoices/receipts. The "Not a tax invoice" footer in `generateReceipt.ts` is required (CW isn't VAT-registered).

### 4.8 Order status pipeline
```
pending → paid → processing → packed → ┬ out_for_delivery → delivered      (delivery)
                                       └ ready_for_collection → collected  (collection)
                                       cancelled (any stage)
```
- `fulfillment_type` on the order row determines which branch.
- `notifyStatusChange()` in `src/lib/webhooks.ts` fires the right email template per transition.
- Status events are logged to `order_status_events` for the admin order timeline.

---

## 5. Routing Map

See `src/App.tsx` — full route table. Key things:

- **Lazy-loaded**: all `/admin/*`, all `/account/*`. Never bundled with the public store (keeps initial load fast).
- **Eager-loaded**: home, shop, product detail, cart, checkout, deals, about, terms (the high-traffic public paths).
- **`/bulk` → `/wholesale`** redirect (legacy URL).
- **`/contact` → `/about`** (contact form lives at bottom of About page).
- **`/returns` → `/terms`** (no separate returns page).
- **Catch-all** `*` redirects to `/`.

---

## 6. Data Model (Public Schema)

The Supabase project is multi-tenant — used by several apps. Tables relevant to CW Electronics:

| Table | Purpose | Notable columns |
|---|---|---|
| `products` | Catalogue | `name`, `name_zh`, `description`, `description_zh`, `retail_price`, `bulk_price`, `bulk_min_qty`, `stock_status`, `featured`, `active`, `images` (jsonb array of urls), `specifications` (jsonb), `variants` (jsonb), `slug`, `thumbnail_url`, `category_id`, `variant_group_id` |
| `categories` | Product taxonomy | `name`, `name_zh`, `slug`, `display_order`, `active` |
| `product_variant_groups` | Multi-variant groupings (e.g. colour/size) | `slug`, `name` |
| `orders` | Order header | `order_number` (CW-YYYY-NNNN), `customer_id`, `user_id`, `order_type` (retail/bulk), `status`, `fulfillment_type`, `subtotal`, `shipping_fee`, `total`, `shipping_address` (jsonb), `payment_method`, `payment_status`, `payment_reference`, `notes` |
| `order_items` | Line items | `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `line_total`, `thumbnail_url` |
| `order_status_events` | Audit trail for status changes | `order_id`, `status`, `triggered_by` (admin/system/payment_gateway), `created_at` |
| `customers` | Customer profile (separate from auth.users) | `name`, `email`, `phone`, `address_*`, `city`, `province`, `postal_code` |
| ~~`profiles`~~ | **Removed** — does not exist. Admin access is the JWT email check in `is_cw_admin()`, not a role column. | — |
| `cw_contact_messages` | Contact form inbox | `name`, `email`, `phone`, `inquiry_type`, `message`, `read`, `replied_at`, `created_at` |
| `wishlist` | Per-user saved products | `user_id`, `product_id` |

**RLS-relevant rules** (current, enforced):
- `products` — public read (`products_public_read`), admin write (`is_cw_admin()`).
- `orders`, `customers`, `order_items`, `order_status_events` — **no anon access**. Admin (`is_cw_admin()`) has full ALL. Authenticated customers can SELECT **only their own** rows, scoped by `lower(email) = lower(auth.jwt()->>'email')` (orders/items/events join through `customers`). There is no anon INSERT — all order creation goes through the SECURITY DEFINER `place_order()` RPC (granted to `anon` + `authenticated`).
- `cw_contact_messages` — anon INSERT (public contact form), admin SELECT/UPDATE/DELETE only.
- `wishlist` — own-row only: `auth.uid() = user_id` (`wishlist_own_all`).
- Helpers: `public.is_cw_admin()` (admin email check), `public.place_order(jsonb)` (atomic order creation). Both SECURITY DEFINER.

**⚠️ Loose policies elsewhere**: other shared-app policies may exist on this multi-tenant project and predate CW Electronics. Don't touch policies outside the CW tables above without confirming impact first.

---

## 7. Brand & Design System

### Colours (locked — do not add new ones)
- **Red** `#E63939` — primary accent. Hover: `#C82020`. Tint backgrounds: `#FEE9E9` (`bg-cxx-blue-light`).
- **Navy** `#0F172A` — dark surface (admin shell, hero, footer).
- **Light bg** `#F8FAFC` — page backgrounds.
- Neutral grays via Tailwind defaults.

### Tailwind alias gotcha
`tailwind.config.js` has legacy aliases from the old brand name (CXX → CW):
- `cxx-blue` is actually `#E63939` (red). **It is NOT blue.**
- `cxx-navy` is `#000000` (black). The storefront uses `#0F172A` literal everywhere instead.
- `cw.*` aliases are the new canonical names but most of the codebase still uses `cxx.*`.

**Rule**: when in doubt, use the hex literal (`bg-[#E63939]`) rather than `cxx-blue`. The aliases work but mislead readers.

### Typography
- Family: Inter (loaded from Google Fonts).
- Headings: `font-extrabold tracking-tight` + `text-balance` for natural wrapping.
- Body: `text-pretty` for long-form, `leading-relaxed` for paragraphs.

### Animation language (cohesive — apply consistently)
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)` (cubic-out, premium feel). Avoid bouncy springs except for tiny micro-interactions (cart shake, count badges).
- **Hover lift**: `-4px` translate, never more.
- **Hover scale**: 1.03–1.05 max.
- **Reveal duration**: 0.4–0.6s.
- **Hover transition**: 0.2–0.3s.
- **Stagger delay**: 0.04–0.08s between siblings, cap at 0.4s.
- **Whitelisted effects**: image sheen sweep, magnetic CTA (`MagneticButton`), scroll-progress bar, glass-blur navbar on scroll.
- **Forbidden**: bounce-in entries, sparkle effects, cursor trails, particle effects, auto-playing video bgs, scroll-jacking.

### Components worth reusing
- `<SEO>` — every top-level page wraps in this (`src/components/SEO.tsx`).
- `<MagneticButton>` — primary CTAs that should "pull" toward the cursor on desktop.
- `<ProductCardLight>` — used on home/related (white card).
- `<ProductCard>` — used on shop/wholesale grids (dark card).
- `<ScrollProgress>` — auto-mounted in `App.tsx`.
- `<Navbar>` + `<Footer>` — every public page.
- `<CategoryGrid>` — category browser with cards or chips variant.

---

## 8. Business Rules (Source of Truth)

| Rule | Value | Where enforced |
|---|---|---|
| Trading hours | Mon–Sun 09:00–15:00, open every day | `index.html` schema, Home, Footer, About, Terms, OrderDetail emails |
| Address | Unit 303, China Cash and Carry, Cnr Discovery Drive & Renaissance Blvd, Crown Mines, JHB, 2092 | Footer, Checkout (collection), About, Home, schema.org (storefront). NOTE: emails/receipts/invoices still carry the old China Mart address — not yet migrated. |
| WhatsApp number | `27649533333` (Emily) | Navbar, Footer, Home, About, Terms, ProductDetail, Deals, BulkShop, BulkProductDetail, ProductDetailWholesale |
| Phone numbers | Emily 064 953 3333 / Kevin 062 805 8899 | Footer, Home, About, receipts |
| Email | info@cw-electronics.co.za | All |
| Wholesale minimum | **6 units** per product line | `src/lib/wholesale.ts` constant `WHOLESALE_MIN_QTY` |
| Wholesale discount | 15–25% (hash-seeded per product) | `src/lib/wholesale.ts` |
| Return window | 7 days from delivery | `Terms.tsx`, FAQ schema in `index.html` |
| VAT | NOT VAT-registered — never display VAT on invoices | `generateReceipt.ts`, `OrderInvoice.tsx`, all invoice templates |
| Free shipping | NONE — flat-rate per method | `Checkout.tsx` `DELIVERY_OPTIONS` |
| Delivery methods | Collection (free), Economy R100, Next Day R150, Overnight R300 | `Checkout.tsx` |
| Order number format | `CW-YYYY-NNNN` (e.g. `CW-2026-4821`) | `Checkout.tsx#generateOrderNumber` |
| Payment reference format | `CW-{Date.now()}` | `Checkout.tsx` |
| Admin emails | `info@cw-electronics.co.za`, `martin@cw-electronics.co.za` | `src/lib/adminEmails.ts` + `is_cw_admin()` |

---

## 9. Integrations

### 9.1 Supabase
- URL: from `VITE_SUPABASE_URL` env var.
- Anon key: `VITE_SUPABASE_ANON_KEY`.
- Migrations are applied via the Supabase MCP / dashboard, not from local files (no `supabase/migrations/` folder in this repo apart from edge functions).
- Edge function: `supabase/functions/payfast-itn/` (PayFast Instant Transaction Notification — currently dormant).

### 9.2 Cloudinary
- **Marketing account: `dzhwylkfr`** — all hero images, category banners, logo, and originally-imported product images live here. These are stored in the DB as full https URLs and keep working forever via `getProductImageUrl()`.
- **New product-upload account: `oiuiyrdu`** — as of 2026-05-25, every NEW image uploaded from the admin Product form (`src/pages/admin/ProductForm.tsx`) goes here, via the unsigned upload preset `cw_products` (uploads land in the `cw-products/` folder). See `src/lib/cloudinary.ts`. Overridable with `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET`.
- **The returned `secure_url` (full https link) is stored directly in `products.images`.** `getProductImageUrl()` (`src/lib/supabase.ts`) passes any full URL through unchanged, so all three image generations coexist with zero migration: (1) old `dzhwylkfr` Cloudinary URLs, (2) legacy Supabase Storage paths uploaded before this change, (3) new `oiuiyrdu` Cloudinary URLs.
- **Never put the Cloudinary API secret in frontend code** — unsigned uploads only need the cloud name + preset.
- **Known issue**: marketing (`dzhwylkfr`) and product (`oiuiyrdu`) assets are now on separate accounts; older imported product images still sit on the marketing account.

### 9.3 PayFast
- `src/lib/payfast.ts` — signing + redirect logic.
- `supabase/functions/payfast-itn/` — server-side ITN verification edge function.
- **Status**: merchant account not yet verified. `Checkout.tsx` bypasses PayFast and writes orders directly to Supabase as `paid`. Re-enable by restoring the `redirectToPayFast(...)` call.

### 9.4 n8n webhooks
- `src/lib/webhooks.ts` — three webhook URLs read from env:
  - `VITE_N8N_NEW_ORDER` — fires on order placement (sends to customer + owner).
  - `VITE_N8N_STATUS_CHANGE` — fires on every status transition (sends customer status email + receipt HTML on `paid`).
  - `VITE_N8N_SIGNUP` — fires on customer registration (welcome email).
- All webhooks are fire-and-forget — failures never block the user flow.
- n8n receives both raw order payload AND pre-rendered HTML for emails (rendered by `src/emails/index.ts`).

### 9.5 Google Analytics
- `index.html` includes `G-P604EFLKN9` gtag. No further custom events wired.

---

## 10. Coding Conventions

- **Use the dedicated tools** — `Read`/`Edit`/`Glob`/`Grep` over shell equivalents.
- **Never amend commits** unless explicitly asked — create new commits.
- **No `--no-verify`** on git commits; if a hook fails, fix the underlying issue.
- **No new colours.** Stick to red/navy/white + Tailwind neutrals.
- **Use `MagneticButton`** for big primary CTAs on desktop-relevant pages.
- **Use `t()` everywhere** in admin pages (`useAdminLang`); never hardcode mixed-language strings.
- **Use `getProductImageUrl()`** when displaying product images — handles both Supabase storage paths and external Cloudinary URLs.
- **Order numbers**: always `CW-{year}-{seq}` format.
- **Address**: copy-paste the exact 4-line address — `Unit 303, China Cash and Carry / Cnr Discovery Drive & Renaissance Blvd / Crown Mines, Johannesburg / 2092`.
- **Trading hours**: always "Mon–Sun 09:00–15:00" (open every day). Never "Mon–Sat" or "closed Sundays".
- **WhatsApp number**: `27649533333` (no leading +). Phone hrefs use `+27649533333`.
- **Animation easing**: `cubic-bezier(0.22, 1, 0.36, 1)` — match existing patterns.
- **Comments**: minimal. Only when *why* is non-obvious. Never explain what the code does — names should do that.

### Don't do
- Don't add new admin emails to `adminEmails.ts` without also updating `profiles.app_role`.
- Don't change `signOut({ scope: 'local' })` to global — it cascades through both admin and customer sessions.
- Don't introduce fake testimonials, "trusted by X companies" without proof, or unverifiable stats.
- Don't rename `cxx-blue` / `cxx-navy` aliases in a single sweep — they're used in ~80 places. Plan a focused PR if/when this needs cleanup.
- Don't add VAT to invoices/receipts.
- Don't add "free shipping over R-X" — there's no free shipping.

---

## 11. Known WIP / Tech Debt

1. **PayFast is bypassed** — restore one-line `redirectToPayFast()` call in `Checkout.tsx#handleSubmit` once the merchant account is verified.
2. **`cxx-blue` / `cxx-navy` naming** — confusingly named Tailwind aliases (red and black, not blue and navy). Works but misleads readers. Plan a sweep when stable.
3. **Stock photo on About page** — `src/pages/store/About.tsx` uses an Unsplash placeholder for the "warehouse" image. Replace with a real photo of the China Mart shopfront when available.
4. **Home stats** — "10,000+ orders / 500+ traders / 4.9★" claims aren't backed by a source. Trim or link to verifiable data when possible.
5. **Multi-tenant Supabase project** — shared with other apps the user maintains. Some loose policies on shared tables (`orders_read_all = true`) exist but are not owned by CW Electronics. Don't touch without confirming impact.
6. **Cloudinary single-account** — would benefit from splitting marketing vs product assets.
7. **Unverified phone format** — phone numbers display as "064 953 3333" in some places, "+27 64 953 3333" in others. Pick one canonical format.
8. **Admin access = JWT email only** — there is NO `profiles` table anymore. Admin RLS is enforced solely by `public.is_cw_admin()` (JWT email ∈ allow-list). Adding an admin = create the auth user + add the email to BOTH `adminEmails.ts` and the `is_cw_admin()` `IN (...)` list. (Earlier docs referenced a `profiles.app_role` row — that table no longer exists.)

---

## 12. Important File Map

```
src/
├── App.tsx                          # Route table (all routes here)
├── main.tsx
├── index.css                        # Tailwind + mobile-zoom-prevention rules
├── components/
│   ├── SEO.tsx                      # Per-page meta + structured data wrapper
│   ├── admin/
│   │   ├── AdminLayout.tsx          # Sidebar + bottom nav + LangToggle + unread badge
│   │   └── ProtectedRoute.tsx       # Admin email allow-list gate
│   └── store/
│       ├── Navbar.tsx               # Scroll-aware glass nav
│       ├── Footer.tsx
│       ├── CartDrawer.tsx           # Slide-in cart with upsells + trust strip
│       ├── CartFAB.tsx              # Floating cart button
│       ├── NavbarSearch.tsx         # Live autocomplete search
│       ├── ProductCard.tsx          # Dark variant (Shop/Wholesale grids)
│       ├── ProductCardLight.tsx     # White variant (Home/Related)
│       ├── MagneticButton.tsx       # Premium magnetic CTA
│       ├── ScrollProgress.tsx       # Global scroll indicator (red gradient)
│       ├── ExitIntentPopup.tsx      # Desktop-only exit-intent modal
│       └── ...
├── context/
│   ├── CartContext.tsx              # Cart state + persistence
│   ├── CustomerAuthContext.tsx      # Customer session (customerSupabase client)
│   ├── LangContext.tsx              # Storefront language (English default)
│   ├── AdminLangContext.tsx         # Admin EN/中文 toggle (separate from storefront)
│   └── WishlistContext.tsx
├── hooks/
│   ├── useAuth.ts                   # Admin auth (supabase client)
│   ├── useOrders.ts                 # Order list + getOrder + updateStatus + deleteOrder
│   ├── useProducts.ts
│   ├── useProduct.ts
│   └── useCategories.ts
├── lib/
│   ├── supabase.ts                  # Admin Supabase client + types
│   ├── customerAuth.ts              # Customer Supabase client (separate storage)
│   ├── adminEmails.ts               # Admin allow-list (SINGLE SOURCE)
│   ├── cart.ts                      # Cart shape (subtotal-only, no shipping until checkout)
│   ├── wholesale.ts                 # 6+ min, 15–25% hash-seeded discount
│   ├── payfast.ts                   # PayFast signing (currently bypassed)
│   ├── cloudinary.ts                # Unsigned Cloudinary upload for new admin product images (account oiuiyrdu)
│   ├── webhooks.ts                  # n8n event dispatchers
│   ├── generateReceipt.ts           # HTML receipt template (used for print + emails)
│   ├── translations.ts              # Storefront translations
│   └── categoryIcons.ts             # Slug → Lucide icon map
├── emails/
│   └── index.ts                     # All customer + owner email HTML templates
├── pages/
│   ├── store/                       # Public pages
│   ├── account/                     # Customer account pages
│   ├── admin/                       # Admin panel pages
│   └── invoices/                    # Print-only invoice templates
└── vite-env.d.ts
public/
├── sitemap.xml                      # Static sitemap (manual list — update when routes change)
├── robots.txt                       # Blocks /admin, /checkout, /account, etc.
└── _redirects                       # Netlify SPA fallback
index.html                           # Schema.org (LocalBusiness + FAQPage + BreadcrumbList) + OG/Twitter
tailwind.config.js                   # Brand colour aliases
```

---

## 13. Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | yes | Supabase anon key |
| `VITE_PAYFAST_MERCHANT_ID` | only when PayFast live | PayFast merchant id |
| `VITE_PAYFAST_MERCHANT_KEY` | only when PayFast live | PayFast merchant key |
| `VITE_PAYFAST_PASSPHRASE` | only when PayFast live | PayFast passphrase |
| `VITE_N8N_NEW_ORDER` | optional | Webhook URL for new orders |
| `VITE_N8N_STATUS_CHANGE` | optional | Webhook URL for order status changes |
| `VITE_N8N_SIGNUP` | optional | Webhook URL for new customer signup |
| `VITE_CLOUDINARY_CLOUD_NAME` | optional | Cloudinary cloud name for new admin image uploads (defaults to `oiuiyrdu` in `src/lib/cloudinary.ts`) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | optional | Unsigned Cloudinary upload preset (defaults to `cw_products`) |

Webhooks fail silently if not configured — features that depend on them (welcome email, order confirmation email) just skip.

---

## 14. Quick Reference — Common Tasks

**Add / change an admin**:
1. Create the Supabase `auth.users` user (Auth admin API with `email_confirm: true`, or dashboard).
2. Add the email to `src/lib/adminEmails.ts` → `ADMIN_EMAILS`.
3. Add the email to the `IN (...)` list inside `public.is_cw_admin()` (otherwise they pass the client gate but RLS blocks all data). There is NO `profiles` table to update.

**Re-enable PayFast**:
1. Verify merchant account.
2. In `src/pages/store/Checkout.tsx#handleSubmit`, replace the direct `supabase.from('orders').insert(...)` block with `redirectToPayFast({...})` from `src/lib/payfast.ts`.
3. Ensure the `payfast-itn` edge function is deployed and the env vars are set.

**Add a product category**:
1. Add row to `categories` table via Supabase.
2. Add a Lucide icon mapping in `src/lib/categoryIcons.ts`.
3. (Optional) Add a featured tile entry in `src/pages/store/Home.tsx#CATEGORIES` for the homepage feature row.
4. Add to `public/sitemap.xml` so it's indexed.

**Run locally**:
```bash
npm install
npm run dev          # Vite dev server (port 5173 default)
npm run typecheck    # TS check, no build
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview the built site
```

**Apply a Supabase migration**:
- Use the Supabase MCP (`apply_migration` tool) or paste into Supabase SQL editor.
- The local repo doesn't have a `supabase/migrations/` folder — migrations live in the remote project. Document migrations in this CLAUDE.md when applied.

**Recent migrations applied via MCP** (latest first):
- `2026-05-22 cw_add_martin_admin` — `is_cw_admin()` now matches both `info@` and `martin@cw-electronics.co.za` (was a single hardcoded email). Second admin user created in `auth.users`.
- `2026-05-18 cw_wishlist_table` — created `wishlist` (user_id→auth.users, product_id→products, unique) with own-row RLS.
- `2026-05-18 cw_tighten_rls_popia` — replaced `auth.role()='authenticated'` admin_all policies with `is_cw_admin()` + own-row SELECT on orders/customers/order_items; enabled RLS on `order_status_events`; dropped now-unused `*_anon_insert` policies (checkout uses the RPC).
- `2026-05-18 cw_place_order_rpc` — added SECURITY DEFINER `place_order(jsonb)` (atomic guest/customer checkout) and `is_cw_admin()` helper.
- `2026-05-12 cw_lock_admin_and_messages` — restricted `cw_contact_messages` SELECT/UPDATE/DELETE to admin only.

---

## 15. Recent Major Changes (rolling log)

Keep this short — only "what changed AND why future you needs to know". For full history use `git log`.

- **2026-05-12** — Visual polish (round 2): scroll-progress bar, scroll-aware glass navbar, hero grain texture, premium product card hover (sheen + sliding red fill), horizontal scroll-snap Best Sellers, `MagneticButton` primary CTAs. Admin login dark-branded, pre-auth rejection added. Supabase RLS lockdown on `cw_contact_messages`. Warehouse photo swapped to Unsplash stock with Cloudinary fallback.
- **2026-05-12** — Sweep round 1: fixed Mon-Sun → Mon-Sat across 7 files, replaced placeholder WhatsApp number across 8 files, schema.org phone/postal corrections, FAQPage + BreadcrumbList schemas added, sitemap upgraded, mobile sticky add-to-cart bar, broken cart-drawer upsell links fixed (`/product/` → `/shop/`), admin unread message badge, bilingual admin properly wired.
- **2026-05-12** — Earlier: site-wide CXX → CW rebrand, China Mart Crown Mines address fix, Mon-Sat hours, real `CW-YYYY-NNNN` order numbers, EN/中文 admin toggle, bulk price changer toolbar, customer session persistence fix, messages inbox, customer search by name/email/phone, fake products removed from Deals page, no free shipping / no VAT, wholesale min 6 units, iOS Safari 16px input rule.

---

## 16. Person/Account Contacts (operational, not commercial)

| Role | Detail |
|---|---|
| **Site owner / build lead** | Christiaan @ streamline-automations |
| **GitHub** | `streamline-help/CX-Electronics` (main branch) |
| **Supabase project** | Shared multi-tenant — owner `streamline-help` org |
| **Cloudinary** | account `dzhwylkfr` |
| **Single admin login** | `info@cw-electronics.co.za` (Emily/Kevin shared) |
| **PayFast merchant** | Pending verification |

---

*Last updated: 2026-05-12. Update this file when business rules, integrations, or architectural decisions change.*
