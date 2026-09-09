import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import AdminDashboard from './pages/admin/Dashboard'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CustomerHome from './pages/customer/Home'
import Cart from './pages/customer/Cart'
import ProductDetail from './pages/customer/ProductDetail'
import Checkout from './pages/customer/Checkout'
import { PublicOnly, RequireAdmin, RequireAuth } from './routes'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/customer" element={<CustomerHome />} />
            <Route path="/customer/products/:productId" element={<ProductDetail />} />
            <Route path="/customer/cart" element={<Cart />} />
            <Route path="/customer/checkout" element={<Checkout />} />
            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<AdminDashboard />} />
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
