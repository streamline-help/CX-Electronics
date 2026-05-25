import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Loader2, FileText, Package,
  CheckCircle2, Circle, Truck, Store,
} from 'lucide-react'
import { getOrder } from '../../hooks/useOrders'
import { customerSupabase } from '../../lib/customerAuth'
import { getProductImageUrl } from '../../lib/supabase'
import type { OrderWithDetails, OrderStatus } from '../../lib/supabase'

const ACCOUNT_ORDER_SELECT = `
  id, order_number, customer_id, order_type, status,
  fulfillment_type, collection_name, collection_phone,
  subtotal, shipping_fee, total,
  shipping_address, notes, payment_method, payment_status, payment_reference,
  created_at, updated_at,
  customers ( id, name, email, phone ),
  order_items ( id, product_name, quantity, unit_price, line_total, thumbnail_url ),
  order_status_events ( id, status, note, triggered_by, created_at )
`

// Fetch via the authenticated customer client so RLS
// (auth.role() = 'authenticated') is satisfied — works on any device,
// not just the one the order was placed on.
async function getOrderForCustomer(orderId: string): Promise<OrderWithDetails | null> {
  const { data, error } = await customerSupabase
    .from('orders')
    .select(ACCOUNT_ORDER_SELECT)
    .eq('id', orderId)
    .order('created_at', { referencedTable: 'order_status_events', ascending: true })
    .maybeSingle()
  if (error || !data) return null
  return data as unknown as OrderWithDetails
}

const LOCAL_ORDERS_KEY = 'cxx-local-orders'

const STATUS_LABEL: Record<string, string> = {
  pending:              'Order Placed',
  paid:                 'Payment Confirmed',
  processing:           'Processing',
  packed:               'Packed',
  out_for_delivery:     'Out for Delivery',
  delivered:            'Delivered',
  ready_for_collection: 'Ready for Collection',
  collected:            'Collected',
  cancelled:            'Cancelled',
}

const STATUS_BADGE: Record<string, string> = {
  pending:              'bg-yellow-500/20 text-yellow-400',
  paid:                 'bg-blue-500/20 text-blue-400',
  processing:           'bg-purple-500/20 text-purple-400',
  packed:               'bg-indigo-500/20 text-indigo-400',
  out_for_delivery:     'bg-sky-500/20 text-sky-400',
  delivered:            'bg-green-500/20 text-green-400',
  ready_for_collection: 'bg-teal-500/20 text-teal-400',
  collected:            'bg-green-500/20 text-green-400',
  cancelled:            'bg-red-500/20 text-red-400',
}

const DELIVERY_PATH: OrderStatus[] = ['pending', 'paid', 'processing', 'packed', 'out_for_delivery', 'delivered']
const COLLECTION_PATH: OrderStatus[] = ['pending', 'paid', 'processing', 'packed', 'ready_for_collection', 'collected']

function getPath(order: OrderWithDetails): OrderStatus[] {
  if (order.status === 'cancelled') return ['pending', 'cancelled']
  return order.fulfillment_type === 'collection' ? COLLECTION_PATH : DELIVERY_PATH
}

function isReached(path: OrderStatus[], current: OrderStatus, step: OrderStatus): boolean {
  return path.indexOf(current) >= path.indexOf(step)
}

