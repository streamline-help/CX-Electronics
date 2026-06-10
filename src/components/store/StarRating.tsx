import { useState } from 'react'
import { Star } from 'lucide-react'

interface DisplayProps {
  value: number
  size?: number
  className?: string
}

/** Read-only star display (supports fractional fill via rounding to nearest). */
export function StarRating({ value, size = 16, className = '' }: DisplayProps) {
  const rounded = Math.round(value)
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= rounded ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-200'}
        />
      ))}
    </div>
  )
}

interface InputProps {
  value: number
  onChange: (value: number) => void
  size?: number
}

/** Interactive star picker for the review form. */
export function StarInput({ value, onChange, size = 28 }: InputProps) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            style={{ width: size, height: size }}
            className={i <= active ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100'}
          />
        </button>
      ))}
    </div>
  )
}
