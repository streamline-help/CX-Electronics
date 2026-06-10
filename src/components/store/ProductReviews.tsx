import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StarRating, StarInput } from './StarRating'
import type { ReviewsApi } from '../../hooks/useReviews'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ProductReviews({ api, productName }: { api: ReviewsApi; productName: string }) {
  const { reviews, count, average, distribution, myReview, isLoggedIn, submit, remove } = api

  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(myReview?.rating ?? 0)
  const [title, setTitle] = useState(myReview?.title ?? '')
  const [body, setBody] = useState(myReview?.body ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Keep the form in sync once the user's existing review loads in.
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating)
      setTitle(myReview.title ?? '')
      setBody(myReview.body ?? '')
    }
  }, [myReview])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1) {
      setError('Please select a star rating.')
      return
    }
    setSaving(true)
    setError(null)
    const err = await submit(rating, title, body)
    setSaving(false)
    if (err) setError(err)
    else setShowForm(false)
  }

  return (
    <section id="reviews" className="mt-12 scroll-mt-24">
      <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight mb-6">
        Customer reviews
      </h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6 mb-8">
        <div className="text-center sm:border-r sm:border-[#E5E7EB] sm:pr-10">
          <div className="text-4xl font-extrabold text-[#0F172A]">{count ? average.toFixed(1) : '—'}</div>
          <StarRating value={average} size={18} className="mt-1" />
          <p className="text-xs text-[#0F172A]/50 mt-1">{count} review{count === 1 ? '' : 's'}</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const n = distribution[star] ?? 0
            const pct = count ? (n / count) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-[#0F172A]/60">
                <span className="w-3">{star}</span>
                <StarRating value={1} size={11} className="!gap-0" />
                <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right">{n}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Write / edit */}
      <div className="mb-8">
        {!isLoggedIn ? (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#E5E7EB] rounded-xl px-5 py-4">
            <p className="text-sm text-[#0F172A]/70">Bought this? Sign in to share your review.</p>
            <Link
              to="/account/login"
              className="bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Sign in to review
            </Link>
          </div>
        ) : !showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#0F172A] hover:bg-[#1e293b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {myReview ? 'Edit your review' : 'Write a review'}
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Your rating</label>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Title <span className="font-normal text-[#0F172A]/40">(optional)</span></label>
              <input
                type="text"
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g. Great value`}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E63939] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">Your review <span className="font-normal text-[#0F172A]/40">(optional)</span></label>
              <textarea
                value={body}
                maxLength={2000}
                rows={4}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`What did you think of the ${productName}?`}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E63939] focus:border-transparent resize-none"
              />
            </div>
            {error && <p className="text-sm text-[#E63939]">{error}</p>}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#E63939] hover:bg-[#C82020] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                {saving ? 'Saving…' : myReview ? 'Update review' : 'Submit review'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm font-medium text-[#0F172A]/60 hover:text-[#0F172A]"
              >
                Cancel
              </button>
              {myReview && (
                <button
                  type="button"
                  onClick={async () => {
                    await remove()
                    setShowForm(false)
                    setRating(0)
                    setTitle('')
                    setBody('')
                  }}
                  className="ml-auto text-sm font-medium text-[#E63939]/70 hover:text-[#E63939]"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* List */}
      {count === 0 ? (
        <p className="text-sm text-[#0F172A]/50">No reviews yet — be the first to review the {productName}.</p>
      ) : (
        <ul className="space-y-6">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-[#E5E7EB] pb-6 last:border-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} size={14} />
                  <span className="text-sm font-semibold text-[#0F172A]">{r.author_name}</span>
                </div>
                <span className="text-xs text-[#0F172A]/40">{formatDate(r.created_at)}</span>
              </div>
              {r.title && <p className="mt-2 text-sm font-bold text-[#0F172A]">{r.title}</p>}
              {r.body && <p className="mt-1 text-sm text-[#0F172A]/70 leading-relaxed">{r.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
