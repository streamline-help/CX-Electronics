import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import {
  Zap, MapPin, Phone, Mail, MessageCircle, Clock, Send,
  Globe, Truck, Tag, ShieldCheck, Navigation, ArrowRight, CheckCircle2,
} from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'

const REASONS = [
  {
    icon: Globe,
    title: 'Direct Importer from China',
    body: 'We source directly from trusted manufacturers — no middlemen, just better prices for you.',
  },
  {
    icon: Tag,
    title: 'Wholesale & Retail Pricing',
    body: 'Competitive prices for individuals and bulk-tier discounts for resellers and businesses.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery Across Gauteng',
    body: 'Same-day dispatch in Johannesburg and 24–48h delivery across Gauteng province.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Guaranteed',
    body: 'Every product tested and backed by our after-sales support and warranty terms.',
  },
] as const

const WHATSAPP_NUMBER = '27649533333' // Emily — primary WhatsApp
const EMILY_PHONE = '064 953 3333'
const EMILY_TEL = '+27649533333'
const KEVIN_PHONE = '062 805 8899'
const KEVIN_TEL = '+27628058899'
const EMAIL = 'info@cw-electronics.co.za'
const ADDRESS = 'Unit 303, China Cash and Carry, Cnr Discovery Drive & Renaissance Blvd, Crown Mines, Johannesburg, 2092'

// Google Maps embed URL for China Mart, Crown Mines
const MAP_EMBED =
  'https://www.google.com/maps?q=China+Mart+3+Press+Avenue+Crown+Mines+Johannesburg&output=embed'
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=China+Mart+3+Press+Avenue+Crown+Mines+Johannesburg+2092'

