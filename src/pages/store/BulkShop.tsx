import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, MessageCircle, Zap, Sliders, X, ArrowRight,
  CheckCircle2, TrendingDown, Truck, Shield, Phone,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'
import { ProductCard } from '../../components/store/ProductCard'
import { useProducts, type ProductSort } from '../../hooks/useProducts'
import { getProductImageUrl } from '../../lib/supabase'
import { useCategories } from '../../hooks/useCategories'

const WHATSAPP_NUMBER = '27649533333'

const PRICE_RANGES = [
  { label: 'Under R100', min: 0, max: 100 },
  { label: 'R100 – R250', min: 100, max: 250 },
  { label: 'R250 – R500', min: 250, max: 500 },
  { label: 'R500 – R1000', min: 500, max: 1000 },
  { label: 'R1000+', min: 1000, max: undefined },
] as const

const MIN_QTY_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '10+ units', value: 10 },
  { label: '25+ units', value: 25 },
  { label: '50+ units', value: 50 },
  { label: '100+ units', value: 100 },
] as const

export function BulkShop() {
  const [categorySlug, setCategorySlug] = useState('')
  const [priceIdx, setPriceIdx] = useState<number | null>(null)
  const [minQty, setMinQty] = useState(0)
  const [sort, setSort] = useState<ProductSort>('featured')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  const { categories } = useCategories()
  const priceRange = priceIdx !== null ? PRICE_RANGES[priceIdx] : null

  const { products, loading, totalCount, hasMore } = useProducts({
    bulkOnly: true,
    categorySlug: categorySlug || undefined,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    sort,
    page,
    pageSize: 24,
  })

  // Filter further by min qty client-side (DB doesn't have a server filter for it)
  const visibleProducts = useMemo(
    () => (minQty > 0 ? products.filter((p) => (p.bulk_min_qty ?? 0) >= minQty) : products),
    [products, minQty],
  )

  // Build a top-deals pricing table (best 5 savings)
  const topDeals = useMemo(() => {
    return [...products]
      .filter((p) => p.bulk_price && p.retail_price > p.bulk_price)
      .sort((a, b) => {
        const sa = 1 - (a.bulk_price ?? 0) / a.retail_price
        const sb = 1 - (b.bulk_price ?? 0) / b.retail_price
        return sb - sa
      })
      .slice(0, 5)
  }, [products])

  const activeFilters = [categorySlug, priceIdx !== null ? PRICE_RANGES[priceIdx].label : '', minQty > 0 ? `${minQty}+ units` : '']
    .filter(Boolean).length

  function clearAll() {
    setCategorySlug('')
    setPriceIdx(null)
    setMinQty(0)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Wholesale Electronics — Bulk Pricing | CW Electronics"
        description="Trade pricing for resellers, installers & businesses. Minimum 6 units for bulk rates. CCTV, solar, chargers, routers & more. Johannesburg."
        url="https://cw-electronics.co.za/bulk"
      />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-[#0F172A] overflow-hidden">
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none">
          <Zap className="w-[560px] h-[560px] text-[#E63939] opacity-10" strokeWidth={1} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-[#E63939]/15 border border-[#E63939]/40 rounded-full px-4 py-1.5 text-xs text-[#E63939] font-bold mb-5 uppercase tracking-widest">
              <TrendingDown className="w-3.5 h-3.5" />
              Wholesale &amp; Bulk Pricing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] mb-5 text-balance">
              Bulk Deals &amp; <span className="text-[#E63939]">Wholesale</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl text-pretty">
              Best prices for resellers, traders &amp; installers. Minimum quantities apply —
              save up to 35% on retail when you buy in bulk.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I would like a wholesale price list')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bc59] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#25D366]/30 text-sm hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4" />
                Want a Bulk Price List? WhatsApp Us
              </a>
              <a
                href="#products"
                className="inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#E63939]/30 text-sm hover:scale-[1.02]"
              >
                Browse Bulk Catalogue
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 max-w-3xl">
              {[
                { icon: TrendingDown, label: 'Up to 35% off retail' },
                { icon: Truck, label: 'Nationwide delivery' },
                { icon: Shield, label: 'Quality guaranteed' },
                { icon: Phone, label: 'Trade account support' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
                  <Icon className="w-4 h-4 text-[#E63939] flex-shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Top Bulk Deals Pricing Table ─────────────────── */}
      {topDeals.length > 0 && (
        <section className="bg-[#0B1220] py-14 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2">
                  Hot Deals This Week
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Top Bulk Savings
                </h2>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I would like to enquire about the bulk deals')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[#E63939] hover:gap-2.5 transition-all"
              >
                Enquire all <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-[#0F172A] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#E63939]/10 border-b border-white/10">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white/70 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-white/70 uppercase tracking-wider">Min Qty</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-white/70 uppercase tracking-wider hidden sm:table-cell">Retail</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-white/70 uppercase tracking-wider">Bulk / unit</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-white/70 uppercase tracking-wider hidden md:table-cell">You Save</th>
                      <th className="px-4 py-4 text-right text-xs font-bold text-white/70 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDeals.map((p) => {
                      const savings = p.bulk_price ? Math.round((1 - p.bulk_price / p.retail_price) * 100) : 0
                      const waMsg = encodeURIComponent(`Bulk enquiry: ${p.name} (min ${6} units @ R${p.bulk_price?.toFixed(2)})`)
                      return (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                          <td className="px-6 py-4">
                            <Link to={`/bulk/${p.slug}`} className="flex items-center gap-3 group">
                              <div className="w-10 h-10 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                {p.thumbnail_url ? (
                                  <img src={getProductImageUrl(p.thumbnail_url, 120)} alt={p.name} className="w-full h-full object-contain p-1" />
                                ) : (
                                  <Package className="w-full h-full p-2 text-white/30" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-white group-hover:text-[#E63939] transition-colors line-clamp-1">
                                {p.name}
                              </span>
                            </Link>
                          </td>
                          <td className="px-4 py-4 text-sm text-white/70">
                            <span className="bg-[#E63939]/15 text-[#E63939] px-2 py-0.5 rounded-md text-xs font-bold">
                              {6}+
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-white/40 line-through hidden sm:table-cell">
                            R{p.retail_price.toFixed(2)}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-base font-extrabold text-[#E63939]">
                              R{p.bulk_price?.toFixed(2) ?? '—'}
                            </span>
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell">
                            {savings > 0 ? (
                              <span className="bg-emerald-500/15 text-emerald-400 px-2 py-1 rounded-md text-xs font-bold">
                                {savings}% off
                              </span>
                            ) : (
                              <span className="text-xs text-white/40">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <a
                              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-[#E63939] hover:bg-[#C82020] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:scale-[1.03]"
                            >
                              Enquire
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Catalogue ────────────────────────────────────── */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterPanel
              categories={categories}
              categorySlug={categorySlug}
              setCategorySlug={(s) => { setCategorySlug(s); setPage(1) }}
              priceIdx={priceIdx}
              setPriceIdx={(i) => { setPriceIdx(i); setPage(1) }}
              minQty={minQty}
              setMinQty={(q) => { setMinQty(q); setPage(1) }}
              clearAll={clearAll}
              activeFilters={activeFilters}
            />
          </aside>

          {/* Main */}
          <main className="flex-1">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-3 mb-6 bg-white p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <Sliders className="w-4 h-4" />
                  Filters
                  {activeFilters > 0 && (
                    <span className="bg-[#E63939] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFilters}
                    </span>
                  )}
                </button>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">{visibleProducts.length}</span>
                  {' '}of {totalCount} bulk products
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 hidden sm:block">Sort by:</label>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value as ProductSort); setPage(1) }}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E63939]/30 bg-white"
                >
                  <option value="featured">Best Selling</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-white border border-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 bg-white rounded-2xl border border-gray-100 text-gray-400 gap-3">
                <Package className="w-12 h-12" />
                <p className="text-sm font-medium">No bulk products match your filters</p>
                <button onClick={clearAll} className="text-sm text-[#E63939] font-bold hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} basePath="/bulk" />
                  ))}
                </div>

                {(hasMore || page > 1) && (
                  <div className="flex items-center justify-center gap-3 mt-12">
                    {page > 1 && (
                      <button
                        onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className="px-5 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-white"
                      >
                        Previous
                      </button>
                    )}
                    <span className="text-sm text-gray-500 font-medium">Page {page}</span>
                    {hasMore && (
                      <button
                        onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        className="px-5 py-2.5 text-sm font-semibold bg-[#E63939] hover:bg-[#C82020] text-white rounded-lg transition-colors"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </section>

      {/* ── Big CTA ──────────────────────────────────────── */}
      <section className="bg-[#0F172A] py-16 relative overflow-hidden">
        <div className="absolute -left-32 top-0 hidden md:block pointer-events-none">
          <Zap className="w-[420px] h-[420px] text-[#E63939] opacity-10" strokeWidth={1} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 text-balance">
            Need a custom bulk quote?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto text-pretty">
            Reach out for volume pricing, mixed pallets, or product sourcing.
            We respond within 1 business hour.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need a bulk quote')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bc59] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#25D366]/30 text-sm hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
            <a
              href={`tel:+${WHATSAPP_NUMBER}`}
              className="inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-[#E63939]/30 text-sm hover:scale-[1.02]"
            >
              <Phone className="w-4 h-4" />
              Call Sales
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-gray-900">Filters</h3>
              <button onClick={() => setFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <FilterPanel
              categories={categories}
              categorySlug={categorySlug}
              setCategorySlug={(s) => { setCategorySlug(s); setPage(1) }}
              priceIdx={priceIdx}
              setPriceIdx={(i) => { setPriceIdx(i); setPage(1) }}
              minQty={minQty}
              setMinQty={(q) => { setMinQty(q); setPage(1) }}
              clearAll={clearAll}
              activeFilters={activeFilters}
            />
            <button
              onClick={() => setFilterOpen(false)}
              className="mt-6 w-full bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-3 rounded-xl"
            >
              View {visibleProducts.length} results
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// ── Filter Panel ────────────────────────────────────────────
interface FilterPanelProps {
  categories: { id: string; slug: string; name: string }[]
  categorySlug: string
  setCategorySlug: (s: string) => void
  priceIdx: number | null
  setPriceIdx: (i: number | null) => void
  minQty: number
  setMinQty: (q: number) => void
  clearAll: () => void
  activeFilters: number
}

function FilterPanel({
  categories, categorySlug, setCategorySlug, priceIdx, setPriceIdx,
  minQty, setMinQty, clearAll, activeFilters,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <FilterBlock title="Categories">
        <button
          onClick={() => setCategorySlug('')}
          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            !categorySlug ? 'bg-[#FEE9E9] text-[#E63939] font-bold' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategorySlug(c.slug)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              categorySlug === c.slug ? 'bg-[#FEE9E9] text-[#E63939] font-bold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </FilterBlock>

      {/* Price Range */}
      <FilterBlock title="Bulk Price (per unit)">
        <button
          onClick={() => setPriceIdx(null)}
          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
            priceIdx === null ? 'bg-[#FEE9E9] text-[#E63939] font-bold' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Any price
        </button>
        {PRICE_RANGES.map((r, i) => (
          <button
            key={r.label}
            onClick={() => setPriceIdx(i)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              priceIdx === i ? 'bg-[#FEE9E9] text-[#E63939] font-bold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </FilterBlock>

      {/* Min Quantity */}
      <FilterBlock title="Minimum Quantity">
        {MIN_QTY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setMinQty(opt.value)}
            className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              minQty === opt.value ? 'bg-[#FEE9E9] text-[#E63939] font-bold' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {minQty === opt.value && <CheckCircle2 className="w-3.5 h-3.5" />}
            {opt.label}
          </button>
        ))}
      </FilterBlock>

      {activeFilters > 0 && (
        <button
          onClick={clearAll}
          className="w-full text-sm font-bold text-[#E63939] hover:underline"
        >
          Clear all filters ({activeFilters})
        </button>
      )}
    </div>
  )
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}
