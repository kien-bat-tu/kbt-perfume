import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function LoadingScreen() {
  return <main className="loading-screen"><span className="loading-dot" /> Đang kết nối tài khoản...</main>
}

export function PublicOnly() {
  const { profile, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (profile) return <Navigate to={profile.role === 'admin' ? '/admin' : '/customer'} replace />

  return <Outlet />
}

export function RequireAuth() {
  const { profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!profile) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <Outlet />
}

export function RequireAdmin() {
  const { profile } = useAuth()

  if (profile?.role !== 'admin') return <Navigate to="/customer" replace />
  return <Outlet />
}