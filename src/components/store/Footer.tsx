import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useLang } from '../../context/LangContext'

const LOGO_URL = 'https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png'

function VisaIcon() {
  return (
    <svg viewBox="0 0 60 20" className="h-5 w-auto" aria-label="Visa">
      <rect width="60" height="20" rx="3" fill="#1A1F71" />
      <text x="8" y="14.5" fill="white" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="bold" fontStyle="italic">
        VISA
      </text>
    </svg>
  )
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 42 28" className="h-5 w-auto" aria-label="Mastercard">
      <circle cx="15" cy="14" r="12" fill="#EB001B" />
      <circle cx="27" cy="14" r="12" fill="#F79E1B" />
      <path
        d="M21 4.68A12 12 0 0 1 24.74 14 12 12 0 0 1 21 23.32 12 12 0 0 1 17.26 14 12 12 0 0 1 21 4.68Z"
        fill="#FF5F00"
      />
    </svg>
  )
}

function PaystackIcon() {
  return (
    <svg viewBox="0 0 60 20" className="h-5 w-auto" aria-label="Paystack">
      <rect width="60" height="20" rx="3" fill="#011B33" />
      <rect x="8" y="5" width="44" height="3.5" rx="1.5" fill="#00C3F7" />
      <rect x="8" y="11.5" width="32" height="3.5" rx="1.5" fill="#00C3F7" opacity="0.6" />
    </svg>
  )
}

function EFTIcon() {
  return (
    <svg viewBox="0 0 60 20" className="h-5 w-auto" aria-label="Instant EFT">
      <rect width="60" height="20" rx="3" fill="#0F4C81" />
      <text x="6" y="14" fill="white" fontFamily="Arial, sans-serif" fontSize="8.5" fontWeight="bold" letterSpacing="0.5">
        INSTANT EFT
      </text>
    </svg>
  )
}

export function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0B1120] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={LOGO_URL} alt="CW Electronics" className="h-10 w-auto" />
              <div className="leading-tight">
                <span className="font-bold text-white text-lg tracking-tight">CW Electronics</span>
                <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-[0.18em] -mt-0.5">
                  Wholesale &amp; Retail
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Direct importer of consumer electronics. Wholesale &amp; retail from our showroom at
              China Cash and Carry, Crown Mines, Johannesburg.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">{t('home')}</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">{t('shop')}</Link></li>
              <li><Link to="/wholesale" className="hover:text-white transition-colors">Wholesale</Link></li>
              <li><Link to="/deals" className="hover:text-white transition-colors">Deals</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About &amp; Contact</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">
              Policies
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-500" />
                <span className="leading-snug">
                  Unit 303, China Cash and Carry<br />
                  Cnr Discovery Drive &amp; Renaissance Blvd, Crown Mines<br />
                  Johannesburg, 2092
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                <div className="space-y-0.5">
                  <a href="tel:+27649533333" className="block hover:text-white transition-colors">
                    064 953 3333 <span className="text-slate-600">(Emily)</span>
                  </a>
                  <a href="tel:+27628058899" className="block hover:text-white transition-colors">
                    062 805 8899 <span className="text-slate-600">(Kevin)</span>
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                <a href="mailto:info@cw-electronics.co.za" className="hover:text-white transition-colors">
                  info@cw-electronics.co.za
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-500" />
                <span>Mon – Sun, 09:00 – 15:00<br /><span className="text-slate-600 text-xs">Open every day</span></span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 order-2 sm:order-1">
            &copy; {year} CW Electronics. {t('allRightsReserved')}
          </p>

          {/* Payment icons */}
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <span className="text-[10px] text-slate-600 font-medium mr-1">We accept</span>
            <div className="p-1.5 bg-white/5 rounded-md border border-white/8">
              <VisaIcon />
            </div>
            <div className="p-1.5 bg-white/5 rounded-md border border-white/8">
              <MastercardIcon />
            </div>
            <div className="p-1.5 bg-white/5 rounded-md border border-white/8">
              <PaystackIcon />
            </div>
            <div className="p-1.5 bg-white/5 rounded-md border border-white/8">
              <EFTIcon />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
