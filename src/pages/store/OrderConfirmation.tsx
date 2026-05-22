import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { CheckCircle, Package, FileText, Clock } from 'lucide-react'
import { Navbar } from '../../components/store/Navbar'
import { Footer } from '../../components/store/Footer'
import { BankingDetailsCard } from '../../components/store/BankingDetailsCard'
import { getOrder } from '../../hooks/useOrders'
import type { OrderWithDetails } from '../../lib/supabase'

const LOCAL_ORDERS_KEY = 'cxx-local-orders'

export function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const stateOrder = (location.state as { order?: OrderWithDetails } | null)?.order

  const [order, setOrder] = useState<OrderWithDetails | null>(stateOrder ?? null)
  const [loading, setLoading] = useState(!stateOrder)

  useEffect(() => {
    if (stateOrder || !id) return

    // Check localStorage first (local/demo orders)
    try {
      const stored: Record<string, OrderWithDetails> = JSON.parse(
        localStorage.getItem(LOCAL_ORDERS_KEY) ?? '{}',
      )
      if (stored[id]) {
        setOrder(stored[id])
        setLoading(false)
        return
      }
    } catch { /* fall through */ }

    // Fetch from Supabase
    getOrder(id).then((o) => {
      setOrder(o)
      setLoading(false)
    })
  }, [id, stateOrder])

  // Poll for PayFast ITN payment confirmation.
  // PayFast's return_url fires before the ITN in some cases, so the order
  // may still be 'pending' when this page first loads. Poll for up to 45s.
  useEffect(() => {
    if (!id || !order) return
    const alreadyPaid = order.payment_status === 'paid' || order.status === 'paid'
    if (alreadyPaid) return

    let attempts = 0
    const MAX = 15 // 15 × 3s = 45s

    const timer = setInterval(async () => {
      attempts++
      const fresh = await getOrder(id)
      if (fresh && (fresh.payment_status === 'paid' || fresh.status === 'paid')) {
        setOrder(fresh)
        clearInterval(timer)
      } else if (attempts >= MAX) {
        clearInterval(timer)
      }
    }, 3000)

    return () => clearInterval(timer)
  }, [id, order?.payment_status, order?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-cxx-bg">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-[#E63939] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cxx-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 text-gray-400 gap-4">
          <Package className="w-12 h-12" />
          <p>Order not found</p>
          <Link to="/shop" className="text-cxx-blue text-sm hover:underline">Continue shopping</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const addr = order.shipping_address
  const isPaid = order.payment_status === 'paid' || order.status === 'paid'
  const awaitingEft = !isPaid && order.payment_method === 'eft'

  return (
    <div className="min-h-screen bg-cxx-bg">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isPaid ? 'bg-green-100' : 'bg-blue-50'}`}>
            {isPaid
              ? <CheckCircle className="w-8 h-8 text-green-600" />
              : <Clock className="w-8 h-8 text-blue-500" />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {isPaid ? 'Payment Received!' : 'Order Placed!'}
          </h1>
          <p className="text-gray-500">Order #{order.order_number}</p>
        </div>

        {/* Status banner */}
        {isPaid ? (
          <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 mb-5 text-sm font-medium text-center">
            Payment confirmed — a receipt has been sent to your email.
          </div>
        ) : awaitingEft ? (
          <div className="mb-5">
            <p className="text-center text-sm text-gray-600 mb-4">
              Almost there — please pay by EFT to complete your order. We've also emailed these details to you.
            </p>
            <BankingDetailsCard reference={order.payment_reference ?? order.order_number} amount={order.total} />
          </div>
        ) : (
          <div className="bg-blue-50 text-blue-700 border border-blue-200 rounded-xl p-4 mb-5 text-sm font-medium text-center">
            Your order is being processed. You'll receive a confirmation email once payment clears.
          </div>
        )}

        {/* Receipt button — shown when paid */}
        {isPaid && (
          <div className="mb-5 text-center">
            <a
              href={`/receipt/${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1e293b] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              View &amp; Download Receipt
            </a>
          </div>
        )}

        {/* Customer info */}
        {order.customers && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <h2 className="font-semibold text-gray-900 mb-3">Customer Details</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-900">{order.customers.name}</p>
              {order.customers.email && <p>{order.customers.email}</p>}
              {order.customers.phone && <p>{order.customers.phone}</p>}
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">Your Order</h2>
          <div className="space-y-2">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.product_name} <span className="text-gray-400">x{item.quantity}</span>
                </span>
                <span className="font-medium">R{item.line_total.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>R{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>{order.shipping_fee === 0 ? 'FREE' : `R${order.shipping_fee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-1 text-base">
              <span>Total</span><span className="text-[#E63939]">R{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        {addr && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8">
            <h2 className="font-semibold text-gray-900 mb-3">Shipping to</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>{addr.name}</p>
              <p>{addr.address_line1}</p>
              {addr.address_line2 && <p>{addr.address_line2}</p>}
              <p>{addr.city}, {addr.province} {addr.postal_code}</p>
              {addr.phone && <p>{addr.phone}</p>}
            </div>
          </div>
        )}

        <Link
          to="/shop"
          className="block w-full text-center bg-cxx-blue hover:bg-cxx-blue-hover text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

      <Footer />
    </div>
  )
}
