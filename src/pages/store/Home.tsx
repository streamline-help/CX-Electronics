import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, Wifi, Shield, Watch, Sun, Plug, Smartphone,
  ArrowRight, ChevronLeft, ChevronRight, ChevronDown,
  Clock, Tag, BadgeCheck, RotateCcw, MapPin, TrendingUp,
  Phone, MessageCircle, Sparkles, HelpCircle,
} from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'
import { useProducts } from '../../hooks/useProducts'
import { ProductCardLight } from '../../components/store/ProductCardLight'
import { CategoryGrid } from '../../components/store/CategoryGrid'
import { MagneticButton } from '../../components/store/MagneticButton'

// ── Branded contact constants ─────────────────────────────────
const WHATSAPP_NUMBER = '27649533333'
const MAP_EMBED =
  'https://www.google.com/maps?q=China+Mart+3+Press+Avenue+Crown+Mines+Johannesburg&output=embed'
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=China+Mart+3+Press+Avenue+Crown+Mines+Johannesburg+2092'

// ── Hero slides ──────────────────────────────────────────────
const HERO_SLIDES = [
  {
    image: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777485480/jjm1c_lyxled.jpg',
    eyebrow: 'Trade Pricing Available',
    title: 'Powering South Africa',
    titleAccent: 'with CCTV & Security',
    sub: 'Direct importer pricing on 4MP cameras, NVR kits & access control. Trade discounts for installers and resellers.',
    primary: { label: 'Shop CCTV', href: '/shop?category=cctv' },
    secondary: { label: 'See Wholesale Rates', href: '/wholesale' },
  },
  {
    image: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777485480/n2kIN_lmgy9y.jpg',
    eyebrow: 'New Stock In',
    title: 'Wholesale Electronics',
    titleAccent: 'Direct Importer',
    sub: 'Chargers, cables, adapters and routers — straight from the importer. Stocked at China Cash and Carry, Crown Mines.',
    primary: { label: 'Shop Retail', href: '/shop' },
    secondary: { label: 'Browse Bulk Deals', href: '/deals' },
  },
  {
    image: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777485480/buLqZ_cik8zf.jpg',
    eyebrow: 'Off-Grid Ready',
    title: 'Solar Lamps & Routers',
    titleAccent: 'Built for Africa',
    sub: 'Solar street lamps, power banks and WiFi 6 routers. Bulk pricing for installers and retailers.',
    primary: { label: 'Shop Solar', href: '/shop?category=solar' },
    secondary: { label: 'Reseller Pricing', href: '/deals' },
  },
]

