import { useState } from 'react'
import { Landmark, Check, Copy, MessageCircle } from 'lucide-react'
import { BANKING_DETAILS } from '../../lib/banking'

const WHATSAPP_NUMBER = '27649533333' // Emily — primary WhatsApp

interface BankingDetailsCardProps {
  /** Order number used as the payment reference. Omit at checkout (no order yet). */
  reference?: string
  /** Amount to pay, in Rand. */
  amount: number
  /** Show the numbered "what happens next" steps. Default true. */
  showSteps?: boolean
  /** Show the "Send proof of payment" WhatsApp button. Needs a reference. */
  showWhatsApp?: boolean
}

/**
 * On-screen EFT banking details with one-tap copy on every value. Used on the
 * order confirmation page (full, with reference + WhatsApp) and on checkout as
 * a preview (no reference yet — that's generated when the order is placed).
 */
export function BankingDetailsCard({
  reference,
  amount,
  showSteps = true,
  showWhatsApp = true,
}: BankingDetailsCardProps) {
  const b = BANKING_DETAILS

  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: 'Bank', value: b.bank },
    { label: 'Account Name', value: b.accountHolder },
    { label: 'Account Number', value: b.accountNumber, mono: true },
    { label: 'Branch Code', value: b.branchCode, mono: true },
    { label: 'Account Type', value: b.accountType },
  ]

  const waText = reference
    ? `Hi CW Electronics, I've paid for order ${reference} (R${amount.toFixed(2)}). Here is my proof of payment.`
    : ''
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-[#0F172A]">
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <Landmark className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-white text-sm">Pay by EFT / Bank Transfer</h2>
          <p className="text-white/60 text-xs">Use your banking app — no card needed</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Amount to pay */}
        <CopyRow
          label="Amount to pay"
          value={`R${amount.toFixed(2)}`}
          copyValue={amount.toFixed(2)}
          big
        />

        {/* Banking details */}
        <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
          {rows.map((r) => (
            <CopyRow key={r.label} label={r.label} value={r.value} mono={r.mono} />
          ))}
        </div>

        {/* Payment reference — the part customers forget */}
        {reference ? (
          <div className="rounded-xl border-2 border-[#FACC15] bg-[#FEFCE8] p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#854D0E] mb-1">
              ⚠ Use this exact reference
            </p>
            <CopyRow
              label=""
              value={reference}
              mono
              big
              tone="amber"
            />
            <p className="text-xs text-[#854D0E] mt-2 leading-relaxed">
              Put this in the reference field of your payment. Without it we can't match
              your money to your order.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              Your unique <span className="font-semibold text-gray-700">payment reference</span> (your
              order number) will appear here right after you place the order. Use it when you pay so
              we can match it instantly.
            </p>
          </div>
        )}

        {/* WhatsApp proof of payment */}
        {showWhatsApp && reference && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold py-3 rounded-xl transition-colors border border-[#0F172A] hover:border-[#E63939] text-sm"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            Send proof of payment on WhatsApp
          </a>
        )}

        {/* What happens next */}
        {showSteps && (
          <div className="pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              What happens next
            </p>
            <ol className="space-y-1.5">
              {[
                'Pay the amount above by EFT, using the reference.',
                'We confirm payment during trading hours (Mon–Sun 09:00–15:00).',
                'You get a “payment confirmed” email + receipt.',
                'We pack and ship — or get it ready for collection.',
              ].map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-[#E63939] flex-shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-gray-400 mt-3">
              Payments made outside trading hours are confirmed the next day.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CopyRow({
  label,
  value,
  copyValue,
  mono,
  big,
  tone = 'default',
}: {
  label: string
  value: string
  copyValue?: string
  mono?: boolean
  big?: boolean
  tone?: 'default' | 'amber'
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(copyValue ?? value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* clipboard blocked — value is still visible to copy manually */ }
  }

  const valueColor = tone === 'amber' ? 'text-[#0F172A]' : 'text-gray-900'

  return (
    <div className={`flex items-center justify-between gap-3 ${label ? 'px-4 py-3' : ''}`}>
      <div className="min-w-0">
        {label && (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        )}
        <p
          className={`${valueColor} ${mono ? 'font-mono' : ''} ${
            big ? 'text-xl font-extrabold' : 'text-sm font-semibold'
          } truncate`}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label || 'reference'}`}
        className={`flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
          copied
            ? 'border-green-200 bg-green-50 text-green-600'
            : 'border-gray-200 bg-white text-gray-600 hover:border-[#E63939] hover:text-[#E63939]'
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
