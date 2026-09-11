import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import AdminDashboard from './pages/admin/Dashboard'
import AdminCoupons from './pages/admin/Coupons'
import AdminReviews from './pages/admin/Reviews'
import AdminUsers from './pages/admin/Users'
import AdminReports from './pages/admin/Reports'
import AdminProducts from './pages/admin/Products'
import AdminSupport from './pages/admin/Support'
import AdminInventory from './pages/admin/Inventory'
import AdminPaymentSettings from './pages/admin/PaymentSettings'
import AdminBanners from './pages/admin/Banners'
import AdminTaxonomy from './pages/admin/Taxonomy'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CustomerHome from './pages/customer/Home'
import CustomerProducts from './pages/customer/Products'
import AIConsultation from './pages/customer/AIConsultation'
import Cart from './pages/customer/Cart'
import ProductDetail from './pages/customer/ProductDetail'
import Checkout from './pages/customer/Checkout'
import CustomerOrders from './pages/customer/Orders'
import CustomerProfile from './pages/customer/Profile'
import CustomerSupport from './pages/customer/Support'
import CustomerWishlist from './pages/customer/Wishlist'
import { PublicOnly, RequireAdmin, RequireAuth } from './routes'
import AdminLayout from './components/admin/AdminLayout'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/customer" element={<CustomerHome />} />
          <Route path="/customer/products" element={<CustomerProducts />} />
          <Route element={<RequireAuth />}>
            <Route path="/customer/ai-consultation" element={<AIConsultation />} />
            <Route path="/customer/products/:productId" element={<ProductDetail />} />
            <Route path="/customer/cart" element={<Cart />} />
            <Route path="/customer/checkout" element={<Checkout />} />
            <Route path="/customer/orders" element={<CustomerOrders />} />
            <Route path="/customer/profile" element={<CustomerProfile />} />
            <Route path="/customer/wishlist" element={<CustomerWishlist />} />
            <Route path="/customer/support" element={<CustomerSupport />} />
            <Route element={<RequireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/coupons" element={<AdminCoupons />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/support" element={<AdminSupport />} />
                <Route path="/admin/inventory" element={<AdminInventory />} />
                <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />
                <Route path="/admin/banners" element={<AdminBanners />} />
                <Route path="/admin/taxonomy" element={<AdminTaxonomy />} />
              </Route>
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/customer" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
