import { useState, useRef, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Zap, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { useWishlist } from '../../context/WishlistContext'
import { getProductImageUrl } from '../../lib/supabase'
import type { ProductWithCategory } from '../../lib/supabase'

interface ProductCardProps {
  product: ProductWithCategory
  basePath?: '/shop' | '/bulk'
  columns?: 1 | 2 | 3 | 4
}

export function ProductCard({ product, basePath = '/shop', columns = 4 }: ProductCardProps) {
  const { addItem } = useCart()
  const { lang, t } = useLang()
  const { toggle, has } = useWishlist()
  const inWishlist = has(product.id)

  const [hoverImg, setHoverImg] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<number>(0)

  const isOutOfStock = product.stock_status === 'out_of_stock'
  const isBulkView = basePath === '/bulk'
  const price = isBulkView && product.bulk_price ? product.bulk_price : product.retail_price
  const name = lang === 'zh' && product.name_zh ? product.name_zh : product.name

  const groupSlug = product.product_variant_groups?.slug
  const isVariant = !!product.variant_group_id && !!groupSlug && !isBulkView
  const href = isVariant
    ? `/shop/group/${groupSlug}?variant=${product.slug}`
    : `${basePath}/${product.slug}`
  const displayName = isVariant && product.product_variant_groups?.name
    ? product.product_variant_groups.name
    : name

  // Resolve up to 4 image URLs
  const cardImages = useMemo(() => {
    if (product.images.length > 0) {
      return product.images.slice(0, 4).map((p) => getProductImageUrl(p, 400))
    }
    return product.thumbnail_url ? [getProductImageUrl(product.thumbnail_url, 400)] : []
  }, [product.images, product.thumbnail_url])

  // Desktop: start cycling on hover
  function startCycling() {
    if (cardImages.length < 2) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setHoverImg((prev) => (prev + 1) % cardImages.length)
    }, 2000)
  }

  function stopCycling() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setHoverImg(0)
  }

  // Mobile: Intersection Observer + 1s delay before auto-cycling
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (!isMobile || cardImages.length < 2) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          touchStartRef.current = Date.now()
        } else {
          setIsInView(false)
          stopCycling()
        }
      },
      { threshold: 0.6 }
    )

    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [cardImages.length])

  // Mobile: Start cycling after 1 second in view
  useEffect(() => {
    if (!isInView || cardImages.length < 2) return

    const timeout = setTimeout(() => {
      startCycling()
    }, 1000)

    return () => {
      clearTimeout(timeout)
      stopCycling()
    }
  }, [isInView, cardImages.length])

  const savingsPct =
    isBulkView && product.bulk_price && product.retail_price > product.bulk_price
      ? Math.round((1 - product.bulk_price / product.retail_price) * 100)
      : 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      name: product.name,
      price,
      quantity: isBulkView ? 6 : 1,
      image: product.thumbnail_url ? getProductImageUrl(product.thumbnail_url, 400) : '',
      orderType: isBulkView ? 'bulk' : 'retail',
      bulkMinQty: isBulkView ? 6 : undefined,
    })
  }

  // Responsive text sizes based on column count
  const textSize = columns === 1 ? 'text-base' : columns === 2 ? 'text-sm' : 'text-sm'
  const priceSize = columns === 1 ? 'text-2xl' : columns === 2 ? 'text-xl' : 'text-lg'

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="will-change-transform"
    >
      <Link to={href} className="group block h-full">
        <div className="relative bg-[#1F2937] rounded-2xl border border-white/10 group-hover:border-[#E63939]/50 transition-all duration-500 overflow-hidden h-full flex flex-col shadow-sm group-hover:shadow-[0_20px_40px_-15px_rgba(230,57,57,0.25),0_8px_16px_-8px_rgba(0,0,0,0.5)]">
          {/* Image */}
          <div
            className="relative aspect-square bg-white overflow-hidden"
            onMouseEnter={startCycling}
            onMouseLeave={stopCycling}
          >
            {/* Premium sheen on hover — diagonal light sweep (matches light card variant) */}
            <div className="absolute inset-0 z-[5] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-white/0 via-white/30 to-transparent" />
            {cardImages.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={hoverImg}
                    src={cardImages[hoverImg]}
                    alt={displayName}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                    className={`w-full h-full object-contain p-4 sm:p-5 transition-transform duration-500 ${
                      cardImages.length < 2 ? 'group-hover:scale-110' : ''
                    }`}
                    loading="lazy"
                  />
                </AnimatePresence>
                {/* Progress dots */}
                {cardImages.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                    {cardImages.map((_, i) => (
                      <span
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          i === hoverImg ? 'bg-[#E63939] w-3' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Zap className="w-12 h-12 text-gray-300" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              {isOutOfStock && (
                <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  {t('outOfStock')}
                </span>
              )}
              {product.featured && !isOutOfStock && (
                <span className="text-[10px] bg-[#E63939] text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  {t('featured')}
                </span>
              )}
              {!isBulkView && product.is_bulk_available && product.bulk_price && (
                <span className="text-[10px] bg-[#0F172A] text-white px-2 py-0.5 rounded-md font-bold">
                  Bulk from R{product.bulk_price.toFixed(0)}
                </span>
              )}
            </div>

            {isBulkView && (
              <span className="absolute bottom-10 left-2.5 text-[10px] bg-[#E63939] text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                6+ units
              </span>
            )}

            {/* Wishlist */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id) }}
              className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 ${inWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#E63939] text-[#E63939]' : 'text-gray-400'}`} />
            </button>

            {savingsPct > 0 && (
              <span className="absolute bottom-2.5 right-2.5 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Save {savingsPct}%
              </span>
            )}
          </div>

          {/* Info */}
          <div className="p-3 sm:p-4 flex flex-col flex-1">
            {product.categories && (
              <p className="text-[10px] sm:text-[11px] text-gray-400 mb-1 truncate uppercase tracking-wider font-semibold">
                {product.categories.name}
              </p>
            )}
            <p className={`font-semibold text-white ${textSize} leading-snug line-clamp-2 mb-2 min-h-[2.5rem]`}>
              {displayName}
            </p>
            {isVariant && (
              <p className="text-[10px] text-[#E63939] font-bold uppercase tracking-wider mb-2">
                Multiple options available
              </p>
            )}

            <div className="mt-auto flex items-end justify-between gap-2">
              <div className="leading-tight">
                {isBulkView && product.retail_price > price && (
                  <p className="text-xs text-gray-500 line-through leading-none mb-0.5">
                    R{product.retail_price.toFixed(2)}
                  </p>
                )}
                <p className={`${priceSize} font-extrabold text-[#E63939] leading-none`}>
                  R{price.toFixed(2)}
                </p>
                {isBulkView && (
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">per unit</p>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isOutOfStock
                    ? 'bg-[#374151] text-gray-500 cursor-not-allowed'
                    : 'bg-[#E63939] hover:bg-[#C82020] text-white group-hover:shadow-lg group-hover:shadow-[#E63939]/50 hover:scale-[1.03]'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isOutOfStock ? 'N/A' : isBulkView ? 'Quote' : 'Add'}
                </span>
              </button>
            </div>
          </div>

          {/* Bottom accent */}
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E63939] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
        </div>
      </Link>
    </motion.div>
  )
}
