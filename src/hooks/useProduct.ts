import { useState, useEffect } from 'react'
import { supabase, getProductImageUrl, type ProductWithCategory } from '../lib/supabase'

interface UseProductResult {
  product: ProductWithCategory | null
  loading: boolean
  error: string | null
}

export function useProduct(slug: string): UseProductResult {
  const [product, setProduct] = useState<ProductWithCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)

    async function fetch() {
      const { data, error: err } = await supabase
        .from('products')
        .select(
          'id, name, name_zh, slug, description, description_zh, category_id, brand, gtin, mpn, retail_price, bulk_price, bulk_min_qty, is_bulk_available, images, thumbnail_url, active, featured, stock_status, variants, variant_group_id, variant_label, specifications, created_at, updated_at, categories(id, name, name_zh, slug)',
        )
        .eq('slug', slug)
        .eq('active', true)
        .single()

      if (cancelled) return

      if (err || !data) {
        setError(err?.message ?? 'Product not found')
        setLoading(false)
        return
      }

      const resolved: ProductWithCategory = {
        ...data,
        thumbnail_url: data.thumbnail_url ? getProductImageUrl(data.thumbnail_url, 800) : null,
        images: (data.images ?? []).map((path: string) => getProductImageUrl(path, 800)),
        categories: Array.isArray(data.categories) ? data.categories[0] ?? null : data.categories,
        variants: data.variants ?? [],
      }

      setProduct(resolved)
      setError(null)
      setLoading(false)
    }

    fetch()
    return () => { cancelled = true }
  }, [slug])

  return { product, loading, error }
}
