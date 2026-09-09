import { LayoutDashboard, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function AdminDashboard() {
  const { profile, signOutUser } = useAuth()

  return (
    <main className="app-home"><header className="app-header"><strong><Sparkles size={17} /> KBT Perfume <span className="admin-badge">ADMIN</span></strong><button className="ghost-button" onClick={signOutUser}><LogOut size={16} /> Đăng xuất</button></header><section className="welcome-section"><p className="eyebrow">Admin workspace</p><h1>Xin chào, {profile?.fullName || 'quản trị viên'}.</h1><p>Dashboard quản lý sản phẩm, đơn hàng và khách hàng sẽ bắt đầu từ đây.</p><div className="starter-actions"><button className="primary-button"><LayoutDashboard size={18} /> Mở dashboard</button></div></section></main>
  )
}