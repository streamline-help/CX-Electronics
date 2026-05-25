import { Plus, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProducts } from '../../hooks/useProducts'
import { useCart } from '../../context/CartContext'
import { getProductImageUrl } from '../../lib/supabase'

interface Props {
  currentProductId: string
  categorySlug: string | undefined
  currentProductName: string
  currentProductPrice: number
  currentProductImage: string
}

export function FrequentlyBoughtTogether({
  currentProductId,
  categorySlug,
  currentProductName,
  currentProductPrice,
  currentProductImage,
}: Props) {
  const { addItem } = useCart()

  const { products } = useProducts({
    categorySlug,
    pageSize: 6,
    sort: 'featured',
  })

  const companions = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 3)

  if (companions.length < 2) return null

  const currentItem = {
    id: currentProductId,
    name: currentProductName,
    price: currentProductPrice,
    image: currentProductImage,
  }

  const allItems = [
    currentItem,
    ...companions.map((p) => ({ id: p.id, name: p.name, price: p.retail_price, image: p.thumbnail_url ? getProductImageUrl(p.thumbnail_url, 200) : '' })),
  ]
  const totalPrice = companions.reduce((sum, p) => sum + p.retail_price, currentProductPrice)

  function handleAddAll() {
    companions.forEach((product) => {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.retail_price,
        quantity: 1,
        image: product.thumbnail_url ? getProductImageUrl(product.thumbnail_url, 200) : '',
        orderType: 'retail',
        categorySlug: product.categories?.slug,
      })
    })
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mt-8 bg-white rounded-2xl border border-gray-100 p-6"
    >
      <p className="text-[11px] font-bold text-[#E63939] uppercase tracking-widest mb-1">
        Frequently Bought Together
      </p>
      <h3 className="text-xl font-extrabold text-gray-900 mb-5">Complete the Setup</h3>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        {allItems.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1.5 w-[72px]">
              <div className="w-[60px] h-[60px] bg-white border border-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain p-1.5"
                />
              </div>
              <p className="text-[11px] text-gray-700 font-medium text-center line-clamp-2 leading-tight w-full">
                {item.name}
              </p>
              <p className="text-xs font-extrabold text-[#E63939]">
                R{item.price.toFixed(2)}
              </p>
            </div>
            {index < allItems.length - 1 && (
              <Plus className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 font-medium">Total for all items</p>
          <p className="text-xl font-extrabold text-gray-900">
            R{totalPrice.toFixed(2)}
          </p>
        </div>
        <button
          onClick={handleAddAll}
          className="flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-lg shadow-[#E63939]/25 text-sm whitespace-nowrap"
        >
          <ShoppingCart className="w-4 h-4" />
          Add All to Cart
        </button>
      </div>
    </motion.section>
  )
}
