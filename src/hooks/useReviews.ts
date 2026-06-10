import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { customerSupabase } from '../lib/customerAuth'
import { useCustomerAuth } from '../context/CustomerAuthContext'

export interface ProductReview {
  id: string
  product_id: string
  user_id: string
  author_name: string
  rating: number
  title: string | null
  body: string | null
  created_at: string
}

export interface ReviewsApi {
  reviews: ProductReview[]
  count: number
  average: number
  /** counts[1..5] = number of reviews at that star rating */
  distribution: Record<number, number>
  myReview: ProductReview | null
  loading: boolean
  isLoggedIn: boolean
  submit: (rating: number, title: string, body: string) => Promise<string | null>
  remove: () => Promise<void>
}

export function useReviews(productId: string | undefined): ReviewsApi {
  const { user } = useCustomerAuth()
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!productId) {
      setReviews([])
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('product_reviews')
      .select('id, product_id, user_id, author_name, rating, title, body, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    setReviews(data ?? [])
    setLoading(false)
  }, [productId])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const count = reviews.length
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0
  const distribution = reviews.reduce(
    (acc, r) => {
      acc[r.rating] = (acc[r.rating] ?? 0) + 1
      return acc
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
  )
  const myReview = user ? reviews.find((r) => r.user_id === user.id) ?? null : null

  const submit = useCallback(
    async (rating: number, title: string, body: string): Promise<string | null> => {
      if (!user) return 'Please sign in to your account to write a review.'
      if (!productId) return 'Product not found.'
      const { error } = await customerSupabase.from('product_reviews').upsert(
        {
          product_id: productId,
          user_id: user.id,
          author_name: user.name || 'Customer',
          rating,
          title: title.trim() || null,
          body: body.trim() || null,
        },
        { onConflict: 'product_id,user_id' },
      )
      if (error) return error.message
      await load()
      return null
    },
    [user, productId, load],
  )

  const remove = useCallback(async () => {
    if (!myReview) return
    await customerSupabase.from('product_reviews').delete().eq('id', myReview.id)
    await load()
  }, [myReview, load])

  return {
    reviews,
    count,
    average,
    distribution,
    myReview,
    loading,
    isLoggedIn: !!user,
    submit,
    remove,
  }
}
