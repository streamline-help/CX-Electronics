import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Eye, Share2, Cookie, Lock, UserCheck,
  RefreshCcw, Phone, ShieldCheck,
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
  { id: 'info-collected',   number: '1', title: 'Information We Collect',        icon: Eye        },
  { id: 'how-we-use',       number: '2', title: 'How We Use Your Information',   icon: ShieldCheck },
  { id: 'sharing',          number: '3', title: 'Sharing Your Information',      icon: Share2     },
  { id: 'cookies',          number: '4', title: 'Cookies',                       icon: Cookie     },
  { id: 'data-security',    number: '5', title: 'Data Security',                 icon: Lock       },
  { id: 'your-rights',      number: '6', title: 'Your Rights Under POPIA',       icon: UserCheck  },
  { id: 'policy-changes',   number: '7', title: 'Changes to This Policy',        icon: RefreshCcw },
  { id: 'contact',          number: '8', title: 'Contact',                       icon: Phone      },
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

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <SEO
        title="Privacy Policy | CW Electronics"
        description="How CW Electronics collects, uses, and protects your personal information in accordance with POPIA (South Africa)."
        url="https://cw-electronics.co.za/privacy-policy"
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
            Privacy Policy
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl text-pretty">
            CW Electronics is committed to protecting your privacy in accordance with the Protection
            of Personal Information Act (POPIA) of South Africa.
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
                  Questions about your data? Email our Information Officer directly.
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

            {/* 1. Info collected */}
            <section>
              <SectionHeading {...SECTIONS[0]} />
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                When you place an order or create an account, we collect:
              </p>
              <ul className="space-y-3 mb-6">
                <Bullet>Your name and contact details (email, phone number)</Bullet>
                <Bullet>Delivery address</Bullet>
                <Bullet>Payment information (processed securely by our payment provider — we do not store card details)</Bullet>
                <Bullet>Order history</Bullet>
              </ul>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                We also automatically collect:
              </p>
              <ul className="space-y-3">
                <Bullet>IP address and browser information</Bullet>
                <Bullet>Pages visited on our site (via cookies)</Bullet>
              </ul>
            </section>

            <hr className="border-white/8" />

            {/* 2. How we use */}
            <section>
              <SectionHeading {...SECTIONS[1]} />
              <p className="text-sm text-white/70 leading-relaxed mb-4">We use your information to:</p>
              <ul className="space-y-3">
                <Bullet>Process and deliver your orders</Bullet>
                <Bullet>Send order confirmations and shipping updates</Bullet>
                <Bullet>Respond to customer service enquiries</Bullet>
                <Bullet>Improve our website and services</Bullet>
                <Bullet>Send marketing communications (only if you have opted in)</Bullet>
              </ul>
            </section>

            <hr className="border-white/8" />

            {/* 3. Sharing */}
            <section>
              <SectionHeading {...SECTIONS[2]} />
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                We share your information only with:
              </p>
              <ul className="space-y-3 mb-4">
                <Bullet><strong className="text-white">Paystack</strong> — to process card and EFT payments securely</Bullet>
                <Bullet><strong className="text-white">Courier partners</strong> — to deliver your orders</Bullet>
                <Bullet><strong className="text-white">Email service providers</strong> — to send order confirmations and updates</Bullet>
              </ul>
              <Note>
                We do not sell, rent, or trade your personal information to any third party.
              </Note>
            </section>

            <hr className="border-white/8" />

            {/* 4. Cookies */}
            <section>
              <SectionHeading {...SECTIONS[3]} />
              <p className="text-sm text-white/70 leading-relaxed">
                Our website uses cookies to improve your shopping experience and to remember your
                cart. You can disable cookies in your browser settings, though this may affect site
                functionality.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 5. Data Security */}
            <section>
              <SectionHeading {...SECTIONS[4]} />
              <p className="text-sm text-white/70 leading-relaxed">
                We use industry-standard security measures to protect your information, including SSL
                encryption across the entire website and secure payment processing through verified
                payment partners.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 6. POPIA Rights */}
            <section>
              <SectionHeading {...SECTIONS[5]} />
              <p className="text-sm text-white/70 leading-relaxed mb-4">You have the right to:</p>
              <ul className="space-y-3 mb-4">
                <Bullet>Access the personal information we hold about you</Bullet>
                <Bullet>Request corrections to your information</Bullet>
                <Bullet>Request deletion of your information</Bullet>
                <Bullet>Opt out of marketing communications at any time</Bullet>
              </ul>
              <p className="text-sm text-white/70 leading-relaxed">
                To exercise any of these rights, please email{' '}
                <a href={`mailto:${EMAIL}`} className="text-[#E63939] underline underline-offset-2">
                  {EMAIL}
                </a>.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 7. Policy Changes */}
            <section>
              <SectionHeading {...SECTIONS[6]} />
              <p className="text-sm text-white/70 leading-relaxed">
                We may update this policy from time to time. The latest version will always be
                available on this page with the date of the most recent revision shown at the top.
              </p>
            </section>

            <hr className="border-white/8" />

            {/* 8. Contact */}
            <section>
              <SectionHeading {...SECTIONS[7]} />
              <div className="grid sm:grid-cols-2 gap-4">
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

                <div className="flex items-start gap-4 bg-white/3 border border-white/8 rounded-2xl p-5">
                  <div className="w-11 h-11 rounded-xl bg-[#E63939]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#E63939]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Address</p>
                    <p className="text-white/55 text-xs mt-1 leading-relaxed">
                      Unit 303, China Cash and Carry, Crown Mines<br />Johannesburg
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
