import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Loader2, ArrowRight, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, getProductImageUrl } from '../../lib/supabase'
import { applyProductSearch } from '../../lib/search'
import { useLang } from '../../context/LangContext'

interface SearchHit {
  id: string
  name: string
  name_zh: string | null
  slug: string
  retail_price: number
  thumbnail_url: string | null
  category_name: string | null
}

interface NavbarSearchProps {
  /** "desktop" — full bar in header. "mobile" — drawer-friendly compact form. */
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

const RECENT_KEY = 'cw-recent-searches'
const MAX_RECENT = 5

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] }
}
function saveRecent(q: string) {
  if (!q.trim()) return
  const recent = loadRecent().filter((r) => r.toLowerCase() !== q.toLowerCase())
  recent.unshift(q)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

export function NavbarSearch({ variant = 'desktop', onNavigate }: NavbarSearchProps) {
  const navigate = useNavigate()
  const { lang } = useLang()
  const [value, setValue] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const [recent, setRecent] = useState<string[]>(loadRecent)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Debounced fetch
  useEffect(() => {
    const q = value.trim()
    if (q.length < 2) {
      setHits([])
      setLoading(false)
      return
    }
    setLoading(true)
    const handle = setTimeout(async () => {
      // Cancel previous in-flight request
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      try {
        let query = supabase
          .from('products')
          .select(
            'id, name, name_zh, slug, retail_price, thumbnail_url, categories!inner(id, name, slug)',
          )
          .eq('active', true)
        query = applyProductSearch(query, q)
        const { data } = await query
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6)
          .abortSignal(ctrl.signal)

        const resolved: SearchHit[] = (data ?? []).map((p) => ({
          id: p.id as string,
          name: p.name as string,
          name_zh: (p.name_zh as string | null) ?? null,
          slug: p.slug as string,
          retail_price: p.retail_price as number,
          thumbnail_url: p.thumbnail_url ? getProductImageUrl(p.thumbnail_url as string, 120) : null,
          category_name: Array.isArray(p.categories) ? p.categories[0]?.name ?? null : (p.categories as { name?: string } | null)?.name ?? null,
        }))
        setHits(resolved)
      } catch { /* aborted */ }
      setLoading(false)
    }, 220)
    return () => clearTimeout(handle)
  }, [value])

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Reset highlight when results change
  useEffect(() => {
    setHighlight(-1)
  }, [hits])

  const goToShop = useCallback((q: string) => {
    saveRecent(q)
    setRecent(loadRecent())
    setOpen(false)
    onNavigate?.()
    if (q.trim()) navigate(`/shop?q=${encodeURIComponent(q.trim())}`)
    else navigate('/shop')
  }, [navigate, onNavigate])

  const goToProduct = useCallback((slug: string) => {
    saveRecent(value)
    setRecent(loadRecent())
    setOpen(false)
    onNavigate?.()
    navigate(`/shop/${slug}`)
  }, [navigate, onNavigate, value])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(hits.length - 1, h + 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(-1, h - 1))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlight >= 0 && hits[highlight]) {
        goToProduct(hits[highlight].slug)
      } else {
        goToShop(value)
      }
    }
  }

  function clearInput() {
    setValue('')
    setHits([])
    inputRef.current?.focus()
  }

  const showDropdown = open && (loading || hits.length > 0 || (value.length < 2 && recent.length > 0))
  const hasQuery = value.trim().length >= 2

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={(e) => { e.preventDefault(); goToShop(value) }}
        className={`flex w-full bg-slate-800 border border-slate-600 rounded-lg overflow-hidden transition-colors focus-within:border-[#E63939] ${
          variant === 'mobile' ? '' : 'shadow-sm'
        }`}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => { setValue(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKey}
            placeholder={lang === 'zh' ? '搜索产品...' : 'Search chargers, CCTV, routers...'}
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-transparent text-white placeholder:text-slate-400 focus:outline-none"
            aria-label="Search products"
            autoComplete="off"
          />
          {value && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-[#E63939] hover:bg-[#C82020] px-4 sm:px-5 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label="Search"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-white" />
          )}
        </button>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          >
            {/* Recent searches when empty */}
            {!hasQuery && recent.length > 0 && (
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">Recent</p>
                <div className="flex flex-wrap gap-1.5">
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setValue(r); setOpen(true) }}
                      className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {hasQuery && (
              <>
                {loading && hits.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </div>
                ) : hits.length === 0 ? (
                  <div className="py-8 px-5 text-center">
                    <Package className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">No matches</p>
                    <p className="text-xs text-gray-500 mt-0.5 mb-3">
                      Try a different keyword or browse our full shop.
                    </p>
                    <button
                      type="button"
                      onClick={() => goToShop(value)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63939] hover:gap-2 transition-all"
                    >
                      Search shop for "{value}"
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <ul className="py-1.5">
                    {hits.map((h, i) => {
                      const displayName = lang === 'zh' && h.name_zh ? h.name_zh : h.name
                      return (
                        <li key={h.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setHighlight(i)}
                            onClick={() => goToProduct(h.slug)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                              highlight === i ? 'bg-[#FEE9E9]' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {h.thumbnail_url ? (
                                <img src={h.thumbnail_url} alt={displayName} className="w-full h-full object-contain p-1" />
                              ) : (
                                <Package className="w-5 h-5 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                              {h.category_name && (
                                <p className="text-[11px] text-gray-400 truncate">{h.category_name}</p>
                              )}
                            </div>
                            <p className="text-sm font-bold text-[#E63939] flex-shrink-0">
                              R{h.retail_price.toFixed(0)}
                            </p>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {/* See all results */}
                {hits.length > 0 && (
                  <button
                    type="button"
                    onClick={() => goToShop(value)}
                    className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors"
                  >
                    <span>See all results for "<span className="text-[#E63939]">{value}</span>"</span>
                    <ArrowRight className="w-4 h-4 text-[#E63939]" />
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
