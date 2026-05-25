import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, ShoppingCart, Minus, Plus, Trash2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { supabase, getProductImageUrl } from '../../lib/supabase'

interface UpsellProduct {
  id: string
  name: string
  retail_price: number
  thumbnail_url: string | null
  slug: string
}

export function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, removeItem, updateQuantity, addItem } = useCart()
  const { t } = useLang()
  const [upsells, setUpsells] = useState<UpsellProduct[]>([])
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isOpen || items.length === 0) { setUpsells([]); return }
    const cartIds = items.map((i) => i.productId)
    supabase
      .from('products')
      .select('id, name, retail_price, thumbnail_url, slug')
      .eq('active', true)
      .neq('stock_status', 'out_of_stock')
      .not('id', 'in', `(${cartIds.join(',')})`)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => setUpsells((data ?? []) as UpsellProduct[]))
  }, [isOpen, items.map((i) => i.productId).join(',')])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [closeCart])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-cxx-blue" />
                <h2 className="font-semibold text-gray-900">{t('yourCart')}</h2>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                  <ShoppingCart className="w-10 h-10" />
                  <p className="text-sm">{t('emptyCart')}</p>
                  <button
                    onClick={closeCart}
                    className="text-sm text-cxx-blue hover:underline"
                  >
                    {t('continueShopping')}
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">R{item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                        R{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              </div>

              {/* Upsells */}
              {items.length > 0 && upsells.length > 0 && (
                <div className="border-t border-gray-100 pt-4 pb-2">
                  <div className="flex items-center gap-1.5 px-5 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-cxx-blue flex-shrink-0" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">You might also like</p>
                  </div>
                  <div className="flex gap-3 overflow-x-auto px-5 pb-2 snap-x snap-mandatory scrollbar-hide">
                    {upsells.map((p) => {
                      const added = addedIds.has(p.id)
                      return (
                        <div key={p.id} className="flex-shrink-0 w-28 snap-start">
                          <Link
                            to={`/shop/${p.slug}`}
                            onClick={closeCart}
                            className="block w-28 h-28 rounded-xl bg-gray-100 overflow-hidden mb-1.5"
                          >
                            {p.thumbnail_url ? (
                              <img src={getProductImageUrl(p.thumbnail_url, 200)} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </Link>
                          <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-2 mb-1">{p.name}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">R{p.retail_price.toFixed(0)}</span>
                            <button
                              onClick={() => {
                                addItem({ productId: p.id, name: p.name, price: p.retail_price, image: p.thumbnail_url ? getProductImageUrl(p.thumbnail_url, 200) : '', quantity: 1, orderType: 'retail' })
                                setAddedIds((prev) => new Set(prev).add(p.id))
                              }}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors text-white text-xs font-bold flex-shrink-0 ${added ? 'bg-green-500' : 'bg-cxx-blue hover:bg-cxx-blue-hover'}`}
                            >
                              {added ? '✓' : '+'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 px-5 py-4 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('subtotal')}</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>{t('shipping')}</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                    <span>{t('total')}</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-cxx-blue hover:bg-cxx-blue-hover text-white text-center font-semibold py-3 rounded-xl transition-colors"
                >
                  {t('checkout')}
                </Link>
                <button
                  onClick={closeCart}
                  className="block w-full text-center text-sm text-gray-500 hover:text-gray-700"
                >
                  {t('continueShopping')}
                </button>

                {/* Trust strip — secure / returns / contact */}
                <div className="grid grid-cols-3 gap-2 pt-3 mt-2 border-t border-gray-100 text-[10px] text-gray-500">
                  <div className="flex flex-col items-center gap-1">
                    <svg className="w-4 h-4 text-[#E63939]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span className="font-bold text-gray-700 text-center leading-tight">Secure</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <svg className="w-4 h-4 text-[#E63939]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span className="font-bold text-gray-700 text-center leading-tight">7-day returns</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <svg className="w-4 h-4 text-[#E63939]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                    <span className="font-bold text-gray-700 text-center leading-tight">Real support</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
