import { useParams, Navigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO, { SITE_URL, SITE_NAME } from '../../components/SEO'
import { getBlogPost } from '../../lib/blog'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function BlogPost() {
  const { slug = '' } = useParams<{ slug: string }>()
  const post = getBlogPost(slug)

  if (!post) return <Navigate to="/blog" replace />

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.datePublished,
    dateModified: post.datePublished,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title={post.metaTitle}
        description={post.metaDescription}
        url={`/blog/${post.slug}`}
        type="article"
        keywords={[post.eyebrow, 'South Africa', 'Johannesburg', 'CW Electronics'].join(', ')}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Guides', url: '/blog' },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>
      <Navbar />

      <article className="flex-1">
        {/* Header */}
        <header className="bg-[#0F172A] text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors mb-5">
              <ArrowLeft className="w-3.5 h-3.5" /> All guides
            </Link>
            <p className="text-xs font-semibold text-[#E63939] uppercase tracking-widest mb-2">{post.eyebrow}</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-balance leading-tight">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center gap-4 text-xs text-white/50">
              <span>{formatDate(post.datePublished)}</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{post.readMinutes} min read</span>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {post.intro.map((p, i) => (
            <p key={i} className="text-[#0F172A]/80 text-base leading-relaxed text-pretty mb-5">{p}</p>
          ))}

          {post.sections.map((section, i) => (
            <section key={i} className="mt-8">
              {section.heading && (
                <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight mb-3 text-balance">{section.heading}</h2>
              )}
              {section.paragraphs?.map((p, j) => (
                <p key={j} className="text-[#0F172A]/80 text-base leading-relaxed text-pretty mb-4">{p}</p>
              ))}
              {section.bullets && (
                <ul className="space-y-2 mb-4">
                  {section.bullets.map((b, j) => (
                    <li key={j} className="flex gap-3 text-[#0F172A]/80 text-base leading-relaxed">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#E63939] flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {/* Related links */}
          {post.related && post.related.length > 0 && (
            <div className="mt-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Shop the range</p>
              <div className="flex flex-wrap gap-3">
                {post.related.map((r) => (
                  <Link
                    key={r.to}
                    to={r.to}
                    className="inline-flex items-center gap-1.5 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                  >
                    {r.label} <ArrowRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  )
}