export function AccountOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    // Instant paint from the copy saved at checkout (same device).
    try {
      const stored: Record<string, OrderWithDetails> = JSON.parse(
        localStorage.getItem(LOCAL_ORDERS_KEY) ?? '{}',
      )
      if (stored[id]) setOrder(stored[id])
    } catch { /* fall through */ }

    // Authoritative fetch via the authenticated customer client (works
    // cross-device); fall back to the shared anon fetch as a last resort.
    ;(async () => {
      let fresh = await getOrderForCustomer(id)
      if (!fresh) fresh = await getOrder(id)
      if (cancelled) return
      if (fresh) setOrder(fresh)
      setLoading(false)
    })()

    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-[#E63939] animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
        <Package className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/60 font-semibold">Order not found</p>
        <Link to="/account/orders" className="inline-block mt-4 text-[#E63939] hover:underline text-sm font-medium">
          Back to orders
        </Link>
      </div>
    )
  }

  const isPaid = order.payment_status === 'paid' || order.status === 'paid'
  const addr = order.shipping_address
  const isCollection = order.fulfillment_type === 'collection'
  const path = getPath(order)
  const events = order.order_status_events ?? []

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div>
        <Link to="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          My Orders
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-white text-lg">{order.order_number}</h2>
            <p className="text-sm text-white/40 mt-0.5">
              {new Date(order.created_at).toLocaleDateString('en-ZA', {
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
              })}
              {' · '}
              {isCollection
                ? <span className="inline-flex items-center gap-1"><Store className="w-3.5 h-3.5" /> Collection</span>
                : <span className="inline-flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Delivery</span>}
            </p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5 ${STATUS_BADGE[order.status] ?? 'bg-white/10 text-white/40'}`}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
      </div>

      {/* Status timeline */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Order Progress</h3>
        <div className="relative">
          {/* Vertical connector */}
          <div className="absolute left-[11px] top-3 bottom-3 w-px bg-white/10" />
          <div className="space-y-4">
            {path.map((step) => {
              const reached = isReached(path, order.status, step)
              const isCurrent = order.status === step
              const evt = events.find((e) => e.status === step)
              return (
                <div key={step} className="flex items-start gap-3 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 z-10 border ${
                    isCurrent
                      ? 'bg-[#E63939] border-[#E63939]'
                      : reached
                        ? 'bg-green-500/20 border-green-500/40'
                        : 'bg-white/5 border-white/20'
                  }`}>
                    {reached
                      ? <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-green-400'}`} />
                      : <Circle className="w-3.5 h-3.5 text-white/20" />}
                  </div>
                  <div className="pt-0.5 flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${reached ? 'text-white' : 'text-white/30'}`}>
                      {STATUS_LABEL[step]}
                    </p>
                    {evt && (
                      <p className="text-xs text-white/30 mt-0.5">
                        {new Date(evt.created_at).toLocaleDateString('en-ZA', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                        {evt.note && ` · ${evt.note}`}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Items</h3>
        <div className="space-y-3">
          {order.order_items.map((item, i) => (
            <div key={item.id ?? i} className="flex items-center gap-3">
              {item.thumbnail_url ? (
                <img src={getProductImageUrl(item.thumbnail_url, 120)} alt="" className="w-12 h-12 rounded-lg object-cover bg-white/5 flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/10 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.product_name}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {item.quantity} × R{item.unit_price.toFixed(2)}
                </p>
              </div>
              <p className="text-sm font-semibold text-white flex-shrink-0">
                R{item.line_total.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-white/50">
            <span>Subtotal</span><span>R{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>Shipping</span>
            <span className={order.shipping_fee === 0 ? 'text-green-400' : ''}>
              {order.shipping_fee === 0 ? 'FREE' : `R${order.shipping_fee.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-white text-base pt-1 border-t border-white/10">
            <span>Total</span>
            <span className="text-[#E63939]">R{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Fulfillment details */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
          {isCollection ? 'Collection Details' : 'Shipping To'}
        </h3>
        {isCollection ? (
          <div className="text-sm text-white/70 space-y-0.5">
            <p className="font-semibold text-white">Unit 303, China Cash and Carry</p>
            <p>Cnr Discovery Drive & Renaissance Blvd, Crown Mines, Johannesburg</p>
            <p className="text-white/40 text-xs mt-1">Mon–Sun 09:00–15:00</p>
            {order.collection_name && (
              <p className="text-white/50 text-xs">Collecting: {order.collection_name}</p>
            )}
          </div>
        ) : addr ? (
          <div className="text-sm text-white/70 space-y-0.5">
            <p className="font-semibold text-white">{addr.name}</p>
            <p>{addr.address_line1}</p>
            {addr.address_line2 && <p>{addr.address_line2}</p>}
            <p>{addr.city}, {addr.province} {addr.postal_code}</p>
            {addr.phone && <p>{addr.phone}</p>}
          </div>
        ) : (
          <p className="text-sm text-white/40">No address on record</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {isPaid && (
          <a
            href={`/receipt/${order.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download Receipt
          </a>
        )}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
