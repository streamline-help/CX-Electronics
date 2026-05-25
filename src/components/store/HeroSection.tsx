import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Coins, RefreshCw, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Hero slider images - high quality electronics product images
const HERO_SLIDES = [
  {
    image: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777485480/n2kIN_lmgy9y.jpg',
    title: 'Powering South Africa with CCTV & Security',
    highlight: 'Direct Importer',
    subtitle: 'Professional-grade surveillance systems, from 4K cameras to complete NVR kits.',
    location: 'Trusted by installers, retailers & businesses nationwide.',
  },
  {
    image: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/CCTV_Security_Category_2_y2g9zt.jpg',
    title: 'Premium CCTV Systems',
    highlight: 'Enterprise Grade',
    subtitle: '4K surveillance, NVR kits, and complete monitoring solutions for every need.',
    location: 'Tested and verified — backed by our warranty.',
  },
  {
    image: 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777483174/Solar_Lamps_Lighting_ev6x1n.jpg',
    title: 'Off-Grid Solar Solutions',
    highlight: 'Energy Efficient',
    subtitle: 'LED street lamps, flood lights, and garden lighting for South African conditions.',
    location: 'IP65 rated — built to last.',
  },
]

// ═══════════════════════════════════════════════════════════════
// TOP BANNER
// ═══════════════════════════════════════════════════════════════
export function TopBanner() {
  return (
    <div className="bg-[#E63939] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="py-2.5 text-center text-xs sm:text-sm font-medium tracking-wide">
          Wholesale &amp; Retail Electronics — China Cash and Carry, Crown Mines JHB
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// HERO SECTION WITH 3-IMAGE SLIDER
// ═══════════════════════════════════════════════════════════════
export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, nextSlide])

  const slide = HERO_SLIDES[currentSlide]

  return (
    <section className="relative bg-[#0F172A] overflow-hidden">
      {/* Background images with smooth transitions */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={slide.image}
            alt=""
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.45, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/85 to-[#0F172A]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/40" />
      </div>

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center text-center py-20 sm:py-28 lg:py-36 min-h-[500px] sm:min-h-[560px] lg:min-h-[620px]">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <img
              src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png"
              alt="CW Electronics"
              className="h-16 sm:h-20 lg:h-24 w-auto"
            />
          </motion.div>

          {/* Headline with animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight max-w-4xl">
                {slide.title}
                <br />
                <span className="text-[#E63939]">{slide.highlight}</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed text-pretty">
                {slide.subtitle}
                <br className="hidden sm:block" />
                {slide.location}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              to="/shop"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Shop Retail Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/wholesale"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border-2 border-slate-500 hover:border-slate-300 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Browse Wholesale Deals
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          {/* Slide navigation */}
          <div className="mt-10 sm:mt-12 flex items-center gap-4">
            {/* Prev/Next buttons */}
            <button
              onClick={() => { prevSlide(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 10000) }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide 
                      ? 'w-8 h-2 bg-[#E63939]' 
                      : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => { nextSlide(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 10000) }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// BENEFIT CARDS - Updated per requirements
// ═══════════════════════════════════════════════════════════════
const BENEFITS = [
  {
    icon: Truck,
    title: 'Same-Day Collection',
    description: 'China Cash and Carry, Crown Mines',
  },
  {
    icon: Coins,
    title: 'Trade Pricing',
    description: 'From 6+ units',
  },
  {
    icon: Package,
    title: 'Fast Gauteng Delivery',
    description: 'Flat-rate courier from R99',
  },
  {
    icon: RefreshCw,
    title: '7-Day Return Policy',
    description: 'Photo required, customer pays return shipping',
  },
]

export function BenefitCards() {
  return (
    <section className="bg-[#0F172A] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {BENEFITS.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group bg-white/5 border border-white/10 hover:border-white/20 rounded-xl p-5 sm:p-6 transition-all duration-300"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E63939]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#E63939]/20 transition-colors">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#E63939]" />
              </div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
                {title}
              </h3>
              <p className="text-white/60 text-xs sm:text-sm">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
// RED CTA SECTION - Updated messaging
// ═══════════════════════════════════════════════════════════════
export function RedCTASection() {
  return (
    <section className="bg-[#E63939]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="flex flex-col items-center text-center">
          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight max-w-2xl text-balance">
            Ready to get the best prices on electronics?
          </h2>

          {/* Subtext */}
          <p className="mt-4 sm:mt-5 text-white/90 text-sm sm:text-base lg:text-lg max-w-xl">
            Direct importer &bull; Wholesale &amp; retail &bull; Stocked in Johannesburg &bull; Fast delivery
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/shop"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-[#E63939] font-semibold px-8 py-4 rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Shop Retail Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/wholesale"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#0F172A]/80 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 text-sm sm:text-base"
            >
              Browse Wholesale Deals
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
