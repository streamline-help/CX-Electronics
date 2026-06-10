/**
 * Build-time SEO asset generator for CW Electronics.
 *
 * Runs as the last step of `npm run build` (after `vite build`) and writes:
 *   dist/sitemap.xml  — every active product + category + key static page
 *   dist/feed.xml     — Google Shopping RSS 2.0 product feed (g: namespace)
 *
 * Why build-time (not a serverless route): the site is a static SPA on Netlify.
 * Netlify serves files that physically exist in the publish dir BEFORE applying
 * the `/* -> /index.html` SPA rewrite, so these files resolve directly with zero
 * cold-starts and zero per-request DB load from Googlebot/Merchant crawlers.
 * Google Merchant Center & Search re-fetch on their own schedule; a fresh file
 * on every deploy is the recommended pattern.
 *
 * Resilience: this script NEVER fails the build. If Supabase is unreachable it
 * logs a warning, writes a static-pages-only sitemap, skips the feed, and exits 0.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://cw-electronics.co.za'
const DIST = join(process.cwd(), 'dist')

// Static, indexable pages (no cart/checkout/account/admin — those are robots-blocked).
const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/shop', changefreq: 'daily', priority: '0.9' },
  { path: '/wholesale', changefreq: 'weekly', priority: '0.8' },
  { path: '/deals', changefreq: 'daily', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/shipping-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/refund-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
]

// category slug -> Google product taxonomy path (best-effort).
const GOOGLE_CATEGORY = {
  cctv: 'Electronics > Surveillance & Smart Home Electronics > Surveillance Camera Systems > Surveillance Cameras',
  routers: 'Electronics > Networking > Wireless Routers',
  cables: 'Electronics > Electronics Accessories > Cables',
  accessories: 'Electronics > Electronics Accessories',
  tools: 'Hardware > Tools',
  household: 'Home & Garden > Household Supplies',
  automobile: 'Electronics > Vehicle Electronics',
}

const AVAILABILITY = {
  in_stock: 'in_stock',
  out_of_stock: 'out_of_stock',
  on_order: 'backorder',
}

// ---------------------------------------------------------------------------
// env loading (no dotenv dependency) — Netlify provides these as real env vars;
// locally we read .env.local / .env so the script works during `npm run build`.
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = join(process.cwd(), file)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.]+)\s*=\s*(.*?)\s*$/)
      if (!m) continue
      const key = m[1]
      let val = m[2]
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      if (!(key in process.env)) process.env[key] = val
    }
  }
}

// ---------------------------------------------------------------------------
const xml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

function imageUrl(raw) {
  if (!raw) return null
  if (raw.startsWith('http://')) return 'https:' + raw.slice(5)
  if (raw.startsWith('https://')) return raw
  if (raw.startsWith('/')) return SITE_URL + raw
  // legacy Supabase Storage path in the `products` bucket
  const base = process.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
  return base ? `${base}/storage/v1/object/public/products/${raw}` : null
}

function firstImage(p) {
  const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : []
  return imageUrl(imgs[0] || p.thumbnail_url)
}

function extraImages(p) {
  const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : []
  return imgs.slice(1, 11).map(imageUrl).filter(Boolean)
}

// Title formula: Brand + Product name, deduped, capped at Google's 150 chars.
function feedTitle(p) {
  let t = (p.name || '').replace(/\s+/g, ' ').trim()
  if (p.brand) {
    const re = new RegExp('\\b' + p.brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i')
    if (!re.test(t)) t = `${p.brand} ${t}`
  }
  if (t.length > 150) t = t.slice(0, 149).replace(/\s+\S*$/, '') + '…'
  return t
}

function feedDescription(p) {
  let d = (p.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!d) d = feedTitle(p)
  if (d.length > 4990) d = d.slice(0, 4990)
  return d
}

function tag(name, value) {
  return value == null || value === '' ? '' : `    <${name}>${xml(value)}</${name}>\n`
}

// ---------------------------------------------------------------------------
function buildSitemap(products, categories, today) {
  const urls = []
  const push = (path, changefreq, priority, lastmod, image) => {
    urls.push(
      `  <url>\n` +
        `    <loc>${xml(SITE_URL + path)}</loc>\n` +
        (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '') +
        `    <changefreq>${changefreq}</changefreq>\n` +
        `    <priority>${priority}</priority>\n` +
        (image ? `    <image:image><image:loc>${xml(image)}</image:loc></image:image>\n` : '') +
        `  </url>`,
    )
  }

  for (const s of STATIC_PAGES) push(s.path, s.changefreq, s.priority, today)
  // Only index category landing pages that actually have products (avoid thin/soft-404 pages).
  for (const c of categories) push(`/category/${c.slug}`, 'weekly', '0.7', today)
  for (const p of products) {
    const lastmod = (p.updated_at || p.created_at || '').slice(0, 10) || today
    push(`/shop/${p.slug}`, 'weekly', '0.7', lastmod, firstImage(p))
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    urls.join('\n') +
    `\n</urlset>\n`
  )
}

function buildFeed(products, catBySlugName) {
  const items = []
  let skipped = 0

  for (const p of products) {
    const img = firstImage(p)
    const price = Number(p.retail_price)
    if (!p.slug || !img || !price || price <= 0) {
      skipped++
      continue
    }

    const cat = p.category_id ? catBySlugName.byId[p.category_id] : null
    const catSlug = cat?.slug?.toLowerCase()
    const hasIdentifier = Boolean(p.gtin || p.mpn)

    let body = ''
    body += tag('g:id', p.id)
    body += tag('g:title', feedTitle(p))
    body += tag('g:description', feedDescription(p))
    body += tag('g:link', `${SITE_URL}/shop/${p.slug}`)
    body += tag('g:image_link', img)
    for (const extra of extraImages(p)) body += tag('g:additional_image_link', extra)
    body += tag('g:availability', AVAILABILITY[p.stock_status] || 'in_stock')
    body += tag('g:price', `${price.toFixed(2)} ZAR`)
    body += tag('g:condition', 'new')
    body += tag('g:brand', p.brand)
    body += tag('g:gtin', p.gtin)
    body += tag('g:mpn', p.mpn)
    if (!hasIdentifier) body += tag('g:identifier_exists', 'no')
    if (catSlug && GOOGLE_CATEGORY[catSlug]) body += tag('g:google_product_category', GOOGLE_CATEGORY[catSlug])
    if (cat?.name) body += tag('g:product_type', cat.name)

    items.push(`  <item>\n${body}  </item>`)
  }

  const feed =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `<channel>\n` +
    `  <title>CW Electronics — Product Feed</title>\n` +
    `  <link>${SITE_URL}</link>\n` +
    `  <description>Wholesale &amp; retail electronics — CCTV, networking, power supplies, accessories.</description>\n` +
    items.join('\n') +
    `\n</channel>\n</rss>\n`

  return { feed, count: items.length, skipped }
}

// ---------------------------------------------------------------------------
async function main() {
  loadEnv()
  if (!existsSync(DIST)) mkdirSync(DIST, { recursive: true })

  // ISO date without time-of-day (Date.now is allowed in plain node scripts).
  const today = new Date().toISOString().slice(0, 10)

  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.warn('[generate-seo] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing — writing static-only sitemap, skipping feed.')
    writeFileSync(join(DIST, 'sitemap.xml'), buildSitemap([], [], today))
    return
  }

  const supabase = createClient(url, key)

  const [{ data: products, error: pErr }, { data: categories, error: cErr }] = await Promise.all([
    supabase
      .from('products')
      .select('id, slug, name, description, brand, gtin, mpn, retail_price, images, thumbnail_url, stock_status, category_id, updated_at, created_at')
      .eq('active', true),
    supabase.from('categories').select('id, name, slug, active').eq('active', true),
  ])

  if (pErr || !products) {
    console.warn('[generate-seo] product fetch failed — static-only sitemap, skipping feed:', pErr?.message)
    writeFileSync(join(DIST, 'sitemap.xml'), buildSitemap([], categories || [], today))
    return
  }

  const allCats = categories || []
  if (cErr) console.warn('[generate-seo] category fetch failed, continuing without categories:', cErr.message)

  const catBySlugName = { byId: {} }
  for (const c of allCats) catBySlugName.byId[c.id] = c

  // Sitemap: only category pages that have at least one active product.
  const catIdsWithProducts = new Set(products.map((p) => p.category_id).filter(Boolean))
  const sitemapCats = allCats.filter((c) => catIdsWithProducts.has(c.id))

  writeFileSync(join(DIST, 'sitemap.xml'), buildSitemap(products, sitemapCats, today))
  const { feed, count, skipped } = buildFeed(products, catBySlugName)
  writeFileSync(join(DIST, 'feed.xml'), feed)

  console.log(
    `[generate-seo] sitemap: ${STATIC_PAGES.length} static + ${sitemapCats.length} categories + ${products.length} products.`,
  )
  console.log(`[generate-seo] feed.xml: ${count} items (${skipped} skipped for missing image/price).`)
}

main().catch((err) => {
  console.warn('[generate-seo] unexpected error — build continues:', err?.message || err)
  // Never fail the build over SEO assets.
  process.exit(0)
})
