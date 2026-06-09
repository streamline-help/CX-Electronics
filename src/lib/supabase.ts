import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL) as string
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string

const ADMIN_REMEMBER_KEY = 'cxx-admin-remember'

export function setAdminRememberMe(remember: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(ADMIN_REMEMBER_KEY, remember ? 'true' : 'false')
}

export function getAdminRememberMe(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ADMIN_REMEMBER_KEY) !== 'false'
}

// Storage adapter: route session to localStorage (remember) or sessionStorage (don't).
const adminStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key) ?? sessionStorage.getItem(key)
  },
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return
    if (getAdminRememberMe()) {
      localStorage.setItem(key, value)
      sessionStorage.removeItem(key)
    } else {
      sessionStorage.setItem(key, value)
      localStorage.removeItem(key)
    }
  },
  removeItem(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    storageKey: 'cxx-admin-auth',
    flowType: 'pkce',
    storage: adminStorage,
  },
})

// ─── Database Types ───────────────────────────────────────────────────────────

export type StockStatus = 'in_stock' | 'out_of_stock' | 'on_order'
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'ready_for_collection'
  | 'collected'
  | 'cancelled'
export type FulfillmentType = 'delivery' | 'collection'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type OrderType = 'retail' | 'bulk'
export type PaymentMethod = 'payfast' | 'ozow' | 'eft' | 'demo'

export interface Category {
  id: string
  name: string
  name_zh: string | null
  slug: string
  display_order: number
  active: boolean
  created_at: string
}

export interface Variant {
  name: string
  options: string[]
}

export interface SpecItem {
  label: string
  value: string
}

export interface SpecSection {
  title: string
  items: SpecItem[]
}

export interface ProductVariantGroup {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  name_zh: string | null
  slug: string
  description: string | null
  description_zh: string | null
  category_id: string | null
  brand: string | null
  gtin: string | null
  mpn: string | null
  retail_price: number
  bulk_price: number | null
  bulk_min_qty: number | null
  is_bulk_available: boolean
  images: string[]
  thumbnail_url: string | null
  active: boolean
  featured: boolean
  stock_status: StockStatus
  variants: Variant[] | null
  variant_group_id: string | null
  variant_label: string | null
  specifications: SpecSection[] | null
  created_at: string
  updated_at: string
}

export interface ProductWithCategory extends Product {
  categories: Pick<Category, 'id' | 'name' | 'name_zh' | 'slug'> | null
  product_variant_groups?: Pick<ProductVariantGroup, 'id' | 'name' | 'slug'> | null
}

export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  line_total: number
  thumbnail_url: string | null
  created_at: string
}

export interface OrderStatusEvent {
  id: string
  order_id: string
  status: string
  note: string | null
  triggered_by: string
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  order_type: OrderType
  status: OrderStatus
  fulfillment_type: FulfillmentType
  collection_name: string | null
  collection_phone: string | null
  subtotal: number
  shipping_fee: number
  total: number
  shipping_address: ShippingAddress | null
  notes: string | null
  payment_method: PaymentMethod | null
  payment_status: PaymentStatus
  payment_reference: string | null
  created_at: string
  updated_at: string
}

export interface OrderWithDetails extends Order {
  customers: Pick<Customer, 'id' | 'name' | 'email' | 'phone'> | null
  order_items: Pick<OrderItem, 'id' | 'product_name' | 'quantity' | 'unit_price' | 'line_total' | 'thumbnail_url'>[]
  order_status_events?: OrderStatusEvent[]
}

export interface ShippingAddress {
  name: string
  address_line1: string
  address_line2?: string
  city: string
  province: string
  postal_code: string
  phone: string
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────

export function getProductImageUrl(path: string, width = 600): string {
  // Pass through external URLs and local /public/ paths unchanged
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path

  const { data } = supabase.storage.from('products').getPublicUrl(path, {
    transform: {
      width,
      height: width,
      resize: 'contain',
      // Supabase SDK types 'format' as 'origin' but API accepts 'webp'
      format: 'webp' as 'origin',
      quality: 85,
    },
  })
  return data.publicUrl
}
