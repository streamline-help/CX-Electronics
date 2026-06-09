# CW Electronics — Growth Sprint Notes (SEO / Organic Traffic)

_Last updated: 2026-06-09. Phase 1 = SEO foundations. Payments (Yoco/Ozow) deferred until merchant keys exist._

This phase makes the catalogue **discoverable on Google** — both in regular Search (rich product results) and in the free **Google Shopping** listings (Merchant Center). No payment-gateway code was touched.

---

## What shipped

### 1. Product identifiers (`brand` / `gtin` / `mpn`)
- New columns on `products` (migration `cw_add_product_identifiers`).
- **Brands auto-backfilled** from product names where confidently detectable: HiLook, Hikvision, Baofeng (incl. `aofeng`/`UV-5R`/`BF-888S` typos), Andowl, BAIHUO, Jiageng, CJ, V380. **27 of 72** active products got a brand; the other 45 (generic power supplies, cables, tumblers…) stay `NULL` on purpose.
- Editable per-product in **Admin → Products → (edit) → Brand / GTIN / MPN**. Fill these in over time — every GTIN you add strengthens both the feed and Search ranking.

### 2. Google Shopping feed — `https://cw-electronics.co.za/feed.xml`
- Google Shopping **RSS 2.0** (`g:` namespace), one `<item>` per active product.
- Per item: `id`, search-optimised `title` (Brand + name), `description`, `link`, `image_link` (+ up to 10 `additional_image_link`), `availability` (mapped from `stock_status`), `price` in `ZAR`, `condition=new`, `brand`, `gtin`/`mpn` when present, `google_product_category` + `product_type` from the category.
- Products **without** a GTIN/MPN automatically get `g:identifier_exists = no`, so the feed stays valid for generic imports.
- **Submit this URL in Google Merchant Center** → Products → Feeds → Add feed → "Scheduled fetch" → `https://cw-electronics.co.za/feed.xml`.

### 3. Sitemap — `https://cw-electronics.co.za/sitemap.xml`
- Now lists **every active product** (was static pages only). 93 URLs: 9 key pages + 12 category pages + 72 products, each with `lastmod` and product image.
- Already referenced in `robots.txt`. **Submit it in Google Search Console** → Sitemaps (if not already).

### 4. Richer product structured data (JSON-LD)
- `schema.org/Product` on each product page now emits the **real brand** (not a hardcoded "CW Electronics") plus `gtin`/`mpn` when set. Offers block already had `price` (ZAR) + `availability`.
- This is what makes Google trust the feed and show rich product results. Validate with the **Rich Results Test**: https://search.google.com/test/rich-results

### 5. `src/lib/siteConfig.ts`
- Single source of truth for business identity (legal entity, address, phones, email, hours). New SEO/compliance code reads from here. Existing files weren't swept (deliberate — see CLAUDE.md note on the `cxx-*` alias sweep risk).
- ⚠️ `registrationNumber` is a `<<REG_NO>>` placeholder — fill in when known (used by compliance pages).

---

## How the feed + sitemap are generated

`scripts/generate-seo.mjs`, run as the **last step of `npm run build`**:

```
"build": "tsc -b && vite build && node scripts/generate-seo.mjs"
```

- Queries active products + categories from Supabase (anon key, read-only) and writes `dist/sitemap.xml` + `dist/feed.xml`.
- **Why build-time, not a serverless function:** the site is a static SPA on **Netlify**, which serves files that physically exist in the publish dir *before* applying the `/* → /index.html` SPA rewrite. So `/feed.xml` and `/sitemap.xml` resolve directly — zero cold-starts, zero per-request DB load from crawlers. Google re-fetches both on its own schedule, so a fresh copy per deploy is the right pattern.
- **Freshness:** these regenerate on every Netlify deploy. If you change products and want the feed updated without a code change, trigger a redeploy (Netlify → Deploys → Trigger deploy, or a Build Hook). A scheduled daily rebuild can be added later if needed.
- **Resilience:** if Supabase is unreachable at build time, the script logs a warning, writes a static-pages-only sitemap, skips the feed, and **never fails the build**.
- Run locally without deploying: `npm run build` then inspect `dist/feed.xml` / `dist/sitemap.xml`, or `npm run generate-seo` against an existing `dist/`.
- **Env required at build:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (already in Netlify env + local `.env.local`).

---

## Test / verification checklist

- [x] `npm run typecheck` clean
- [x] `npm run build` succeeds and prints `feed.xml: 72 items (0 skipped)`
- [x] `dist/feed.xml` + `dist/sitemap.xml` are well-formed UTF-8 XML
- [ ] **After deploy:** open `https://cw-electronics.co.za/feed.xml` and `https://cw-electronics.co.za/sitemap.xml` in a browser — confirm they return XML, not the SPA HTML
- [ ] Submit `feed.xml` in Google Merchant Center (Scheduled fetch)
- [ ] Confirm sitemap in Google Search Console
- [ ] Run a product page through the Rich Results Test → "Product" detected
- [ ] (Optional) Fill in GTINs on best-selling products via Admin for stronger matching

> Minor caveat: the PWA service worker may serve the SPA shell for `/feed.xml`/`/sitemap.xml` to *returning browser tabs* that have the SW installed. This does **not** affect Googlebot/Merchant crawlers (they don't run service workers), so it has no SEO impact. Verify the raw URLs in a private window if checking manually.

---

## Not done this phase (by request)
- **Yoco / Ozow payment integration** — deferred until merchant accounts + API keys exist. The order pipeline (`place_order` RPC, `payment_method`/`payment_status` columns, admin status transitions) is already in place to plug a gateway into later.
- **Compliance page copy refresh** — `/privacy-policy`, `/refund-policy`, `/shipping-policy`, `/terms` already exist as routed pages; their copy wasn't rewritten this phase.
