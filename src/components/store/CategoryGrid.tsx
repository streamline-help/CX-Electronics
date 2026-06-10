import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { getCategoryIcon } from '../../lib/categoryIcons'

interface Props {
  heading?: string
  eyebrow?: string
  subtitle?: string
  variant?: 'cards' | 'chips'
  /** Hide the wrapping section + heading; just emit the grid. */
  bare?: boolean
  className?: string
}

export function CategoryGrid({
  heading = 'Browse by Category',
  eyebrow = 'Shop the Range',
  subtitle = 'Every category we stock — tap one to see the products.',
  variant = 'cards',
  bare = false,
  className = '',
}: Props) {
  const { categories, loading } = useCategories()

  if (variant === 'chips') {
    return (
      <div className={`${bare ? '' : 'mb-6'} ${className}`}>
        {!bare && (
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{heading}</p>
        )}
        {loading ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 w-28 bg-gray-100 rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map((c) => {
              const Icon = getCategoryIcon(c.slug)
              return (
                <Link
                  key={c.id}
                  to={`/category/${c.slug}`}
                  className="group flex items-center gap-2 bg-white border border-gray-200 hover:border-[#E63939] hover:bg-[#FEE9E9] text-gray-700 hover:text-[#E63939] text-xs font-bold px-3.5 py-2 rounded-full transition-colors whitespace-nowrap flex-shrink-0"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {c.name}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <section className={`py-12 sm:py-16 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2">{eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight text-balance">
            {heading}
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm sm:text-base text-pretty">
            {subtitle}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((c, i) => {
              const Icon = getCategoryIcon(c.slug)
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.4 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    to={`/category/${c.slug}`}
                    className="group flex flex-col items-center justify-center gap-2.5 aspect-[4/3] bg-white border border-gray-200 hover:border-[#E63939]/60 hover:shadow-xl hover:shadow-[#E63939]/10 rounded-2xl transition-all p-3 text-center"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#FEE9E9] group-hover:bg-[#E63939] rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#E63939] group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                      {c.name}
                    </p>
                    <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-[#E63939] opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