export function About() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'retail',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      inquiry_type: form.type,
      message: form.message.trim(),
    }

    // Save to admin inbox and fire notification webhook — both fire-and-forget.
    supabase.from('cw_contact_messages').insert(payload).then(() => {})

    const n8nContact = import.meta.env.VITE_N8N_CONTACT as string | undefined
    if (n8nContact) {
      fetch(n8nContact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {})
    }

    setSubmitting(false)
    setSubmitted(true)
    setForm({ name: '', email: '', phone: '', type: 'retail', message: '' })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <SEO
        title="About Us | CW Electronics — Crown Mines, Johannesburg"
        description="CW Electronics is a direct importer of electronics in Crown Mines, Johannesburg. Visit our store or get in touch for trade pricing & wholesale enquiries."
        url="https://cw-electronics.co.za/about"
      />
      <Navbar />

      <main className="flex-1">
        {/* ─── Hero ─────────────────────────────────── */}
        <section className="relative bg-[#0F172A] overflow-hidden">
          {/* Subtle red glow */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#E63939]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-[#E63939]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Diagonal lines pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 24px)',
            }}
          />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E63939]/15 border border-[#E63939]/30 rounded-full text-[#E63939] text-xs font-bold tracking-widest uppercase mb-6"
            >
              <Zap className="w-3.5 h-3.5 fill-[#E63939]" />
              Since 2022
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight text-balance leading-[1.05]"
            >
              About <span className="text-[#E63939]">CW Electronics</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-5 text-base sm:text-lg text-white/70 max-w-2xl mx-auto text-pretty leading-relaxed"
            >
              Your trusted electronics importer at China Cash and Carry, Crown Mines, Johannesburg —
              powering South Africa with quality wholesale &amp; retail electronics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white text-sm font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-[#E63939]/30 hover:shadow-xl hover:shadow-[#E63939]/40 hover:-translate-y-0.5"
              >
                Get In Touch
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur border border-white/20 text-white text-sm font-bold px-6 py-3 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>
            </motion.div>
          </div>
        </section>

        {/* ─── Our Story ────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-[#E63939] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight text-balance leading-[1.1] mb-5">
                Powering South Africa with quality electronics
              </h2>
              <div className="space-y-4 text-gray-600 text-base leading-relaxed">
                <p>
                  CW Electronics is a fast-growing importer and wholesaler of
                  quality electronics based at <strong className="text-[#0F172A]">China Cash and Carry,
                  Crown Mines, Johannesburg</strong>. Since 2022 we have been supplying South African
                  installers, retailers and businesses with CCTV systems, solar lighting,
                  routers, chargers, smartwatches and more — direct from trusted manufacturers
                  in China.
                </p>
                <p>
                  By cutting out the middlemen and importing in volume, we keep prices
                  competitive for both individual customers and bulk buyers — without
                  compromising on quality or after-sales support.
                </p>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { v: '4+', l: 'Years trading' },
                  { v: '500+', l: 'Trade clients' },
                  { v: '10k+', l: 'Orders delivered' },
                ].map(({ v, l }) => (
                  <div
                    key={l}
                    className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                  >
                    <div className="text-2xl font-extrabold text-[#E63939]">{v}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-3 bg-[#E63939]/10 rounded-3xl blur-2xl pointer-events-none" />
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5 group">
                {/* Premium hover sheen — matches product cards */}
                <div className="absolute inset-0 z-[5] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-white/0 via-white/20 to-transparent" />
                <img
                  src="https://images.unsplash.com/photo-1607734834519-d8bdc52f6c5f?auto=format&fit=crop&w=1400&q=85"
                  alt="CW Electronics wholesale electronics showroom — chargers, CCTV cameras, routers and accessories at China Cash and Carry, Crown Mines, Johannesburg"
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to one of our own Cloudinary hero shots if Unsplash fails
                    e.currentTarget.src = 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777485480/n2kIN_lmgy9y.jpg'
                  }}
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 bg-[#0F172A] text-white rounded-xl px-5 py-4 shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E63939] rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div className="leading-tight">
                  <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">
                    Based at
                  </div>
                  <div className="text-sm font-bold">China Cash and Carry, Crown Mines</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Why Choose CW ───────────────────────── */}
        <section className="bg-white border-y border-gray-100 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-[#E63939] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                Why Choose Us
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight text-balance">
                Built for resellers, trusted by retailers
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Four reasons hundreds of South African businesses partner with us.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {REASONS.map(({ icon: Icon, title, body }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative bg-[#F8FAFC] rounded-2xl p-6 border border-gray-100 hover:border-[#E63939]/40 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 bg-[#E63939]/10 group-hover:bg-[#E63939] rounded-xl flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-6 h-6 text-[#E63939] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-2 leading-tight">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Location ─────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block text-[#E63939] text-xs font-bold uppercase tracking-[0.2em] mb-3">
              Our Location
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight text-balance">
              Visit Our Showroom
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Come see our full range in person at China Cash and Carry, Crown Mines —
              Johannesburg's premier electronics import hub.
            </p>
          </div>

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
            <div className="bg-[#0F172A] rounded-2xl p-7 text-white flex flex-col">
              <div className="w-12 h-12 bg-[#E63939] rounded-xl flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold mb-2">Find Us Here</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">{ADDRESS}</p>

              <div className="space-y-3 text-sm border-t border-white/10 pt-5 mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 mt-0.5 text-[#E63939] flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Open every day</div>
                    <div className="text-white/60">09:00 – 15:00 · Mon – Sun</div>
                  </div>
                </div>
              </div>

              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-5 py-3 rounded-lg transition-colors text-sm"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </motion.div>
        </section>

        {/* ─── Contact ──────────────────────────────── */}
        <section
          id="contact"
          className="bg-white border-t border-gray-100 py-16 sm:py-24 scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-[#E63939] text-xs font-bold uppercase tracking-[0.2em] mb-3">
                Contact Us
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight text-balance">
                Let&apos;s talk electronics
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">
                Whether it&apos;s a single product or a wholesale order — we&apos;re here to help.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-3 bg-[#F8FAFC] rounded-2xl p-6 sm:p-8 border border-gray-100"
              >
                {submitted ? (
                  <div className="flex flex-col items-center text-center py-12">
                    <div className="w-16 h-16 bg-[#E63939]/10 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#E63939]" />
                    </div>
                    <h3 className="text-xl font-extrabold text-[#0F172A] mb-2">
                      Message Received
                    </h3>
                    <p className="text-sm text-gray-600 max-w-sm mb-6">
                      Thanks for reaching out. We usually reply within 1 hour during
                      business hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-sm font-bold text-[#E63939] hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                          Full Name
                        </label>
                        <input
                          required
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Jane Smith"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#E63939] focus:ring-2 focus:ring-[#E63939]/15 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                          Phone
                        </label>
                        <input
                          required
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+27 ..."
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#E63939] focus:ring-2 focus:ring-[#E63939]/15 transition"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                          Email
                        </label>
                        <input
                          required
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#E63939] focus:ring-2 focus:ring-[#E63939]/15 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                          Inquiry Type
                        </label>
                        <select
                          name="type"
                          value={form.type}
                          onChange={handleChange}
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#E63939] focus:ring-2 focus:ring-[#E63939]/15 transition"
                        >
                          <option value="retail">Retail Order</option>
                          <option value="bulk">Bulk / Wholesale</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                        Message
                      </label>
                      <textarea
                        required
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Tell us what you're looking for..."
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#E63939] focus:ring-2 focus:ring-[#E63939]/15 transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] disabled:bg-gray-300 text-white font-bold px-6 py-3.5 rounded-lg transition-all text-sm shadow-lg shadow-[#E63939]/25 hover:shadow-xl hover:shadow-[#E63939]/30"
                    >
                      {submitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-500 pt-1">
                      We usually reply within 1 hour during business hours.
                    </p>
                  </form>
                )}
              </motion.div>

              {/* Contact details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-2 space-y-3"
              >
                <a
                  href={`tel:${EMILY_TEL}`}
                  className="flex items-center gap-4 bg-[#F8FAFC] hover:bg-white hover:shadow-md border border-gray-100 rounded-xl p-5 transition-all group"
                >
                  <div className="w-11 h-11 bg-[#E63939]/10 group-hover:bg-[#E63939] rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#E63939] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Emily — Phone
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">{EMILY_PHONE}</div>
                  </div>
                </a>

                <a
                  href={`tel:${KEVIN_TEL}`}
                  className="flex items-center gap-4 bg-[#F8FAFC] hover:bg-white hover:shadow-md border border-gray-100 rounded-xl p-5 transition-all group"
                >
                  <div className="w-11 h-11 bg-[#E63939]/10 group-hover:bg-[#E63939] rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#E63939] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Kevin — Phone
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">{KEVIN_PHONE}</div>
                  </div>
                </a>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-[#22c55e]/5 hover:bg-[#22c55e]/10 hover:shadow-md border border-[#22c55e]/20 rounded-xl p-5 transition-all group"
                >
                  <div className="w-11 h-11 bg-[#22c55e] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-[#16a34a] uppercase tracking-widest">
                      WhatsApp — Fastest
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">Chat with us now</div>
                  </div>
                </a>

                <a
                  href={`mailto:${EMAIL}`}
                  className="flex items-center gap-4 bg-[#F8FAFC] hover:bg-white hover:shadow-md border border-gray-100 rounded-xl p-5 transition-all group"
                >
                  <div className="w-11 h-11 bg-[#E63939]/10 group-hover:bg-[#E63939] rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#E63939] group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Email
                    </div>
                    <div className="text-sm font-bold text-[#0F172A] truncate">{EMAIL}</div>
                  </div>
                </a>

                <div className="flex items-start gap-4 bg-[#F8FAFC] border border-gray-100 rounded-xl p-5">
                  <div className="w-11 h-11 bg-[#E63939]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#E63939]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Address
                    </div>
                    <div className="text-sm font-semibold text-[#0F172A] leading-relaxed">
                      {ADDRESS}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-[#F8FAFC] border border-gray-100 rounded-xl p-5">
                  <div className="w-11 h-11 bg-[#E63939]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#E63939]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                      Business Hours
                    </div>
                    <div className="text-sm font-semibold text-[#0F172A] leading-relaxed">
                      Mon – Sun: 09:00 – 15:00
                      <br />
                      <span className="text-gray-500">Open every day</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Final CTA ────────────────────────────── */}
        <section className="bg-[#0F172A] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center relative overflow-hidden">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#E63939]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-balance mb-3">
                Ready to power up your business?
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-6">
                Browse our full retail range or request a wholesale quote in seconds.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#0F172A] font-bold px-6 py-3 rounded-lg transition-colors text-sm"
                >
                  Browse Shop
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20CW%20Electronics%20%E2%80%94%20I%27d%20like%20to%20chat.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm shadow-lg shadow-[#E63939]/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

    </div>
  )
}
