import { Helmet } from 'react-helmet-async'

export const SITE_URL = 'https://cw-electronics.co.za'
export const SITE_NAME = 'CW Electronics'
const DEFAULT_IMAGE = 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1778137000/CW-Logo-black_mbfsn7.png'

interface BreadcrumbItem {
  name: string
  url: string
}

interface ProductSchema {
  name: string
  description: string
  image: string | string[]
  sku?: string
  brand?: string
  category?: string
  price: number
  currency?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition'
  url: string
  rating?: { value: number; count: number }
}

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
  noIndex?: boolean
  keywords?: string
  breadcrumbs?: BreadcrumbItem[]
  product?: ProductSchema
}

function absoluteUrl(url: string | undefined): string {
  if (!url) return SITE_URL
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function SEO({
  title = `${SITE_NAME} — Wholesale & Retail Electronics in Johannesburg`,
  description = 'Direct importer of CCTV cameras, NVR kits, WiFi routers, USB chargers, solar lights & smartwatches. Wholesale pricing from 6 units. Same-day Gauteng dispatch, nationwide delivery. China Cash and Carry, Crown Mines, Johannesburg.',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  keywords,
  breadcrumbs,
  product,
}: SEOProps) {
  const canonical = absoluteUrl(url)
  const ogImage = absoluteUrl(image)
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`

  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.name,
      item: absoluteUrl(b.url),
    })),
  } : null

  const productSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: Array.isArray(product.image) ? product.image : [product.image],
    ...(product.sku && { sku: product.sku }),
    ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
    ...(product.category && { category: product.category }),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(product.url),
      priceCurrency: product.currency ?? 'ZAR',
      price: product.price.toFixed(2),
      itemCondition: `https://schema.org/${product.condition ?? 'NewCondition'}`,
      availability: `https://schema.org/${product.availability ?? 'InStock'}`,
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
    ...(product.rating && product.rating.count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.value,
        reviewCount: product.rating.count,
      },
    }),
  } : null

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_ZA" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Geo */}
      <meta name="geo.region" content="ZA-GP" />
      <meta name="geo.placename" content="Crown Mines, Johannesburg" />

      {/* Structured data */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
    </Helmet>
  )
}
