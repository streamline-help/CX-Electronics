// Shared product-search helpers. Splits a query into words and matches each
// word against name / description / code / slug (AND between words, OR across
// fields) so results survive word-order, punctuation, and old catalog codes
// even though codes were removed from display names.

const STOP = new Set(['the', 'and', 'for', 'with', 'a', 'an', 'of', 'to', 'in', 'on', 'set', 'pack'])

/** Tokenise a raw query into searchable words (≥2 chars, de-duped, capped). */
export function searchTerms(raw: string): string[] {
  return [
    ...new Set(
      raw
        .toLowerCase()
        .replace(/[%(),*]/g, ' ')
        .split(/[\s\-_/]+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2 && !STOP.has(t)),
    ),
  ].slice(0, 6)
}

/** PostgREST `.or()` string matching one term across the searchable columns. */
export function searchOr(term: string): string {
  const t = term.replace(/[%(),*]/g, '').trim()
  return `name.ilike.%${t}%,description.ilike.%${t}%,code.ilike.%${t}%,slug.ilike.%${t}%`
}

/**
 * Apply tokenised search to a Supabase query builder.
 * Each word becomes its own `.or(...)`, which PostgREST ANDs together.
 */
export function applyProductSearch<T>(query: T, raw: string): T {
  const q = query as { or: (s: string) => T }
  const terms = searchTerms(raw)
  if (terms.length === 0) {
    const fallback = raw.trim()
    return fallback ? q.or(searchOr(fallback)) : (query as T)
  }
  let out = query as T
  for (const term of terms) out = (out as { or: (s: string) => T }).or(searchOr(term))
  return out
}
