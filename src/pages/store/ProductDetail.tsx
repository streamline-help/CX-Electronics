import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  ShoppingCart, Minus, Plus, ArrowLeft, Package, Loader2,
  MessageCircle, Truck, Shield, RotateCcw, BadgeCheck, Zap, Heart,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { ProductCardLight } from '../../components/store/ProductCardLight'
import { ProductSpecifications } from '../../components/store/ProductSpecifications'
import { FrequentlyBoughtTogether } from '../../components/store/FrequentlyBoughtTogether'
import SEO from '../../components/SEO'
import { useProduct } from '../../hooks/useProduct'
import { useProducts } from '../../hooks/useProducts'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { useWishlist } from '../../context/WishlistContext'
import { getWholesalePrice, getWholesaleMinQty, getWholesaleSavingsPct } from '../../lib/wholesale'

const WHATSAPP_NUMBER = '27649533333'

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { product, loading, error } = useProduct(slug ?? '')
  const { addItem } = useCart()
  const { lang } = useLang()
  const { toggle, has } = useWishlist()
  const inWishlist = product ? has(product.id) : false
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [tab, setTab] = useState<'description' | 'specs'>('description')
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  // Redirect to group page if this product is part of a variant group
  useEffect(() => {
    if (!product?.variant_group_id) return
    supabase
      .from('product_variant_groups')
      .select('slug')
      .eq('id', product.variant_group_id)
      .single()
      .then(({ data }) => {
        if (data?.slug) {
          navigate(`/shop/group/${data.slug}?variant=${product.slug}`, { replace: true })
        }
      })
  }, [product, navigate])

  // Related products
  const { products: related } = useProducts({
    categorySlug: product?.categories?.slug,
    pageSize: 8,
    sort: 'featured',
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#E63939]" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
          <Package className="w-12 h-12" />
          <p>Product not found</p>
          <Link to="/shop" className="text-[#E63939] text-sm font-bold hover:underline">
            ← Back to shop
          </Link>
        </div>
      </div>
    )
  }

  const name = lang === 'zh' && product.name_zh ? product.name_zh : product.name
  const description = lang === 'zh' && product.description_zh ? product.description_zh : product.description
  const isOutOfStock = product.stock_status === 'out_of_stock'
  const images = product.images.length > 0 ? product.images : [product.thumbnail_url ?? '']

  const wholesalePrice = getWholesalePrice(product)
  const wholesaleMinQty = getWholesaleMinQty(product)
  const bulkSavingsPct = getWholesaleSavingsPct(product.retail_price, wholesalePrice)
  const isWholesaleUnlocked = qty >= wholesaleMinQty
  const activePrice = isWholesaleUnlocked ? wholesalePrice : product.retail_price
  const savingsPerUnit = product.retail_price - wholesalePrice
  const totalSaved = isWholesaleUnlocked ? savingsPerUnit * qty : 0
  const unitsToUnlock = Math.max(0, wholesaleMinQty - qty)

  // Filter related, exclude current product
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4)

  function handleAddToCart() {
    if (isOutOfStock) return
    addItem({
      productId: product!.id,
      name: product!.name,
      price: activePrice,
      quantity: qty,
      image: product!.thumbnail_url ?? '',
      orderType: isWholesaleUnlocked ? 'bulk' : 'retail',
      categorySlug: product!.categories?.slug,
    })
  }

  const waMessage = `Wholesale enquiry: ${product.name} (min. ${wholesaleMinQty} units). Wholesale price: R${wholesalePrice.toFixed(2)}.`
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`

  // Build fallback specs for products that don't yet have specifications JSONB
  const fallbackSpecs = [
    product.categories && { label: 'Category', value: product.categories.name },
    { label: 'SKU', value: product.slug.toUpperCase().slice(0, 12) },
    { label: 'Stock', value: product.stock_status === 'in_stock' ? 'Available' : product.stock_status === 'on_order' ? 'On Order' : 'Out of Stock' },
    product.is_bulk_available && { label: 'Wholesale Available', value: 'Yes' },
    product.bulk_min_qty && { label: 'Min Wholesale Qty', value: `${product.bulk_min_qty} units` },
    { label: 'Warranty', value: '12 Months' },
    { label: 'Shipping', value: 'Same-day in Gauteng · 2-4 days nationwide' },
  ].filter(Boolean) as { label: string; value: string }[]

  // Render description text with paragraph + bullet-point support
  function renderDescription(text: string) {
    const blocks = text.split(/\n\n+/)
    return (
      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
        {blocks.map((block, i) => {
          const lines = block.split('\n').filter(Boolean)
          const hasLabel = lines[0]?.startsWith('**') && lines[0]?.endsWith('**')
          const hasBullets = lines.some((l) => l.trim().startsWith('•'))

          if (hasBullets || hasLabel) {
            return (
              <div key={i} className="space-y-1.5">
                {lines.map((line, j) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                      <p key={j} className="font-bold text-gray-800 text-xs uppercase tracking-widest mt-3 mb-1">
                        {line.replace(/\*\*/g, '')}
                      </p>
                    )
                  }
                  if (line.trim().startsWith('•')) {
                    return (
                      <div key={j} className="flex gap-2.5 items-start pl-1">
                        <span className="text-[#E63939] font-bold mt-px flex-shrink-0 text-base leading-none">·</span>
                        <span>{line.replace(/^[\s•]+/, '')}</span>
                      </div>
                    )
                  }
                  return line.trim() ? <p key={j}>{line}</p> : null
                })}
              </div>
            )
          }
          return <p key={i}>{block}</p>
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={
          product.brand && !new RegExp(`\\b${product.brand}\\b`, 'i').test(product.name)
            ? `${product.brand} ${product.name}`
            : product.name
        }
        description={
          product.description
            ? product.description.replace(/\s+/g, ' ').slice(0, 160)
            : `Buy ${product.name} at the best price in Johannesburg. Direct importer · fast nationwide delivery · wholesale pricing available.`
        }
        image={images[0] || undefined}
        url={`/shop/${product.slug}`}
        type="product"
        keywords={[
          product.name,
          product.categories?.name,
          'CW Electronics',
          'Johannesburg',
          'South Africa',
          'wholesale',
        ].filter(Boolean).join(', ')}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/shop' },
          ...(product.categories ? [{ name: product.categories.name, url: `/category/${product.categories.slug}` }] : []),
          { name: product.name, url: `/shop/${product.slug}` },
        ]}
        product={{
          name: product.name,
          description: (product.description ?? product.name).replace(/\s+/g, ' ').slice(0, 5000),
          image: images.filter(Boolean),
          sku: product.id,
          brand: product.brand ?? 'CW Electronics',
          ...(product.gtin ? { gtin: product.gtin } : {}),
          ...(product.mpn ? { mpn: product.mpn } : {}),
          category: product.categories?.name,
          price: product.retail_price,
          currency: 'ZAR',
          availability: isOutOfStock ? 'OutOfStock' : 'InStock',
          condition: 'NewCondition',
          url: `/shop/${product.slug}`,
        }}
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 lg:pb-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link to="/shop" className="flex items-center gap-1 hover:text-[#E63939] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Shop
          </Link>
          {product.categories && (
            <>
              <span>/</span>
              <Link to={`/category/${product.categories.slug}`} className="hover:text-[#E63939] transition-colors">
                {product.categories.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        >
          {/* ── Gallery (left) ──────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-12 gap-3">
              {/* Thumbnails (vertical on lg) */}
              {images.length > 1 && (
                <div className="col-span-12 sm:col-span-2 order-2 sm:order-1">
                  <div className="flex sm:flex-col gap-2 sm:max-h-[560px] overflow-x-auto sm:overflow-y-auto">
                    {images.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-full sm:h-20 rounded-xl overflow-hidden bg-white border-2 transition-all ${
                          activeImage === i
                            ? 'border-[#E63939] ring-2 ring-[#E63939]/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        aria-label={`Image ${i + 1}`}
                      >
                        <img src={url || '/placeholder.svg'} alt="" className="w-full h-full object-contain p-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main image */}
              <div className={`col-span-12 ${images.length > 1 ? 'sm:col-span-10' : ''} order-1 sm:order-2`}>
                <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 group shadow-sm hover:shadow-2xl hover:shadow-[#E63939]/10 transition-shadow duration-500">
                  {/* Premium sheen overlay on hover */}
                  <div className="absolute inset-0 z-[5] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-white/0 via-white/40 to-transparent" />

                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImage}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      src={images[activeImage] || '/placeholder.svg'}
                      alt={name}
                      className="w-full h-full object-contain p-8 group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </AnimatePresence>

                  {product.featured && (
                    <span className="absolute top-4 left-4 bg-[#E63939] text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider z-10 shadow-lg shadow-[#E63939]/30">
                      Best Seller
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Info (right) ────────────────────────────── */}
          <div className="lg:col-span-5">
            {product.categories && (
              <Link
                to={`/category/${product.categories.slug}`}
                className="text-xs font-bold text-[#E63939] uppercase tracking-widest hover:underline"
              >
                {product.categories.name}
              </Link>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mt-2 mb-4 leading-[1.15] text-balance">
              {name}
            </h1>

            {/* Stock */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <span
                className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                  product.stock_status === 'in_stock'
                    ? 'bg-emerald-50 text-emerald-700'
                    : product.stock_status === 'on_order'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {product.stock_status === 'in_stock' ? 'In Stock' : product.stock_status === 'on_order' ? 'On Order' : 'Out of Stock'}
              </span>
              {product.featured && (
                <span className="text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider bg-[#FEE9E9] text-[#E63939]">
                  Best Seller
                </span>
              )}
            </div>

            {/* Price block: Retail + Wholesale side-by-side */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Retail */}
              <div className={`bg-white border-2 rounded-2xl p-4 transition-all ${
                !isWholesaleUnlocked ? 'border-[#E63939] shadow-md shadow-[#E63939]/10' : 'border-gray-200'
              }`}>
                <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-1">Retail</p>
                <p className={`text-2xl sm:text-3xl font-extrabold leading-none ${
                  !isWholesaleUnlocked ? 'text-[#E63939]' : 'text-gray-400 line-through'
                }`}>
                  R{product.retail_price.toFixed(2)}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Single unit</p>
              </div>

              {/* Wholesale */}
              <div className={`relative rounded-2xl p-4 transition-all ${
                isWholesaleUnlocked
                  ? 'bg-[#E63939] text-white shadow-lg shadow-[#E63939]/30'
                  : 'bg-[#0F172A] text-white border border-white/10'
              }`}>
                {bulkSavingsPct > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-md">
                    Save {bulkSavingsPct}%
                  </span>
                )}
                <p className="text-[11px] uppercase tracking-widest text-white/80 font-bold mb-1">
                  Wholesale ({wholesaleMinQty}+)
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold leading-none">
                  R{wholesalePrice.toFixed(2)}
                </p>
                <p className="text-[11px] text-white/80 mt-1">per unit</p>
              </div>
            </div>

            {/* Wholesale progress bar — always shown */}
            <div className={`mb-6 rounded-xl p-4 transition-all ${
              isWholesaleUnlocked
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-gradient-to-r from-[#FEE9E9] to-white border border-[#E63939]/20'
            }`}>
              {isWholesaleUnlocked ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                      ✓ Wholesale price unlocked
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      Saving R{totalSaved.toFixed(2)} on this order ({bulkSavingsPct}% off retail)
                    </p>
                  </div>
                  <BadgeCheck className="w-7 h-7 text-emerald-500 flex-shrink-0" />
                </div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <p className="text-sm font-bold text-gray-900">
                      Add <span className="text-[#E63939]">{unitsToUnlock}</span> more to unlock wholesale
                    </p>
                    <span className="text-xs font-bold text-[#E63939] whitespace-nowrap">
                      Save R{savingsPerUnit.toFixed(2)}/unit
                    </span>
                  </div>
                  <div className="w-full bg-white/70 rounded-full h-2 overflow-hidden mb-1.5 border border-[#E63939]/10">
                    <div
                      className="bg-gradient-to-r from-[#E63939] to-[#FF6B6B] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((qty / wholesaleMinQty) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {qty} of {wholesaleMinQty} units · then {bulkSavingsPct}% off every unit
                  </p>
                </>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 mb-6">
                {product.variants.map((variant) => {
                  const isColor = /colou?r/i.test(variant.name)
                  return (
                    <div key={variant.name}>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        {variant.name}
                        {selectedVariants[variant.name] && (
                          <span className="ml-2 text-gray-700 normal-case font-semibold tracking-normal">
                            — {selectedVariants[variant.name]}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((opt) => {
                          const active = selectedVariants[variant.name] === opt
                          if (isColor) {
                            return (
                              <button
                                key={opt}
                                onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                                title={opt}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  active ? 'border-[#E63939] scale-110 ring-2 ring-[#E63939]/30' : 'border-gray-300 hover:border-gray-500'
                                }`}
                                style={{ backgroundColor: opt.toLowerCase() }}
                              />
                            )
                          }
                          return (
                            <button
                              key={opt}
                              onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.name]: opt }))}
                              className={`px-3 py-1.5 text-sm font-semibold rounded-lg border-2 transition-all ${
                                active
                                  ? 'border-[#E63939] bg-[#FEE9E9] text-[#E63939]'
                                  : 'border-gray-200 text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Quantity + Add to cart */}
            {!isOutOfStock && (
              <div className="flex items-stretch gap-3 mb-3">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 sm:px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-gray-900 min-w-[2.5rem] text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="px-3 sm:px-4 py-3 hover:bg-gray-50 text-gray-600 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#E63939]/30 text-sm sm:text-base"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart · R{(activePrice * qty).toFixed(2)}
                </motion.button>
              </div>
            )}

            {/* Quick-jump to wholesale */}
            {!isOutOfStock && !isWholesaleUnlocked && (
              <button
                onClick={() => setQty(wholesaleMinQty)}
                className="w-full mb-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border-2 border-dashed border-[#E63939]/40 text-[#E63939] hover:bg-[#FEE9E9] font-bold text-xs transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-[#E63939]" />
                Buy {wholesaleMinQty} for wholesale — save R{(savingsPerUnit * wholesaleMinQty).toFixed(2)}
              </button>
            )}

            {isOutOfStock && (
              <div className="py-3 px-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold mb-3 text-center">
                Currently Out of Stock — {lang === 'zh' ? '请稍后再来' : 'Contact us for ETA'}
              </div>
            )}

            {/* Wishlist button */}
            <button
              onClick={() => product && toggle(product.id)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all mb-3 ${
                inWishlist
                  ? 'border-[#E63939] bg-[#FEE9E9] text-[#E63939]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#E63939]' : ''}`} />
              {inWishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
            </button>

            {/* Wholesale Quote CTA */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold py-3 rounded-xl transition-all border border-[#0F172A] hover:border-[#E63939] text-sm sm:text-base mb-6"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              Need bigger volume? WhatsApp us
            </a>

            {/* Trust strip */}
            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-gray-200">
              {[
                { icon: Truck, label: 'Fast Delivery', sub: 'Nationwide SA' },
                { icon: Shield, label: 'Quality Tested', sub: 'Verified products' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
                { icon: BadgeCheck, label: 'Direct Importer', sub: 'Best prices' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#FEE9E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#E63939]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 leading-tight">{label}</p>
                    <p className="text-[11px] text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <FrequentlyBoughtTogether
          currentProductId={product.id}
          categorySlug={product.categories?.slug}
          currentProductName={product.name}
          currentProductPrice={product.retail_price}
          currentProductImage={product.thumbnail_url ?? ''}
        />

        {/* ── Tabs: Description + Specifications ─────────── */}
        <div className="mt-12 lg:mt-16 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 flex">
            {([
              { key: 'description', label: 'Description' },
              { key: 'specs', label: 'Specifications' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-6 py-4 text-sm font-bold transition-colors relative ${
                  tab === key ? 'text-[#E63939]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
                {tab === key && (
                  <motion.span
                    layoutId="active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E63939]"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {tab === 'description' ? (
              <div className="max-w-none">
                {description ? (
                  renderDescription(description)
                ) : (
                  <p className="text-sm text-gray-400 italic">No description available for this product yet.</p>
                )}
              </div>
            ) : (
              /* Use rich accordion if specifications exist, otherwise fallback table */
              product.specifications && product.specifications.length > 0 ? (
                <div className="-mx-6 sm:-mx-8 -mb-6 sm:-mb-8">
                  <ProductSpecifications sections={product.specifications} />
                </div>
              ) : (
                <table className="w-full">
                  <tbody>
                    {fallbackSpecs.map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 w-1/3">{row.label}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>

        {/* ── Sticky mobile Add-to-Cart bar ──────────────── */}
        {!isOutOfStock && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-3 py-3 shadow-2xl">
            <div className="max-w-7xl mx-auto flex items-center gap-2">
              <div className="flex-shrink-0">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 leading-none mb-1">
                  {isWholesaleUnlocked ? 'Wholesale' : 'Total'}
                </p>
                <p className="text-lg font-extrabold text-[#E63939] leading-none">
                  R{(activePrice * qty).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden ml-auto">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2.5 hover:bg-gray-100 text-gray-600"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-bold text-sm text-gray-900 min-w-[1.75rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 py-2.5 hover:bg-gray-100 text-gray-600"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-4 py-2.5 rounded-lg text-sm shadow-lg shadow-[#E63939]/30"
              >
                <ShoppingCart className="w-4 h-4" />
                Add
              </motion.button>
            </div>
          </div>
        )}

        {/* ── Related Products ────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 lg:mt-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 fill-[#E63939]" />
                  You might also like
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Related Products</h2>
              </div>
              <Link
                to={product.categories ? `/category/${product.categories.slug}` : '/shop'}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[#E63939] hover:gap-2 transition-all"
              >
                View all <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {relatedProducts.map((p) => (
                <ProductCardLight key={p.id} product={p} basePath="/shop" />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}
