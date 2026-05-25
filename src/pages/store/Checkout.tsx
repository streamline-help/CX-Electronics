import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Loader2, Landmark, Store, Truck, Zap, Clock } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { useCart } from '../../context/CartContext'
import { useLang } from '../../context/LangContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { supabase, type ShippingAddress, type OrderWithDetails } from '../../lib/supabase'
import { customerSupabase } from '../../lib/customerAuth'
import { notifyNewOrder } from '../../lib/webhooks'
import { AddressAutocomplete, type ParsedAddress } from '../../components/store/AddressAutocomplete'
import { BankingDetailsCard } from '../../components/store/BankingDetailsCard'
import { getEnabledPaymentMethods, type PaymentMethodId } from '../../lib/payments'

// PayFast still pending Credit Risk approval — orders are created as
// `pending` / `payment_status=unpaid` with payment_method=eft. The Order
// Confirmation page shows banking details + reference, and admin flips the
// order to `paid` once the EFT lands. When PayFast / Yoco / Paystack
// approve, flip the relevant entry in `src/lib/payments.ts` to enabled:true
// and branch on the selected method here.

type DeliveryMethod = 'collection' | 'economic' | 'nextday' | 'express'

const DELIVERY_OPTIONS: {
  key: DeliveryMethod
  label: string
  sub: string
  eta: string
  price: number
  icon: typeof Store
}[] = [
  {
    key: 'collection',
    label: 'Store Collection',
    sub: 'Unit 303, China Cash and Carry, Crown Mines',
    eta: 'Ready within 1–2 hours',
    price: 0,
    icon: Store,
  },
  {
    key: 'economic',
    label: 'Economy Delivery',
    sub: 'Nationwide · Fastway courier',
    eta: '2–5 business days',
    price: 100,
    icon: Truck,
  },
  {
    key: 'nextday',
    label: 'Next Day Delivery',
    sub: 'Major cities · Order before 12pm',
    eta: 'Next business day',
    price: 150,
    icon: Truck,
  },
  {
    key: 'express',
    label: 'Overnight Delivery',
    sub: 'Major cities · Order before 12pm',
    eta: 'Same / next business day',
    price: 300,
    icon: Zap,
  },
]

const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
]

const ORDERS_KEY = 'cxx-my-orders'
const LOCAL_ORDERS_KEY = 'cxx-local-orders'

interface FormData {
  name: string
  email: string
  phone: string
  address_line1: string
  address_line2: string
  city: string
  province: string
  postal_code: string
}

const EMPTY_FORM: FormData = {
  name: '', email: '', phone: '', address_line1: '',
  address_line2: '', city: '', province: 'Gauteng', postal_code: '',
}

function saveOrderLocally(order: OrderWithDetails) {
  try {
    const stored: Record<string, OrderWithDetails> = JSON.parse(
      localStorage.getItem(LOCAL_ORDERS_KEY) ?? '{}',
    )
    stored[order.id] = order
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(stored))
  } catch { /* ignore */ }

  try {
    const list = JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]')
    list.unshift({
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
      order_type: order.order_type,
    })
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

