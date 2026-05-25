import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Truck, MapPin, Package,
  AlertTriangle, BarChart2, AlertCircle,
} from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'

const LAST_UPDATED = '16 May 2026'
const EMAIL = 'info@cw-electronics.co.za'

interface Section {
  id: string
  number: string
  title: string
  icon: React.ElementType
}

const SECTIONS: Section[] = [
  { id: 'delivery-options',  number: '1', title: 'Delivery Options',       icon: Truck        },
  { id: 'order-processing',  number: '2', title: 'Order Processing',       icon: Package      },
  { id: 'tracking',          number: '3', title: 'Tracking Your Order',    icon: BarChart2    },
  { id: 'delivery-areas',    number: '4', title: 'Delivery Areas',         icon: MapPin       },
  { id: 'failed-deliveries', number: '5', title: 'Failed Deliveries',      icon: AlertTriangle },
  { id: 'damaged-items',     number: '6', title: 'Damaged or Missing Items', icon: AlertCircle },
]

function SectionHeading({ id, number, title, icon: Icon }: Section) {
  return (
    <div id={id} className="flex items-center gap-3 mb-5 pt-2">
      <div className="w-10 h-10 rounded-xl bg-[#E63939]/10 border border-[#E63939]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#E63939]" />
      </div>
      <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
        <span className="text-[#E63939] mr-1">{number}.</span> {title}
      </h2>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-white/70 text-sm leading-relaxed">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#E63939] flex-shrink-0" />
      <span>{children}</span>
    </li>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-xl border border-[#E63939]/25 bg-[#E63939]/5 px-5 py-4 text-sm text-white/70 leading-relaxed">
      {children}
    </div>
  )
}

interface DeliveryCardProps {
  label: string
  price: string
  bullets: string[]
}

function DeliveryCard({ label, price, bullets }: DeliveryCardProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-white text-sm">{label}</p>
        <span className="text-[#E63939] font-extrabold text-sm">{price}</span>
      </div>
      <ul className="space-y-2">
        {bullets.map((b, i) => (
          <Bullet key={i}>{b}</Bullet>
        ))}
      </ul>
    </div>
  )
}

export function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <SEO
        title="Shipping Policy | CW Electronics"
        description="CW Electronics shipping options, delivery times, and order processing information. Free collection from Crown Mines, Johannesburg."
        url="https://cw-electronics.co.za/shipping-policy"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[#0B1120] border-b border-white/5 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #E63939 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 bg-[#E63939]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-[#E63939] text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 text-balance leading-tight">
            Shipping Policy
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl text-pretty">
            We deliver throughout South Africa using trusted couriers, and we also offer free
            collection from our store in Johannesburg.
          </p>
          <p className="text-white/30 text-xs mt-5 font-medium">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-14 xl:gap-20">

          {/* Sticky sidebar TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Contents</p>
              <nav className="space-y-1">
                {SECTIONS.map(({ id, number, title }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/55 hover:text-white hover:bg-white/5 transition-colors group"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#E63939]/10 flex items-center justify-center text-[10px] font-bold text-[#E63939] group-hover:bg-[#E63939] group-hover:text-white transition-colors flex-shrink-0">
                      {number}
                    </span>
                    {title}
                  </a>
                ))}
              </nav>

              <div className="mt-8 p-4 rounded-xl bg-white/3 border border-white/8">
                <p className="text-xs text-white/50 leading-relaxed">
                  Questions about delivery? Email us and we'll help right away.
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#E63939] hover:text-red-400 transition-colors"
                >
                  Email us &rarr;
                </a>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <motion.main
            className="space-y-14"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >

            {/* 1. Delivery Options */}
            <section>
              <SectionHeading {...SECTIONS[0]} />
              <div className="space-y-4">
                <DeliveryCard
                  label="Store Collection"
                  price="FREE"
                  bullets={[
                    'Pickup at: Unit 303, China Cash and Carry, Cnr Discovery Drive & Renaissance Blvd, Crown Mines, Johannesburg',
                    'Ready within 1–2 hours of order confirmation during trading hours',
                    'You will receive an email or WhatsApp notification when your order is ready',
                    'Trading hours: Mon–Sun 09:00–15:00 (open every day)',
                  ]}
                />
                <DeliveryCard
                  label="Economy Delivery"
                  price="R100"
                  bullets={[
                    'Nationwide coverage via trusted courier',
                    'Estimated delivery: 2–5 business days',
                    'Tracking number provided once dispatched',
                  ]}
                />
                <DeliveryCard
                  label="Next Day Delivery"
                  price="R150"
                  bullets={[
                    'Available in major metro areas only (Johannesburg, Pretoria, Cape Town, Durban, Port Elizabeth, Bloemfontein)',
                    'Orders must be placed before 12pm to qualify',
                    'Delivered the next business day',
                  ]}
                />
                <DeliveryCard
                  label="Overnight Delivery"
                  price="R300"
                  bullets={[
                    'Available in major metro areas only',
                    'Orders must be placed before 12pm',
                    'Delivered the same or next business day',
                  ]}
                />
              </div>
            </section>

            <hr className="border-white/8" />

            {/* 2. Order Processing */}
            <section>
              <SectionHeading {...SECTIONS[1]} />
              <ul className="space-y-3">
                <Bullet>Orders placed before 12pm on business days are processed the same day</Bullet>
                <Bullet>Orders placed after 12pm, on weekends, or on public holidays are processed the next business day</Bullet>
                <Bullet>You will receive an email confirmation once your order is dispatched</Bullet>
              </ul>
            </section>

            <hr className="border-white/8" />

            {/* 3. Tracking */}
            <section>
              <SectionHeading {...SECTIONS[2]} />
              <p className="text-sm text-white/70 leading-relaxed">
                Once dispatched, you will receive a tracking number by email. You can use this number
                to track your parcel directly on the courier's website or contact us for an update.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 4. Delivery Areas */}
            <section>
              <SectionHeading {...SECTIONS[3]} />
              <ul className="space-y-3">
                <Bullet>Economy Delivery covers the entire country</Bullet>
                <Bullet>Next Day and Overnight Delivery are available only in major metropolitan areas</Bullet>
                <Bullet>Deliveries to outlying or rural areas may take an additional 1–2 business days</Bullet>
              </ul>
            </section>

            <hr className="border-white/8" />

            {/* 5. Failed Deliveries */}
            <section>
              <SectionHeading {...SECTIONS[4]} />
              <p className="text-sm text-white/70 leading-relaxed">
                If you are unavailable to receive your delivery, the courier will attempt redelivery
                the next business day. After two unsuccessful attempts, the parcel will be returned to
                our warehouse, and a redelivery fee may apply.
              </p>
              <Note>
                Please ensure your delivery address and contact number are correct at checkout.
                Incorrect information may result in failed delivery and additional fees.
              </Note>
            </section>

            <hr className="border-white/8" />

            {/* 6. Damaged or Missing Items */}
            <section>
              <SectionHeading {...SECTIONS[5]} />
              <p className="text-sm text-white/70 leading-relaxed">
                Please inspect your order on delivery. Report any damaged or missing items to{' '}
                <a href={`mailto:${EMAIL}`} className="text-[#E63939] underline underline-offset-2">
                  {EMAIL}
                </a>{' '}
                within 48 hours of receipt. Claims submitted after this window may not be accepted.
              </p>
            </section>

            {/* Back links */}
            <div className="pt-4 pb-2 flex flex-wrap gap-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
              <Link
                to="/terms"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors"
              >
                View Terms &amp; Conditions
              </Link>
            </div>

          </motion.main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
