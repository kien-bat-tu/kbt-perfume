import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export default function AuthFooter() {
  return <footer className="auth-choice-footer"><div className="auth-footer-grid"><div><strong><Sparkles size={15} /> KBT Perfume</strong><p>Thương hiệu nước hoa cao cấp dành cho mọi phong cách.</p></div><div><strong>LIÊN KẾT</strong><Link to="/login">Trang chủ</Link><Link to="/login">Sản phẩm</Link><Link to="/login">Về chúng tôi</Link></div><div><strong>HỖ TRỢ</strong><Link to="/login">Liên hệ</Link><Link to="/customer/ai-consultation">Tư vấn AI</Link><Link to="/login">Đăng nhập</Link></div><div><strong>LIÊN HỆ</strong><span>☎ 1900 1234</span><span>✉ hello@kbtperfume.vn</span><span>⌖ 123 Nguyễn Huệ, Q1, TP.HCM</span></div></div><small>© 2026 KBT Perfume. Bảo lưu mọi quyền.</small></footer>
}
