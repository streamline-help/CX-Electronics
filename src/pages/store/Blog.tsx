import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'
import { BLOG_POSTS } from '../../lib/blog'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function Blog() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Buying Guides & Advice"
        description="Practical buying guides for CCTV, security cameras, routers and electronics in South Africa — from CW Electronics, a direct importer in Johannesburg."
        url="/blog"
        keywords="CCTV buying guide South Africa, best security camera, 4G router load-shedding, electronics advice Johannesburg"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Guides', url: '/blog' },
        ]}
      />
      <Navbar />

      <section className="relative bg-[#0F172A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <p className="text-xs font-semibold text-[#E63939] uppercase tracking-widest mb-2">CW Electronics</p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-balance">Buying Guides & Advice</h1>
          <p className="text-white/60 mt-3 max-w-2xl text-sm md:text-base text-pretty">
            Honest, practical guides to help you choose the right CCTV, security cameras, routers and gear — written by a
            team that imports and sells this stuff every day.
          </p>
        </div>
      </section>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex flex-col bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#E63939]/60 hover:shadow-xl hover:shadow-[#E63939]/10 transition-all"
            >
              <p className="text-[11px] font-bold text-[#E63939] uppercase tracking-widest">{post.eyebrow}</p>
              <h2 className="mt-2 text-lg font-extrabold text-[#0F172A] tracking-tight text-balance leading-snug">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-[#0F172A]/60 leading-relaxed flex-1">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-[#0F172A]/40">
                <span>{formatDate(post.datePublished)}</span>
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{post.readMinutes} min read</span>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#E63939]">
                Read guide <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
