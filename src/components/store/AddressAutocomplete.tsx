import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'

// Geoapify Geocoding Autocomplete — Google Places alternative.
// https://apidocs.geoapify.com/docs/geocoding/autocomplete/

const API_KEY =
  (import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined) ||
  'faa0700ea6ed45fb88a921d4233cfa6b'

export interface ParsedAddress {
  address_line1: string
  city: string
  province: string
  postal_code: string
}

interface Suggestion {
  place_id: string
  formatted: string
  parsed: ParsedAddress
}

interface Props {
  value: string
  onChange: (value: string) => void
  onSelect: (parsed: ParsedAddress) => void
  className?: string
  placeholder?: string
  required?: boolean
}

interface GeoapifyFeature {
  properties: {
    place_id?: string
    formatted?: string
    housenumber?: string
    street?: string
    address_line1?: string
    city?: string
    town?: string
    village?: string
    suburb?: string
    county?: string
    state?: string
    postcode?: string
  }
}

function parseFeature(feature: GeoapifyFeature): Suggestion {
  const p = feature.properties
  const houseNum = p.housenumber ?? ''
  const street = p.street ?? ''
  const line1 = [houseNum, street].filter(Boolean).join(' ').trim() || p.address_line1 || ''
  const city = p.city || p.town || p.village || p.suburb || p.county || ''
  return {
    place_id: p.place_id ?? `${p.formatted}-${Math.random()}`,
    formatted: p.formatted ?? line1,
    parsed: {
      address_line1: line1,
      city,
      province: p.state ?? '',
      postal_code: p.postcode ?? '',
    },
  }
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  className,
  placeholder = 'Start typing your address...',
  required = false,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<number | null>(null)
  const skipNextFetchRef = useRef(false)

  // Debounced fetch
  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false
      return
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current)

    const trimmed = value.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setOpen(false)
      setHasFetched(false)
      setFetchError(null)
      return
    }

    debounceRef.current = window.setTimeout(() => {
      // Cancel any in-flight request
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setFetchError(null)
      const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete')
      url.searchParams.set('text', trimmed)
      url.searchParams.set('filter', 'countrycode:za')
      url.searchParams.set('limit', '6')
      url.searchParams.set('format', 'geojson')
      url.searchParams.set('apiKey', API_KEY)

      fetch(url.toString(), { signal: controller.signal })
        .then(async (r) => {
          if (!r.ok) {
            const body = await r.text().catch(() => '')
            throw new Error(`Geoapify ${r.status}: ${body.slice(0, 120)}`)
          }
          return r.json()
        })
        .then((data: { features?: GeoapifyFeature[] }) => {
          const results = (data.features ?? []).map(parseFeature)
          setSuggestions(results)
          setOpen(true)
          setActiveIdx(-1)
          setHasFetched(true)
        })
        .catch((err) => {
          if (err.name === 'AbortError') return
          console.warn('Address autocomplete failed:', err)
          setFetchError(err.message ?? 'Lookup failed')
          setSuggestions([])
          setOpen(true)
          setHasFetched(true)
        })
        .finally(() => setLoading(false))
    }, 250)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
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

  function choose(s: Suggestion) {
    skipNextFetchRef.current = true
    onChange(s.parsed.address_line1 || s.formatted)
    onSelect(s.parsed)
    setSuggestions([])
    setOpen(false)
    setActiveIdx(-1)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      choose(suggestions[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showDropdown = open && (suggestions.length > 0 || fetchError || (hasFetched && !loading))

  return (
    <div ref={containerRef} className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => {
          if (suggestions.length > 0 || fetchError) setOpen(true)
        }}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={(className ?? '') + ' pl-9'}
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 animate-spin" />
      )}

      {showDropdown && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto">
          {fetchError ? (
            <li className="px-3 py-3 text-sm flex items-start gap-2 text-red-600">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Address lookup unavailable</p>
                <p className="text-xs text-red-500 mt-0.5">{fetchError}</p>
                <p className="text-xs text-gray-500 mt-1">You can still type your address manually.</p>
              </div>
            </li>
          ) : suggestions.length === 0 ? (
            <li className="px-3 py-3 text-sm text-gray-500">
              No matches — keep typing or enter your address manually.
            </li>
          ) : (
            suggestions.map((s, i) => (
              <li key={s.place_id}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); choose(s) }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-start gap-2 ${
                    i === activeIdx ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 leading-snug">{s.formatted}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
