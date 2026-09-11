import { Bell, LockKeyhole, LogOut, Sparkles } from 'lucide-react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const adminLinks = [
  { to: '/admin', label: 'Tổng quan', end: true },
  { to: '/admin/products', label: 'Sản phẩm' },
  { to: '/admin#orders', label: 'Đơn hàng' },
  { to: '/admin/users', label: 'Người dùng' },
  { to: '/admin/inventory', label: 'Kho' },
  { to: '/admin/coupons', label: 'Mã giảm giá' },
  { to: '/admin/support', label: 'Hoàn hàng' },
  { to: '/admin/payment-settings', label: 'Cài đặt' },
  { to: '/admin/reports', label: 'Báo cáo' },
  { to: '/customer', label: 'Cửa hàng' },
]

export default function AdminLayout() {
  const { profile, signOutUser } = useAuth()

  return (
    <div className="admin-shell">
      <div className="admin-topline"><span>FreeShip toàn quốc với đơn từ 1,5 triệu</span><span>Hotline: 1900 1234</span></div>
      <header className="admin-navbar">
        <Link className="admin-navbar-brand" to="/admin"><span><Sparkles size={15} /></span> KBT Perfume</Link>
        <nav className="admin-navbar-links" aria-label="Điều hướng Admin">
          {adminLinks.map((link) => <NavLink key={`${link.to}-${link.label}`} to={link.to} end={link.end}>{link.label}</NavLink>)}
        </nav>
        <div className="admin-navbar-account"><span className="admin-account-name">Quản trị <Bell size={14} /></span><span className="admin-account-pill"><LockKeyhole size={13} /> {profile?.role === 'admin' ? 'admin' : profile?.fullName || 'admin'}</span><button className="admin-logout" onClick={() => void signOutUser()} aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={14} /></button></div>
      </header>
      <div className="admin-shell-content"><Outlet /></div>
      <footer className="admin-footer"><div><strong><Sparkles size={15} /> KBT Perfume</strong><p>Thương hiệu nước hoa cao cấp dành cho mọi phong cách.</p></div><div><strong>LIÊN KẾT</strong><Link to="/admin">Tổng quan</Link><Link to="/admin/products">Sản phẩm</Link><Link to="/customer">Cửa hàng</Link></div><div><strong>HỖ TRỢ</strong><Link to="/admin/support">Hỗ trợ</Link><Link to="/admin/reports">Báo cáo</Link><Link to="/admin/payment-settings">Cài đặt</Link></div><div><strong>LIÊN HỆ</strong><span>☎ 1900 1234</span><span>✉ hello@kbtperfume.vn</span><span>⌖ 123 Nguyễn Huệ, Q1, TP.HCM</span></div><small>© 2026 KBT Perfume. Bảo lưu mọi quyền.</small></footer>
    </div>
  )
}
