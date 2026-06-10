import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { LangProvider } from './context/LangContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import { WishlistProvider } from './context/WishlistContext'
import { ProtectedRoute } from './components/admin/ProtectedRoute'
import { ScrollToTop } from './components/ScrollToTop'
import { AddToCartDrawer } from './components/store/AddToCartDrawer'
import { ExitIntentPopup } from './components/store/ExitIntentPopup'
import { CartFAB } from './components/store/CartFAB'
import { PWAPrompt } from './components/PWAPrompt'
import { ScrollProgress } from './components/store/ScrollProgress'
import { isStandalone } from './lib/pwaInstall'

// When running as an installed PWA, force every route back into /admin/*.
// The manifest scope already enforces this at the browser level, but this
// guards against any in-app navigation slipping out of admin.
function StandaloneAdminGuard() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isStandalone() && !location.pathname.startsWith('/admin')) {
      navigate('/admin/login', { replace: true })
    }
  }, [location.pathname, navigate])

  return null
}

// Customer account — lazy loaded
const AccountLogin    = lazy(() => import('./pages/account/Login').then((m) => ({ default: m.AccountLogin })))
const AccountRegister = lazy(() => import('./pages/account/Register').then((m) => ({ default: m.AccountRegister })))
const ForgotPassword  = lazy(() => import('./pages/account/ForgotPassword').then((m) => ({ default: m.ForgotPassword })))
const ResetPassword   = lazy(() => import('./pages/account/ResetPassword').then((m) => ({ default: m.ResetPassword })))
const AccountLayout   = lazy(() => import('./pages/account/AccountLayout').then((m) => ({ default: m.AccountLayout })))
const AccountProfile  = lazy(() => import('./pages/account/Profile').then((m) => ({ default: m.AccountProfile })))
const MyOrders        = lazy(() => import('./pages/account/MyOrders').then((m) => ({ default: m.MyOrders })))
const AccountOrderDetail = lazy(() => import('./pages/account/OrderDetail').then((m) => ({ default: m.AccountOrderDetail })))
const Wishlist        = lazy(() => import('./pages/account/Wishlist').then((m) => ({ default: m.Wishlist })))

// Public store — eagerly loaded
import { Home } from './pages/store/Home'
import { Shop } from './pages/store/Shop'
import { CategoryPage } from './pages/store/CategoryPage'
import { ProductDetail } from './pages/store/ProductDetail'
import { VariantProductDetail } from './pages/store/VariantProductDetail'
import { Wholesale } from './pages/store/Wholesale'
import { BulkProductDetail } from './pages/store/BulkProductDetail'
import { Deals } from './pages/store/Deals'
import { About } from './pages/store/About'
// Low-traffic / non-landing store pages — lazy-loaded to keep the initial bundle lean.
const Blog = lazy(() => import('./pages/store/Blog').then((m) => ({ default: m.Blog })))
const BlogPost = lazy(() => import('./pages/store/BlogPost').then((m) => ({ default: m.BlogPost })))
import { Terms } from './pages/store/Terms'
import { ShippingPolicy } from './pages/store/ShippingPolicy'
import { RefundPolicy } from './pages/store/RefundPolicy'
import { PrivacyPolicy } from './pages/store/PrivacyPolicy'
import { CartPage } from './pages/store/CartPage'
import { Checkout } from './pages/store/Checkout'
const OrderConfirmation = lazy(() => import('./pages/store/OrderConfirmation').then((m) => ({ default: m.OrderConfirmation })))
const PublicReceipt = lazy(() => import('./pages/store/Receipt').then((m) => ({ default: m.PublicReceipt })))
const RetailInvoice = lazy(() => import('./pages/invoices/RetailInvoice').then((m) => ({ default: m.RetailInvoice })))
const WholesaleInvoice = lazy(() => import('./pages/invoices/WholesaleInvoice').then((m) => ({ default: m.WholesaleInvoice })))