export function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { t, lang } = useLang()
  const { user } = useCustomerAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [delivery, setDelivery] = useState<DeliveryMethod>('economic')

  const paymentMethods = getEnabledPaymentMethods()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>(
    paymentMethods[0]?.id ?? 'eft',
  )

  // Pre-fill form from logged-in customer account + last shipping address
  useEffect(() => {
    if (!user) return
    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name,
      email: prev.email || user.email,
    }))

    // Look up the customer's most recent order to reuse their shipping details
    let cancelled = false
    ;(async () => {
      const { data: customer } = await customerSupabase
        .from('customers')
        .select('id, phone, address_line1, address_line2, city, province, postal_code')
        .eq('email', user.email)
        .maybeSingle()
      if (cancelled || !customer) return

      setForm((prev) => ({
        ...prev,
        phone:          prev.phone          || customer.phone          || '',
        address_line1: prev.address_line1   || customer.address_line1 || '',
        address_line2: prev.address_line2   || customer.address_line2 || '',
        city:           prev.city           || customer.city           || '',
        province:       customer.province   || prev.province,
        postal_code:    prev.postal_code   || customer.postal_code    || '',
      }))
    })()

    return () => { cancelled = true }
  }, [user])

  const isCollection = delivery === 'collection'
  const selectedDelivery = DELIVERY_OPTIONS.find((o) => o.key === delivery)!
  const shippingFee = isCollection ? 0 : selectedDelivery.price
  const total = subtotal + shippingFee

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cxx-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
          <ShoppingCart className="w-12 h-12" />
          <p>Your cart is empty</p>
          <Link to="/shop" className="text-cxx-blue text-sm hover:underline">Go shopping</Link>
        </div>
        <Footer />
      </div>
    )
  }

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function applyAddressSelection(parsed: ParsedAddress) {
    setForm((prev) => ({
      ...prev,
      address_line1: parsed.address_line1 || prev.address_line1,
      city: parsed.city || prev.city,
      province: parsed.province || prev.province,
      postal_code: parsed.postal_code || prev.postal_code,
    }))
    setErrors((prev) => ({
      ...prev,
      address_line1: undefined,
      city: undefined,
      province: undefined,
      postal_code: undefined,
    }))
  }

  function validate(): boolean {
    const errs: Partial<FormData> = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email required'
    if (!form.phone.trim()) errs.phone = 'Required'
    if (!isCollection) {
      if (!form.address_line1.trim()) errs.address_line1 = 'Required'
      if (!form.city.trim()) errs.city = 'Required'
      if (!form.postal_code.trim()) errs.postal_code = 'Required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError(null)

    const fulfillmentType = isCollection ? 'collection' : 'delivery'
    const shippingAddr: ShippingAddress | null = isCollection ? null : {
      name: form.name,
      address_line1: form.address_line1,
      address_line2: form.address_line2 || undefined,
      city: form.city,
      province: form.province,
      postal_code: form.postal_code,
      phone: form.phone,
    }

    const orderType = items.some((i) => i.orderType === 'bulk') ? 'bulk' : 'retail'
    const now = new Date().toISOString()

    // Single trusted entry point. place_order() is SECURITY DEFINER so it works
    // identically for guests (anon) and logged-in customers — it upserts the
    // customer by email, creates the order + items + first status event
    // atomically, and returns the server-generated CW order number. This is
    // why guest checkout no longer needs table-level RETURNING (which RLS
    // blocks for anon).
    const db = user ? customerSupabase : supabase

    try {
      const { data: rpcData, error: rpcErr } = await db.rpc('place_order', {
        payload: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          is_collection: isCollection,
          address_line1: form.address_line1,
          address_line2: form.address_line2 || null,
          city: form.city,
          province: form.province,
          postal_code: form.postal_code,
          order_type: orderType,
          subtotal,
          shipping_fee: shippingFee,
          total,
          payment_method: paymentMethod,
          notes: `Delivery: ${selectedDelivery.label}`,
          shipping_address: shippingAddr,
          items: items.map((item) => ({
            product_id: item.productId,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            line_total: item.price * item.quantity,
            thumbnail_url: item.image || null,
          })),
        },
      })

      const result = rpcData as
        | { order_id: string; order_number: string; customer_id: string | null }
        | null

      if (rpcErr || !result?.order_id) {
        setSubmitError(rpcErr?.message ?? 'Could not place your order. Please try again.')
        setSubmitting(false)
        return
      }

      const fullOrder: OrderWithDetails = {
        id: result.order_id,
        order_number: result.order_number,
        customer_id: result.customer_id ?? null,
        order_type: orderType,
        status: 'pending',
        fulfillment_type: fulfillmentType,
        collection_name: isCollection ? form.name : null,
        collection_phone: isCollection ? form.phone : null,
        payment_status: 'unpaid',
        payment_method: paymentMethod as OrderWithDetails['payment_method'],
        payment_reference: result.order_number,
        notes: `Delivery: ${selectedDelivery.label}`,
        subtotal,
        shipping_fee: shippingFee,
        total,
        shipping_address: shippingAddr,
        created_at: now,
        updated_at: now,
        customers: { id: result.customer_id ?? '', name: form.name, email: form.email, phone: form.phone },
        order_items: items.map((item, i) => ({
          id: String(i),
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          line_total: item.price * item.quantity,
          thumbnail_url: item.image || null,
        })),
      }

      saveOrderLocally(fullOrder)
      notifyNewOrder(fullOrder)
      clearCart()
      navigate(`/order/${result.order_id}`, { state: { order: fullOrder } })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Network error. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-cxx-bg">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('checkout')}</h1>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column */}
            <div className="flex-1 space-y-5">

              {/* Delivery method */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Delivery Method</h2>
                <div className="space-y-2">
                  {DELIVERY_OPTIONS.map(({ key, label, sub, eta, price, icon: Icon }) => {
                    const effectivePrice = price
                    const isSelected = delivery === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setDelivery(key)}
                        className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-[#E63939] bg-[#FEF2F2]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-[#E63939] text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="font-semibold text-gray-900 text-sm">{label}</p>
                            <p className={`text-sm font-bold flex-shrink-0 ${effectivePrice === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                              {effectivePrice === 0 ? 'FREE' : `R${effectivePrice}`}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                          <p className="text-xs font-semibold text-[#E63939] mt-0.5">{eta}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Customer / shipping details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {isCollection ? 'Your Details' : t('shippingDetails')}
                </h2>

                <div className="space-y-4">
                  <Field label={t('fullName')} error={errors.name} required>
                    <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inp(errors.name)} placeholder="John Smith" />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label={t('email')} error={errors.email} required>
                      <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inp(errors.email)} placeholder="you@email.com" />
                    </Field>
                    <Field label={t('phone')} error={errors.phone} required>
                      <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inp(errors.phone)} placeholder="071 000 0000" />
                    </Field>
                  </div>

                  {/* Address fields — hidden for collection */}
                  {!isCollection && (
                    <>
                      <Field label={t('address')} error={errors.address_line1} required>
                        <AddressAutocomplete
                          value={form.address_line1}
                          onChange={(v) => set('address_line1', v)}
                          onSelect={applyAddressSelection}
                          className={inp(errors.address_line1)}
                          placeholder="Start typing your address..."
                          required
                        />
                        <p className="text-xs text-gray-400 mt-1">Pick a suggestion to auto-fill the rest</p>
                      </Field>

                      <Field label={t('address2')}>
                        <input type="text" value={form.address_line2} onChange={(e) => set('address_line2', e.target.value)} className={inp()} placeholder="Apartment, unit, etc." />
                      </Field>

                      <div className="grid grid-cols-2 gap-4">
                        <Field label={t('city')} error={errors.city} required>
                          <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} className={inp(errors.city)} placeholder="Johannesburg" />
                        </Field>
                        <Field label={t('postalCode')} error={errors.postal_code} required>
                          <input type="text" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} className={inp(errors.postal_code)} placeholder="2001" />
                        </Field>
                      </div>

                      <Field label={t('province')}>
                        <select value={form.province} onChange={(e) => set('province', e.target.value)} className={inp()}>
                          {SA_PROVINCES.map((p) => <option key={p}>{p}</option>)}
                        </select>
                      </Field>
                    </>
                  )}

                  {/* Collection info banner */}
                  {isCollection && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                      <p className="font-semibold mb-0.5">Collection address</p>
                      <p className="text-blue-600">Unit 303, China Cash and Carry, Cnr Discovery Drive & Renaissance Blvd, Crown Mines, Johannesburg, 2092</p>
                      <p className="text-blue-500 text-xs mt-1">Bring your order number and ID when collecting.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {lang === 'zh' ? '付款方式' : 'Payment Method'}
                </h2>

                <div className="space-y-2">
                  {paymentMethods.map((m) => {
                    const isSelected = paymentMethod === m.id
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-[#E63939] bg-[#FEF2F2]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#E63939] text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">
                            {lang === 'zh' ? m.labelZh : m.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {lang === 'zh' ? m.descriptionZh : m.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {paymentMethod === 'eft' && (
                  <div className="mt-3 space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-amber-800">
                      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed">
                        {lang === 'zh'
                          ? '下单后您将获得唯一的付款参考号（订单号）。我们在营业时间（每天 09:00–15:00）确认付款后会以电子邮件通知您。'
                          : 'When you place your order you\'ll get a unique payment reference (your order number). We confirm payments during trading hours (Mon–Sun 09:00–15:00) and email you once received.'}
                      </p>
                    </div>
                    <BankingDetailsCard amount={total} showSteps={false} showWhatsApp={false} />
                  </div>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:w-72">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
                <h2 className="font-semibold text-gray-900 mb-4">{t('orderSummary')}</h2>

                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate flex-1 mr-2">
                        {item.name} <span className="text-gray-400">x{item.quantity}</span>
                      </span>
                      <span className="font-medium text-gray-900 flex-shrink-0">
                        R{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm mb-5">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('subtotal')}</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{selectedDelivery.label}</span>
                    <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                      {shippingFee === 0 ? 'FREE' : `R${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-gray-900 pt-1 border-t border-gray-100 mt-2">
                    <span>{t('total')}</span>
                    <span className="text-[#E63939]">R{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-cxx-blue hover:bg-cxx-blue-hover text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting
                    ? (lang === 'zh' ? '正在下单…' : 'Placing order…')
                    : paymentMethod === 'eft'
                      ? (lang === 'zh' ? `下单 — R${total.toFixed(2)}` : `Place order — R${total.toFixed(2)}`)
                      : `Pay R${total.toFixed(2)}`}
                </button>

                {submitError && (
                  <p className="text-xs text-red-600 text-center mt-3 bg-red-50 border border-red-200 rounded-lg p-2">
                    {submitError}
                  </p>
                )}

                <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Secure checkout · 256-bit SSL · POPIA compliant
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}

function Field({
  label, error, required, children,
}: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function inp(error?: string): string {
  return `w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-cxx-blue focus:border-transparent ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`
}