// ── Categories ───────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'chargers', label: 'Chargers & Cables', icon: Plug, desc: 'USB-C, Lightning, Fast Charge', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Chargers_Cables_Category_bcxrsr.jpg' },
  { slug: 'cctv', label: 'CCTV & Security', icon: Shield, desc: '4K Cameras & NVR Kits', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/CCTV_Security_Category_2_y2g9zt.jpg' },
  { slug: 'routers', label: 'Routers & Networking', icon: Wifi, desc: 'WiFi 6, LTE, Mesh Systems', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Routers_Networking_Category_um72f1.jpg' },
  { slug: 'smartwatches', label: 'Smartwatches', icon: Watch, desc: 'Fitness & Health Tracking', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Smartwatches_c2flp6.jpg' },
  { slug: 'solar', label: 'Solar Lamps & Lighting', icon: Sun, desc: 'Off-Grid Street Lighting', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Solar_Lamps_Lighting_ev6x1n.jpg' },
  { slug: 'accessories', label: 'Phone & Laptop Accessories', icon: Smartphone, desc: 'Cases, Stands, Adapters', img: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Phone_Laptop_Accessories_y5kvpa.jpg' },
]

// ── Trust badges ─────────────────────────────────────────────
const TRUST = [
  { icon: Clock,      title: 'Same-Day Collection', sub: 'China Cash and Carry, Crown Mines' },
  { icon: Tag,        title: 'Trade Pricing',        sub: 'From 6+ units' },
  { icon: BadgeCheck, title: 'Direct Importer',      sub: 'Best prices, no middlemen' },
  { icon: RotateCcw,  title: '7-Day Return Policy',  sub: 'Photo required · customer pays return' },
]

// ── Stats ────────────────────────────────────────────────────
const STATS = [
  { value: 10000, suffix: '+', label: 'Orders Delivered' },
  { value: 500,   suffix: '+', label: 'Trade Customers' },
  { value: 24,    suffix: 'h', label: 'JHB Delivery' },
  { value: 4.9,   suffix: '★', label: 'Customer Rating', isFloat: true },
]

// ── Smooth easing ────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const

// ─────────────────────────────────────────────────────────────
export function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title="CW Electronics — Wholesale & Retail Electronics in Johannesburg"
        description="Direct importer of CCTV cameras, NVR kits, WiFi routers, USB chargers, solar lights and smartwatches. Wholesale pricing from 6 units. Same-day Gauteng dispatch, nationwide delivery. China Cash and Carry, Crown Mines, JHB."
        url="/"
        keywords="electronics wholesale Johannesburg, CCTV cameras South Africa, NVR kits, WiFi routers, USB chargers, solar lights, smartwatches, China Cash and Carry Crown Mines, electronics importer JHB, wholesale electronics South Africa, trade pricing installers"
      />
      <Navbar />
      <HeroCarousel />
      <TrustBar />
      <FeaturedCategories />
      <CategoryGrid
        eyebrow="Browse Everything"
        heading="Shop by Category"
        subtitle="Every product line we carry — find exactly what you need."
      />
      <StatsBand />
      <BestSellers />
      <LocationSection />
      <WhyChooseCW />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// FAQ SECTION — accordion of high-intent questions (SEO + conversion)
// Mirrors the FAQPage schema in index.html — both signals reinforce
// Google's rich-results eligibility.
// ═══════════════════════════════════════════════════════════════
const FAQS = [
  {
    q: 'Where is CW Electronics located?',
    a: "We're at Unit 303, China Cash and Carry, Cnr Discovery Drive & Renaissance Blvd, Crown Mines, Johannesburg, 2092. Open every day, 09:00 – 15:00. Walk-ins welcome — bring your order number if collecting.",
  },
  {
    q: 'Do you offer wholesale or trade pricing?',
    a: "Yes — wholesale rates start at 6 units per product line, with bigger discounts at 20+ and 50+ units. Get a quote via WhatsApp (+27 64 953 3333) or browse Wholesale to see live trade prices.",
  },
  {
    q: 'How fast is delivery across South Africa?',
    a: "Same-day dispatch on orders placed before 12:00 weekdays. Gauteng typically arrives in 1–2 business days. Major cities (Cape Town, Durban, PE) 2–3 days. Remote areas 3–5 days. Tracking sent via email and WhatsApp.",
  },
  {
    q: 'What is your return policy?',
    a: "7-day returns from the date of delivery for faulty, damaged or not-as-described items. Send us a photo first via WhatsApp or email, then ship the item back in original packaging. Return shipping is the customer's responsibility.",
  },
  {
    q: 'What payment methods do you accept?',
    a: "All major credit/debit cards via PayFast, Instant EFT, Capitec Pay, SnapScan, and manual EFT for wholesale orders. Cash on collection accepted at our Crown Mines showroom.",
  },
  {
    q: 'Do you sell CCTV camera systems and security?',
    a: "Yes — we are a direct importer of 4MP and 8MP IP cameras, NVR kits, PTZ cameras, access control and intercoms. Installer pricing available from 6 units.",
  },
]

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="border-b border-gray-100 last:border-b-0"
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 py-5 text-left hover:text-[#E63939] transition-colors"
      >
        <span className="text-base sm:text-lg font-bold text-gray-900 hover:text-[#E63939] transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[#E63939] flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm sm:text-base text-gray-600 leading-relaxed pr-8 text-pretty">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  return (
    <section className="py-16 sm:py-24 bg-white" aria-label="Frequently Asked Questions">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63939] uppercase tracking-widest mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Common Questions
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight text-balance">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 mt-3 text-pretty max-w-xl mx-auto">
            Quick answers about delivery, wholesale rates, returns and payment.
          </p>
        </motion.div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 sm:px-8">
          {FAQS.map((item, i) => (
            <FAQItem
              key={item.q}
              q={item.q}
              a={item.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500 mb-3">
            Still got a question? We usually reply within an hour during business hours.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20CW%20%E2%80%94%20I%27ve%20got%20a%20question.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold px-7 py-3 rounded-xl transition-all text-sm hover:-translate-y-0.5"
          >
            <MessageCircle className="w-4 h-4" />
            Ask Us on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// HERO CAROUSEL with parallax + spring transitions
// ═══════��═══════════════════════════════════════════════════════
function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const yParallax = useTransform(scrollY, [0, 600], [0, 120])
  const opacityParallax = useTransform(scrollY, [0, 400], [1, 0.4])

  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % HERO_SLIDES.length),
      6500,
    )
    return () => clearInterval(t)
  }, [])

  const slide = HERO_SLIDES[index]

  function go(delta: number) {
    setIndex((i) => (i + delta + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  return (
    <section
      ref={heroRef}
      className="relative bg-[#0F172A] overflow-hidden isolate"
    >
      <div className="relative h-[520px] sm:h-[580px] lg:h-[620px]">
        {/* Background parallax */}
        <motion.div
          style={{ y: yParallax, opacity: opacityParallax }}
          className="absolute inset-0"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="absolute inset-0"
            >
              <img
                src={slide.image || '/placeholder.svg'}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/60 to-[#0F172A]/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Grain texture — barely visible, gives premium analog feel (Apple/Nothing trick) */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none z-[2]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>")',
          }}
        />

        {/* Decorative red lightning bolt */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-0 top-0 h-full w-1/2 hidden md:flex items-center justify-end pointer-events-none"
        >
          <Zap
            className="w-[480px] h-[480px] text-[#E63939] opacity-20 translate-x-20"
            strokeWidth={1}
          />
        </motion.div>

        {/* Red glow */}
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-[#E63939]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="max-w-2xl"
            >
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-[#E63939]/15 border border-[#E63939]/40 rounded-full px-4 py-1.5 text-xs text-[#E63939] font-bold mb-5 uppercase tracking-widest backdrop-blur-sm"
              >
                <Zap className="w-3 h-3 fill-[#E63939]" />
                {slide.eyebrow}
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.6, ease: EASE }}
                className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.02] mb-5 text-balance tracking-tight"
              >
                {slide.title}
                <br />
                <span className="bg-gradient-to-r from-[#E63939] via-[#FF6B6B] to-[#E63939] bg-clip-text text-transparent">
                  {slide.titleAccent}
                </span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5 }}
                className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl text-pretty"
              >
                {slide.sub}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <MagneticButton
                  href={slide.primary.href}
                  className="group inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#E63939]/40 text-sm hover:shadow-xl hover:shadow-[#E63939]/50"
                >
                  {slide.primary.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </MagneticButton>
                <Link
                  to={slide.secondary.href}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors border border-white/20 text-sm backdrop-blur-md"
                >
                  {slide.secondary.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrows */}
        <button
          onClick={() => go(-1)}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-[#E63939] backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-white transition-all hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => go(1)}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-[#E63939] backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-white transition-all hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? 'w-10 bg-[#E63939]' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Scroll cue — gently pulsing mouse icon (desktop only) */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute right-6 bottom-7 hidden lg:flex flex-col items-center gap-2 z-10 pointer-events-none"
        >
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold rotate-90 origin-bottom translate-y-3">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// TRUST BAR
// ═══════════════════════════════════════════════════════════════
function TrustBar() {
  return (
    <section className="bg-white border-b border-gray-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
          {TRUST.map(({ icon: Icon, title, sub }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, ease: EASE }}
              className="flex items-center gap-3 px-5 py-5 group"
            >
              <div className="w-11 h-11 bg-[#FEE9E9] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#E63939] transition-colors">
                <Icon className="w-5 h-5 text-[#E63939] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// FEATURED CATEGORIES — premium hover lift + bottom CTAs
// ═══════════════════════════════════════════════════════════════
function FeaturedCategories() {
  return (
    <section className="py-16 sm:py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2">
            Browse By Category
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 text-balance tracking-tight">
            Featured Categories
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-pretty">
            From CCTV to chargers — explore the categories driving our biggest sales.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CATEGORIES.map(({ slug, label, desc, icon: Icon, img }, i) => (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
              whileHover={{ y: -6 }}
              className="will-change-transform"
            >
              <Link
                to={`/shop?category=${slug}`}
                className="group block bg-white rounded-2xl border border-gray-100 hover:border-[#E63939]/40 hover:shadow-2xl hover:shadow-[#E63939]/10 transition-all overflow-hidden h-full"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
                  <img
                    src={img || '/placeholder.svg'}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-3 left-3 w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:bg-[#E63939] transition-all duration-300">
                    <Icon className="w-5 h-5 text-[#E63939] group-hover:text-white transition-colors" />
                  </div>
                </div>

                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-0.5 text-base">{label}</h3>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E63939] group-hover:gap-2.5 transition-all">
                    Shop
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-[#E63939]/30 text-sm hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#E63939]/40"
          >
            Shop All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/shop?view=categories"
            className="group inline-flex items-center gap-2 border-2 border-[#E63939] text-[#E63939] hover:bg-[#E63939] hover:text-white font-bold px-8 py-3.5 rounded-xl transition-all text-sm hover:-translate-y-0.5"
          >
            View All Categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// STATS BAND with animated counters
// ═══════════════════════════════════════════════════════════════
function StatsBand() {
  return (
    <section className="py-14 bg-[#0F172A] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((s, i) => (
            <AnimatedStat key={s.label} stat={s} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  )
}

function AnimatedStat({
  stat,
  delay,
}: {
  stat: typeof STATS[number]
  delay: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const target = stat.value
    const duration = 1400
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(stat.isFloat ? Number((target * eased).toFixed(1)) : Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, stat.value, stat.isFloat])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="text-center"
    >
      <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        <span className="text-white">
          {stat.isFloat ? display.toFixed(1) : display.toLocaleString()}
        </span>
        <span className="text-[#E63939]">{stat.suffix}</span>
      </p>
      <p className="text-xs text-white/50 uppercase tracking-widest font-bold mt-2">
        {stat.label}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// BEST SELLERS — horizontal scroll-snap row (desktop) / grid (mobile)
// ═══════════════════════════════════════════════════════════════
function BestSellers() {
  const { products, loading } = useProducts({ sort: 'featured', pageSize: 8 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  function updateArrows() {
    const el = scrollRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [products.length])

  function scrollBy(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAFC] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Top Picks
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Best Sellers
            </h2>
            <p className="text-gray-500 mt-2 max-w-md text-sm">
              Real products. Real installer prices. Stocked in Crown Mines.
            </p>
          </div>

          {/* Desktop: arrows + view all  ·  Mobile: just view all */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => scrollBy(-360)}
                disabled={!canPrev}
                aria-label="Previous"
                className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center ${
                  canPrev
                    ? 'bg-white border-gray-200 text-gray-700 hover:bg-[#E63939] hover:text-white hover:border-[#E63939] hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-[#E63939]/30'
                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollBy(360)}
                disabled={!canNext}
                aria-label="Next"
                className={`w-10 h-10 rounded-full border transition-all flex items-center justify-center ${
                  canNext
                    ? 'bg-white border-gray-200 text-gray-700 hover:bg-[#E63939] hover:text-white hover:border-[#E63939] hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-[#E63939]/30'
                    : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#E63939] hover:gap-2 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Mobile: 2-col grid as before */}
        <div className="grid grid-cols-2 gap-4 lg:hidden">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : products.slice(0, 4).map((p) => (
                <ProductCardLight key={p.id} product={p} basePath="/shop" />
              ))}
        </div>

        {/* Desktop: horizontal scroll-snap row with edge fades */}
        <div className="relative hidden lg:block">
          {/* Left edge gradient fade */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
              canPrev ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {/* Right edge gradient fade */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
              canNext ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 -mx-1 px-1"
            style={{ scrollPaddingLeft: '4px', scrollPaddingRight: '4px' }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[280px] snap-start">
                    <ProductCardSkeleton />
                  </div>
                ))
              : products.map((p) => (
                  <div key={p.id} className="flex-shrink-0 w-[280px] snap-start">
                    <ProductCardLight product={p} basePath="/shop" />
                  </div>
                ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 border-2 border-[#E63939] text-[#E63939] hover:bg-[#E63939] hover:text-white font-bold px-8 py-3.5 rounded-xl transition-all text-sm hover:shadow-lg hover:shadow-[#E63939]/30"
          >
            View All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// Branded skeleton — subtle shimmer that matches our motion language
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="aspect-square bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 animate-pulse" />
      <div className="p-4 flex-1 space-y-2">
        <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        <div className="h-5 w-1/2 bg-gray-100 rounded animate-pulse mt-2" />
        <div className="h-9 w-full bg-gray-100 rounded-lg animate-pulse mt-3" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// LOCATION SECTION — Google Maps + China Cash and Carry address
// ═══════════════════════════════════════════════════════════════
function LocationSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-2">
            Visit Our Showroom
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 text-balance tracking-tight">
            Find Us at China Cash and Carry
          </h2>
          <p className="text-gray-500 mt-3 text-pretty leading-relaxed">
            Come see our full range in person. We're at China Cash and Carry, Crown Mines —
            ready to help installers, retailers, and walk-in customers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-3 gap-5"
        >
          {/* Map */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-white aspect-[16/10] lg:aspect-auto lg:min-h-[420px]">
            <iframe
              title="CW Electronics Location — China Mart, Crown Mines, Johannesburg"
              src={MAP_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Address card */}
          <div className="bg-[#0F172A] text-white rounded-2xl p-7 flex flex-col">
            <div className="w-12 h-12 bg-[#E63939] rounded-xl flex items-center justify-center mb-5">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold mb-2">Our Showroom</h3>
            <p className="text-white/70 text-sm leading-relaxed mb-1">
              Unit 303, China Cash and Carry
            </p>
            <p className="text-white/70 text-sm leading-relaxed mb-1">
              Cnr Discovery Drive & Renaissance Blvd
            </p>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              Crown Mines, Johannesburg, 2092
            </p>

            <div className="space-y-3 text-sm border-t border-white/10 pt-5 mb-6">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-[#E63939] flex-shrink-0" />
                <div>
                  <div className="text-white/60 text-xs">Emily</div>
                  <a href="tel:+27649533333" className="font-semibold hover:text-[#E63939] transition-colors">
                    064 953 3333
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-[#E63939] flex-shrink-0" />
                <div>
                  <div className="text-white/60 text-xs">Kevin</div>
                  <a href="tel:+27628058899" className="font-semibold hover:text-[#E63939] transition-colors">
                    062 805 8899
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 mt-0.5 text-[#E63939] flex-shrink-0" />
                <div>
                  <div className="text-white/60 text-xs">WhatsApp</div>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:text-[#E63939] transition-colors"
                  >
                    Chat with us
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 mt-0.5 text-[#E63939] flex-shrink-0" />
                <div>
                  <div className="text-white/60 text-xs">Trading Hours</div>
                  <div className="font-semibold">Mon – Sun: 09:00 – 15:00</div>
                </div>
              </div>
            </div>

            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-5 py-3 rounded-lg transition-colors text-sm"
            >
              <MapPin className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// WHY CHOOSE CW
// ═══════════════════════════════════════════════════════════════
function WhyChooseCW() {
  return (
    <section className="py-20 bg-[#0F172A] relative overflow-hidden">
      {/* Animated bolt */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 1, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-0 top-0 h-full w-1/3 hidden md:flex items-center justify-end pointer-events-none opacity-10"
      >
        <Zap className="w-[460px] h-[460px] text-[#E63939]" strokeWidth={1} />
      </motion.div>

      {/* Glow */}
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#E63939]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className="max-w-xl"
          >
            <p className="text-xs font-bold text-[#E63939] uppercase tracking-widest mb-3">
              Why Choose CW Electronics
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-5 text-balance tracking-tight">
              Trusted by retailers, traders &amp; installers across SA
            </h2>
            <p className="text-white/60 leading-relaxed mb-7 text-pretty">
              CW Electronics is a direct importer based at China Cash and Carry, Crown Mines.
              We supply CCTV, networking, solar &amp; mobile electronics at true wholesale
              prices — backed by quality testing and fast nationwide delivery.
            </p>
            <div className="flex flex-wrap gap-3">
              <MagneticButton
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20CW%20%E2%80%94%20I%27d%20like%20to%20chat%20about%20wholesale%20pricing.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#E63939]/30 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Talk to Us on WhatsApp
              </MagneticButton>
              <a
                href="tel:+27649533333"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors border border-white/20 text-sm backdrop-blur-md"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:w-auto lg:min-w-[480px]"
          >
            {TRUST.map(({ icon: Icon, title, sub }) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#E63939]/30 rounded-2xl p-5 transition-all backdrop-blur-md"
              >
                <div className="w-11 h-11 bg-[#E63939]/15 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#E63939]" />
                </div>
                <p className="text-sm font-bold text-white mb-1">{title}</p>
                <p className="text-xs text-white/50 leading-relaxed">{sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// FINAL CTA — high-conversion, conversion-focused
// ═══════════════════════════════════════════════════════════════
function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#E63939] via-[#D62828] to-[#C82020] relative overflow-hidden">
      {/* Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles className="w-10 h-10 text-white mx-auto mb-4" />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 text-balance tracking-tight">
            Ready to get the best prices on electronics?
          </h2>
          <p className="text-white/85 text-lg max-w-2xl mx-auto mb-8 text-pretty">
            Direct importer • Wholesale &amp; retail • Stocked in Johannesburg • Fast delivery
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <MagneticButton
              href="/shop"
              className="group inline-flex items-center gap-2 bg-white text-[#E63939] font-bold px-8 py-4 rounded-xl shadow-2xl shadow-black/20 text-sm"
            >
              Shop Retail Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
            <Link
              to="/deals"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold px-8 py-4 rounded-xl transition-all text-sm"
            >
              Browse Wholesale Deals
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
