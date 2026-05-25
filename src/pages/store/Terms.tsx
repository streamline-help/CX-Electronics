import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Scale, CreditCard, Truck, RefreshCcw, Package, ShieldCheck, Phone, AlertCircle, Globe } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'

const LAST_UPDATED = '16 May 2026'
const EMAIL = 'info@cw-electronics.co.za'
const WA_NUMBER = '27649533333'
const WA_LINK = `https://wa.me/${WA_NUMBER}`

interface Section {
  id: string
  number: string
  title: string
  icon: React.ElementType
}

const SECTIONS: Section[] = [
  { id: 'products-pricing', number: '1', title: 'Products & Pricing',       icon: Scale        },
  { id: 'orders',           number: '2', title: 'Orders',                   icon: Package      },
  { id: 'payment',          number: '3', title: 'Payment',                  icon: CreditCard   },
  { id: 'shipping',         number: '4', title: 'Delivery',                 icon: Truck        },
  { id: 'returns',          number: '5', title: 'Returns',                  icon: RefreshCcw   },
  { id: 'warranty',         number: '6', title: 'Warranty',                 icon: ShieldCheck  },
  { id: 'liability',        number: '7', title: 'Limitation of Liability',  icon: AlertCircle  },
  { id: 'governing-law',    number: '8', title: 'Governing Law',            icon: Globe        },
  { id: 'contact',          number: '9', title: 'Contact Us',               icon: Phone        },
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

export function Terms() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <SEO
        title="Terms & Conditions | CW Electronics"
        description="Terms and conditions for shopping at CW Electronics. Covers pricing, orders, payment, delivery, returns, warranty, and governing law."
        url="https://cw-electronics.co.za/terms"
      />
      <Navbar />

      {/* Page hero */}
      <section className="relative bg-[#0B1120] border-b border-white/5 overflow-hidden">
        {/* Subtle dot pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #E63939 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Red glow */}
        <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 bg-[#E63939]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-[#E63939] text-xs font-bold uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 text-balance leading-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl text-pretty">
            By using cw-electronics.co.za and placing an order, you agree to the following terms.
          </p>
          <p className="text-white/30 text-xs mt-5 font-medium">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Table of contents — visible on larger screens as sticky sidebar, inline on mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-14 xl:gap-20">

          {/* Sticky sidebar TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">
                Contents
              </p>
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
                  Questions about our policies? Chat with us on WhatsApp for a quick response.
                </p>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#E63939] hover:text-red-400 transition-colors"
                >
                  Open WhatsApp &rarr;
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

            {/* 1. Products & Pricing */}
            <section>
              <SectionHeading {...SECTIONS[0]} />
              <ul className="space-y-3">
                <Bullet>All prices are displayed in South African Rand (ZAR)</Bullet>
                <Bullet>Product images are for illustrative purposes; actual products may vary slightly</Bullet>
                <Bullet>We reserve the right to change prices at any time</Bullet>
                <Bullet>While we do our best to keep stock levels accurate, availability cannot be guaranteed at all times</Bullet>
              </ul>
            </section>

            <hr className="border-white/8" />

            {/* 2. Orders */}
            <section>
              <SectionHeading {...SECTIONS[1]} />
              <ul className="space-y-3">
                <Bullet>Orders are subject to acceptance and stock availability</Bullet>
                <Bullet>We reserve the right to cancel any order due to pricing errors, stock issues, or suspected fraudulent activity</Bullet>
                <Bullet>A full refund will be issued for any cancelled order</Bullet>
              </ul>
            </section>

            <hr className="border-white/8" />

            {/* 3. Payment */}
            <section>
              <SectionHeading {...SECTIONS[2]} />
              <ul className="space-y-3 mb-4">
                <Bullet>Payment is required in full before dispatch</Bullet>
                <Bullet>We accept card payments, EFT, and instant EFT via <strong className="text-white">Paystack</strong></Bullet>
                <Bullet>All payment data is processed securely by Paystack — we do not store card details</Bullet>
              </ul>
            </section>

            <hr className="border-white/8" />

            {/* 4. Delivery */}
            <section>
              <SectionHeading {...SECTIONS[3]} />
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                For full delivery details, options, and estimated times, please see our{' '}
                <Link to="/shipping-policy" className="text-[#E63939] underline underline-offset-2 hover:text-red-400 transition-colors">
                  Shipping Policy
                </Link>.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 5. Returns */}
            <section>
              <SectionHeading {...SECTIONS[4]} />
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                For our full returns process, please see our{' '}
                <Link to="/refund-policy" className="text-[#E63939] underline underline-offset-2 hover:text-red-400 transition-colors">
                  Refund &amp; Returns Policy
                </Link>.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 6. Warranty */}
            <section>
              <SectionHeading {...SECTIONS[5]} />
              <p className="text-sm text-white/70 leading-relaxed">
                All products carry a <strong className="text-white">6-month warranty</strong> against
                manufacturing defects, in line with the South African Consumer Protection Act.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 7. Liability */}
            <section>
              <SectionHeading {...SECTIONS[6]} />
              <p className="text-sm text-white/70 leading-relaxed">
                CW Electronics is not liable for any indirect, incidental, or consequential damages
                arising from the use of our products or website.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 8. Governing Law */}
            <section>
              <SectionHeading {...SECTIONS[7]} />
              <p className="text-sm text-white/70 leading-relaxed">
                These terms are governed by the laws of the Republic of South Africa.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 9. Contact Us */}
            <section id="contact">
              <SectionHeading {...SECTIONS[8]} />
              <p className="text-sm text-white/70 leading-relaxed mb-5">
                If you have any questions about these terms, your order, or our policies, please reach
                out through any of the channels below. We aim to respond within one business day.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 bg-white/3 hover:bg-[#E63939]/10 border border-white/8 hover:border-[#E63939]/30 rounded-2xl p-5 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#E63939]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E63939]/20 transition-colors">
                    <Phone className="w-5 h-5 text-[#E63939]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">WhatsApp</p>
                    <p className="text-white/55 text-xs mt-0.5">Quick replies during business hours</p>
                  </div>
                </a>

                <a
                  href={`mailto:${EMAIL}`}
                  className="group flex items-center gap-4 bg-white/3 hover:bg-[#E63939]/10 border border-white/8 hover:border-[#E63939]/30 rounded-2xl p-5 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#E63939]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E63939]/20 transition-colors">
                    <svg className="w-5 h-5 text-[#E63939]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Email</p>
                    <p className="text-white/55 text-xs mt-0.5">{EMAIL}</p>
                  </div>
                </a>

                <div className="sm:col-span-2 flex items-start gap-4 bg-white/3 border border-white/8 rounded-2xl p-5">
                  <div className="w-11 h-11 rounded-xl bg-[#E63939]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#E63939]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Visit Us In-Store</p>
                    <p className="text-white/55 text-xs mt-1 leading-relaxed">
                      Unit 303, China Cash and Carry, Cnr Discovery Drive &amp; Renaissance Blvd, Crown Mines, Johannesburg, 2092<br />
                      Open every day: 09:00&ndash;15:00
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Back to home */}
            <div className="pt-4 pb-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>
            </div>

          </motion.main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
