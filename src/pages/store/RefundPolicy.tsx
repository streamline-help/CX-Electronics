import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, RefreshCcw, ShieldCheck, ClipboardList,
  CreditCard, XCircle, Truck, Phone,
} from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import SEO from '../../components/SEO'

const LAST_UPDATED = '16 May 2026'
const EMAIL = 'info@cw-electronics.co.za'
const WA_LINK = 'https://wa.me/27649533333'

interface Section {
  id: string
  number: string
  title: string
  icon: React.ElementType
}

const SECTIONS: Section[] = [
  { id: 'returns-window',      number: '1', title: 'Returns Window',        icon: RefreshCcw   },
  { id: 'defective-products',  number: '2', title: 'Defective Products',    icon: ShieldCheck  },
  { id: 'how-to-return',       number: '3', title: 'How to Return an Item', icon: ClipboardList },
  { id: 'refund-method',       number: '4', title: 'Refund Method',         icon: CreditCard   },
  { id: 'non-returnable',      number: '5', title: 'Non-Returnable Items',  icon: XCircle      },
  { id: 'return-shipping',     number: '6', title: 'Return Shipping Costs', icon: Truck        },
  { id: 'contact',             number: '7', title: 'Contact Us',            icon: Phone        },
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

function NumberedStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-white/70 text-sm leading-relaxed">
      <span className="mt-0.5 w-5 h-5 rounded-full bg-[#E63939]/15 border border-[#E63939]/30 flex items-center justify-center text-[10px] font-bold text-[#E63939] flex-shrink-0">
        {n}
      </span>
      <span>{children}</span>
    </li>
  )
}

export function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <SEO
        title="Refund & Returns Policy | CW Electronics"
        description="7-day return window, 6-month warranty on defects, and full refund process. CW Electronics complies with the South African Consumer Protection Act."
        url="https://cw-electronics.co.za/refund-policy"
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
            Refund &amp; Returns Policy
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl text-pretty">
            We want you to be completely satisfied with your purchase. This policy is in full
            compliance with the South African Consumer Protection Act (CPA).
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
                  Need to start a return? WhatsApp us for the quickest response.
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

            {/* 1. Returns Window */}
            <section>
              <SectionHeading {...SECTIONS[0]} />
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                You may return any unused product within <strong className="text-white">7 days of receipt</strong> for
                a refund or exchange, provided that:
              </p>
              <ul className="space-y-3">
                <Bullet>The item is in its original, unopened packaging</Bullet>
                <Bullet>All accessories, manuals, and documentation are included</Bullet>
                <Bullet>The item has not been used, damaged, or tampered with</Bullet>
                <Bullet>You have proof of purchase (order number or invoice)</Bullet>
              </ul>
            </section>

            <hr className="border-white/8" />

            {/* 2. Defective Products */}
            <section>
              <SectionHeading {...SECTIONS[1]} />
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                All products carry a <strong className="text-white">6-month warranty</strong> against
                manufacturing defects, in line with the South African Consumer Protection Act.
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                If you receive a defective product, contact us within 7 days of receipt. We will
                arrange a repair, replacement, or full refund at no cost to you.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 3. How to Return */}
            <section>
              <SectionHeading {...SECTIONS[2]} />
              <ol className="space-y-4">
                <NumberedStep n={1}>
                  Email us at{' '}
                  <a href={`mailto:${EMAIL}`} className="text-[#E63939] underline underline-offset-2">
                    {EMAIL}
                  </a>{' '}
                  with your order number and reason for return
                </NumberedStep>
                <NumberedStep n={2}>
                  We will respond within 1–2 business days with return instructions
                </NumberedStep>
                <NumberedStep n={3}>
                  Ship the item back, or drop it off at our store (Unit 303, China Cash and Carry, Crown Mines)
                </NumberedStep>
                <NumberedStep n={4}>
                  Once received and inspected, we will process your refund within 5–10 business days
                </NumberedStep>
              </ol>
            </section>

            <hr className="border-white/8" />

            {/* 4. Refund Method */}
            <section>
              <SectionHeading {...SECTIONS[3]} />
              <p className="text-sm text-white/70 leading-relaxed">
                Refunds are issued via the same method used for the original payment. Card payments
                are refunded to the original card, and EFT payments are refunded by bank transfer.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 5. Non-Returnable */}
            <section>
              <SectionHeading {...SECTIONS[4]} />
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                The following cannot be returned, for hygiene or safety reasons:
              </p>
              <ul className="space-y-3">
                <Bullet>Items that have been opened, used, or installed</Bullet>
                <Bullet>Products with broken seals or removed packaging</Bullet>
                <Bullet>Items damaged by misuse, accident, or improper handling</Bullet>
                <Bullet>Clearance or final-sale items (clearly marked at time of purchase)</Bullet>
              </ul>
            </section>

            <hr className="border-white/8" />

            {/* 6. Return Shipping */}
            <section>
              <SectionHeading {...SECTIONS[5]} />
              <ul className="space-y-3">
                <Bullet>If the return is due to a defect, damage, or our error, we cover the return shipping</Bullet>
                <Bullet>For change-of-mind returns, the customer is responsible for the return shipping cost</Bullet>
              </ul>
            </section>

            <hr className="border-white/8" />

            {/* 7. Contact */}
            <section>
              <SectionHeading {...SECTIONS[6]} />
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
