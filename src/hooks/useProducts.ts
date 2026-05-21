import { useState, useEffect, useCallback } from 'react'
import { supabase, getProductImageUrl, type ProductWithCategory } from '../lib/supabase'
import { applyProductSearch } from '../lib/search'

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'featured' | 'popularity'

interface UseProductsOptions {
  categorySlug?: string
  search?: string
  featured?: boolean
  bulkOnly?: boolean
  inStockOnly?: boolean
  minPrice?: number
  maxPrice?: number
  sort?: ProductSort
  page?: number
  pageSize?: number
}

interface UseProductsResult {
  products: ProductWithCategory[]
  loading: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  refetch: () => void
}

export function useProducts(opts: UseProductsOptions = {}): UseProductsResult {
  const {
    categorySlug,
    search,
    featured,
    bulkOnly,
    inStockOnly,
    minPrice,
    maxPrice,
    sort = 'newest',
    page = 1,
    pageSize = 50,
  } = opts
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [version, setVersion] = useState(0)

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function fetch() {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('products')
        .select(
          'id, name, name_zh, slug, description, description_zh, category_id, retail_price, bulk_price, bulk_min_qty, is_bulk_available, images, thumbnail_url, active, featured, stock_status, variant_group_id, variant_label, product_variant_groups(id, name, slug), created_at, updated_at, categories!inner(id, name, name_zh, slug)',
          { count: 'exact' },
        )
        .eq('active', true)

      // Sorting
      switch (sort) {
        case 'price_asc':
          query = query.order('retail_price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('retail_price', { ascending: false })
          break
        case 'featured':
          query = query.order('featured', { ascending: false }).order('created_at', { ascending: false })
          break
        case 'popularity':
          // Sort by featured first, then by retail_price descending (higher price = more popular assumption)
          query = query.order('featured', { ascending: false }).order('retail_price', { ascending: false })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      query = query.range(from, to)

      if (featured) query = query.eq('featured', true)
      if (bulkOnly) query = query.eq('is_bulk_available', true)
      if (inStockOnly) query = query.eq('stock_status', 'in_stock')
      if (typeof minPrice === 'number') query = query.gte('retail_price', minPrice)
      if (typeof maxPrice === 'number') query = query.lte('retail_price', maxPrice)
      if (search) query = applyProductSearch(query, search)
      if (categorySlug) query = query.eq('categories.slug', categorySlug)

      const { data, error: err, count } = await query

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      // Resolve thumbnail URL through Storage transform
      const resolved = (data ?? []).map((p) => ({
        ...p,
        thumbnail_url: p.thumbnail_url ? getProductImageUrl(p.thumbnail_url, 400) : null,
        categories: Array.isArray(p.categories) ? p.categories[0] ?? null : p.categories,
        product_variant_groups: Array.isArray(p.product_variant_groups)
          ? p.product_variant_groups[0] ?? null
          : p.product_variant_groups ?? null,
      })) as ProductWithCategory[]

      // Deduplicate: show only the first product per variant group
      const seenGroups = new Set<string>()
      const deduped = resolved.filter((p) => {
        if (!p.variant_group_id) return true
        if (seenGroups.has(p.variant_group_id)) return false
        seenGroups.add(p.variant_group_id)
        return true
      })

      setProducts(deduped)
      setTotalCount(count ?? 0)
      setError(null)
      setLoading(false)
    }

    fetch()
    return () => { cancelled = true }
  }, [categorySlug, search, featured, bulkOnly, inStockOnly, minPrice, maxPrice, sort, page, pageSize, version])

  return {
    products,
    loading,
    error,
    totalCount,
    hasMore: page * pageSize < totalCount,
    refetch,
  }
}
