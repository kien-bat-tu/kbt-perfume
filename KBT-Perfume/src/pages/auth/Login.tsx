import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { ArrowRight, KeyRound, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase/auth'
import { getProfileForAuthUser } from '../../services/profileService'
import AuthFooter from '../../components/auth/AuthFooter'

function getLoginErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/invalid-credential') return 'Email hoặc mật khẩu chưa chính xác.'
    if (error.code === 'auth/too-many-requests') return 'Có quá nhiều lần thử. Vui lòng thử lại sau.'
    if (error.code === 'permission-denied') return 'Firebase đang chặn đọc hồ sơ. Hãy Publish lại Firestore Rules.'
  }

  return 'Không thể đăng nhập lúc này. Vui lòng thử lại.'
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminLogin = location.pathname === '/admin/login'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const profile = await getProfileForAuthUser(credential.user.uid, credential.user.email, credential.user.displayName)
      const role = profile.role

      if (isAdminLogin && role !== 'admin') {
        await signOut(auth)
        throw new Error('admin-only')
      }

      if (!isAdminLogin && role === 'admin') {
        navigate('/admin', { replace: true })
        return
      }

      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/customer', { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error && error.message === 'admin-only' ? 'Tài khoản này không có quyền quản trị.' : getLoginErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-choice-page">
      <div className="auth-promo-bar"><span>FreeShip toàn quốc với đơn từ 1,5 triệu</span><span>Hotline: 1900 1234</span></div>
      <header className="auth-choice-header"><Link className="auth-choice-brand" to="/login"><Sparkles size={17} /> KBT Perfume</Link><nav><Link to="/login">Trang chủ</Link><Link to="/login">Sản phẩm</Link><Link to="/login">Về chúng tôi</Link><Link to="/login">Thương hiệu</Link><Link to="/customer/ai-consultation">Tư vấn AI</Link></nav><div className="auth-choice-actions"><Link to="/login">Đăng nhập</Link><Link className="register-nav-link" to="/register">Đăng ký</Link></div></header>
      <section className="auth-choice-panel">
        <div className="auth-panel-inner">
          <p className="eyebrow">KBT Perfume account</p>
          <h2>Đăng nhập</h2>
          <p className="auth-subtitle">{isAdminLogin ? 'Khu vực dành riêng cho tài khoản quản trị duy nhất.' : 'Đăng nhập để mua sắm và quản lý đơn hàng.'}</p>
          <div className="auth-role-tabs" role="tablist" aria-label="Loại tài khoản">
            <Link className={!isAdminLogin ? 'active' : ''} to="/login"><UserRound size={15} /> Khách hàng</Link>
            <Link className={isAdminLogin ? 'active admin' : 'admin'} to="/admin/login"><ShieldCheck size={15} /> Quản trị viên</Link>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Tên người dùng
              <span className="input-wrap"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></span>
            </label>
            <label className="remember-option"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Ghi nhớ tôi</label>
            <label>
              Mật khẩu
              <span className="input-wrap"><KeyRound size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" autoComplete="current-password" minLength={6} required /></span>
            </label>
            {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang đăng nhập...' : isAdminLogin ? 'Vào trang quản trị' : 'Đăng nhập'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

          {!isAdminLogin && <p className="switch-auth">Chưa có tài khoản khách hàng? <Link to="/register">Đăng ký ngay</Link></p>}
          {isAdminLogin && <p className="auth-admin-note"><ShieldCheck size={14} /> Admin chỉ đăng nhập, không đăng ký trên website.</p>}
        </div>
      </section>
      <AuthFooter />
    </main>
  )
}