// Admin — lazy loaded (never bundled with store)
const AdminLogin = lazy(() => import('./pages/admin/Login').then((m) => ({ default: m.AdminLogin })))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then((m) => ({ default: m.AdminDashboard })))
const AdminProducts = lazy(() => import('./pages/admin/Products').then((m) => ({ default: m.AdminProducts })))
const ProductForm = lazy(() => import('./pages/admin/ProductForm').then((m) => ({ default: m.ProductForm })))
const AdminOrders = lazy(() => import('./pages/admin/Orders').then((m) => ({ default: m.AdminOrders })))
const AdminOrderDetail  = lazy(() => import('./pages/admin/OrderDetail').then((m) => ({ default: m.AdminOrderDetail })))
const AdminOrderInvoice = lazy(() => import('./pages/admin/OrderInvoice').then((m) => ({ default: m.AdminOrderInvoice })))
const AdminCustomers    = lazy(() => import('./pages/admin/Customers').then((m) => ({ default: m.AdminCustomers })))
const AdminMessages     = lazy(() => import('./pages/admin/Messages').then((m) => ({ default: m.AdminMessages })))
const ReceiptDemo       = lazy(() => import('./pages/admin/ReceiptDemo').then((m) => ({ default: m.ReceiptDemo })))

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-cxx-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <CustomerAuthProvider>
      <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <StandaloneAdminGuard />
          <ScrollToTop />
          <ScrollProgress />
          <AddToCartDrawer />
          <ExitIntentPopup />
          <CartFAB />
          <PWAPrompt />
          <Routes>
            {/* ── Public store ─────────────────────────────────── */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/shop/group/:groupSlug" element={<VariantProductDetail />} />
            <Route path="/shop/:slug" element={<ProductDetail />} />
            <Route path="/wholesale" element={<Wholesale />} />
            <Route path="/bulk" element={<Navigate to="/wholesale" replace />} />
            <Route path="/bulk/:slug" element={<BulkProductDetail />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/blog" element={<Suspense fallback={<AdminFallback />}><Blog /></Suspense>} />
            <Route path="/blog/:slug" element={<Suspense fallback={<AdminFallback />}><BlogPost /></Suspense>} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/returns" element={<Terms />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<Suspense fallback={<AdminFallback />}><OrderConfirmation /></Suspense>} />
            <Route path="/receipt/:id" element={<Suspense fallback={<AdminFallback />}><PublicReceipt /></Suspense>} />
            <Route path="/invoice/retail" element={<Suspense fallback={<AdminFallback />}><RetailInvoice /></Suspense>} />
            <Route path="/invoice/wholesale" element={<Suspense fallback={<AdminFallback />}><WholesaleInvoice /></Suspense>} />

            {/* ── Customer account ──────────────────────────────── */}
            <Route path="/account/login"           element={<Suspense fallback={<AdminFallback />}><AccountLogin /></Suspense>} />
            <Route path="/account/register"        element={<Suspense fallback={<AdminFallback />}><AccountRegister /></Suspense>} />
            <Route path="/account/forgot-password" element={<Suspense fallback={<AdminFallback />}><ForgotPassword /></Suspense>} />
            <Route path="/account/reset-password"  element={<Suspense fallback={<AdminFallback />}><ResetPassword /></Suspense>} />
            <Route path="/account" element={<Suspense fallback={<AdminFallback />}><AccountLayout /></Suspense>}>
              <Route index element={<Navigate to="/account/profile" replace />} />
              <Route path="profile"    element={<Suspense fallback={<AdminFallback />}><AccountProfile /></Suspense>} />
              <Route path="orders"     element={<Suspense fallback={<AdminFallback />}><MyOrders /></Suspense>} />
              <Route path="orders/:id" element={<Suspense fallback={<AdminFallback />}><AccountOrderDetail /></Suspense>} />
              <Route path="wishlist"   element={<Suspense fallback={<AdminFallback />}><Wishlist /></Suspense>} />
            </Route>

            {/* ── Admin ─────────────────────────────────────────── */}
            <Route
              path="/admin/login"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminLogin />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                </Suspense>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
              <Route path="products" element={<Suspense fallback={<AdminFallback />}><AdminProducts /></Suspense>} />
              <Route path="products/new" element={<Suspense fallback={<AdminFallback />}><ProductForm /></Suspense>} />
              <Route path="products/:id" element={<Suspense fallback={<AdminFallback />}><ProductForm /></Suspense>} />
              <Route path="orders" element={<Suspense fallback={<AdminFallback />}><AdminOrders /></Suspense>} />
              <Route path="orders/:id" element={<Suspense fallback={<AdminFallback />}><AdminOrderDetail /></Suspense>} />
              <Route path="orders/:id/invoice" element={<Suspense fallback={<AdminFallback />}><AdminOrderInvoice /></Suspense>} />
              <Route path="customers" element={<Suspense fallback={<AdminFallback />}><AdminCustomers /></Suspense>} />
              <Route path="messages"  element={<Suspense fallback={<AdminFallback />}><AdminMessages /></Suspense>} />
            </Route>

            {/* Fallback */}
            <Route path="/admin/receipt-demo" element={<Suspense fallback={<AdminFallback />}><ReceiptDemo /></Suspense>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
      </WishlistProvider>
      </CustomerAuthProvider>
    </LangProvider>
  )
}
