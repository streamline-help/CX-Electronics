import { useState, useMemo } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'
import { ProductCardLight } from '../../components/store/ProductCardLight'
import { CategoryGrid } from '../../components/store/CategoryGrid'
import { useProducts, type ProductSort } from '../../hooks/useProducts'
import { useCategories } from '../../hooks/useCategories'
import { getCategoryContent } from '../../lib/categoryContent'
import { getCategoryIcon } from '../../lib/categoryIcons'

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
]

export function CategoryPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [sort, setSort] = useState<ProductSort>('popularity')
  const { categories, loading: catsLoading } = useCategories()

  const category = useMemo(() => categories.find((c) => c.slug === slug) ?? null, [categories, slug])

  const { products, loading, totalCount } = useProducts({
    categorySlug: slug || undefined,
    sort,
    page: 1,
    pageSize: 48,
  })

  // Unknown slug (categories loaded, no match) → send to the main shop.
  if (!catsLoading && !category) {
    return <Navigate to="/shop" replace />
  }

  const name = category?.name ?? slug
  const content = getCategoryContent(slug, name)
  const Icon = getCategoryIcon(slug)

  // Don't let Google index an empty category (thin/soft-404). Still renders for users.
  const noIndex = !loading && totalCount === 0

  const faqSchema =
    content.faqs && content.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: content.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={content.metaTitle}
        description={content.metaDescription}
        url={`/category/${slug}`}
        noIndex={noIndex}
        keywords={[name, 'Johannesburg', 'South Africa', 'wholesale', 'CW Electronics'].join(', ')}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/shop' },
          { name, url: `/category/${slug}` },
        ]}
      />
      {faqSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        </Helmet>
      )}
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[#0F172A] text-white border-b border-[#E5E7EB]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <nav className="flex items-center gap-2 text-xs text-white/50 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-white/80">{name}</span>
          </nav>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-[#E63939] rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-semibold text-[#E63939] uppercase tracking-widest">
                {content.eyebrow}
              </p>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-balance text-white">
              {content.h1}
            </h1>
            <div className="mt-4 space-y-3">
              {content.intro.map((p, i) => (
                <p key={i} className="text-white/70 text-sm md:text-base leading-relaxed text-pretty">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-lg font-bold text-[#0F172A]">
            {loading ? 'Loading…' : `${totalCount} ${totalCount === 1 ? 'product' : 'products'} in ${name}`}
          </h2>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductSort)}
              className="appearance-none bg-white border border-[#E5E7EB] text-sm font-medium text-[#0F172A] pl-3 pr-9 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E63939] focus:border-transparent cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>Sort: {o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]/40 pointer-events-none" />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-[#F5F5F5] rounded-xl animate-pulse border border-[#E5E7EB]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E5E7EB] text-center">
            <p className="text-base font-semibold text-[#0F172A]">No products in this category yet</p>
            <p className="text-sm text-[#0F172A]/50 mt-1">New stock lands regularly — browse everything in the meantime.</p>
            <Link
              to="/shop"
              className="mt-4 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCardLight key={product.id} product={product} basePath="/shop" columns={4} />
            ))}
          </div>
        )}

        {/* FAQ */}
        {content.faqs && content.faqs.length > 0 && (
          <section className="mt-14 max-w-3xl">
            <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight mb-5">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {content.faqs.map((f, i) => (
                <details key={i} className="group bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-5 py-4">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-[#0F172A] text-sm">
                    {f.q}
                    <ChevronDown className="w-4 h-4 text-[#0F172A]/40 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-sm text-[#0F172A]/70 leading-relaxed mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Internal linking: other categories */}
        <section className="mt-14">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Browse other categories</p>
            <Link to="/shop" className="inline-flex items-center gap-1 text-xs font-bold text-[#E63939] hover:text-[#C82020]">
              All products <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <CategoryGrid variant="chips" bare className="mt-3" />
        </section>
      </div>

      <Footer />
    </div>
  )
}
