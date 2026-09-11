import { FirebaseError } from 'firebase/app'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { ArrowRight, KeyRound, Mail, Sparkles, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase/auth'
import { db } from '../../firebase/firestore'
import AuthFooter from '../../components/auth/AuthFooter'

function getRegisterErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/email-already-in-use') return 'Email này đã được đăng ký.'
    if (error.code === 'auth/weak-password') return 'Mật khẩu cần tối thiểu 6 ký tự.'
    if (error.code === 'auth/operation-not-allowed') return 'Firebase chưa bật Email/Password. Hãy bật tại Authentication > Sign-in method.'
    if (error.code === 'auth/invalid-api-key' || error.code.startsWith('auth/api-key-not-valid')) return 'Firebase API key không hợp lệ. Hãy copy lại Web API Key trong Project settings của Firebase.'
    if (error.code === 'permission-denied') return 'Firestore đang chặn ghi dữ liệu. Hãy kiểm tra và Publish Firestore Rules.'
    if (error.code === 'unavailable') return 'Không thể kết nối Firestore. Hãy kiểm tra kết nối mạng và database.'
  }

  if (error instanceof FirebaseError) return `Firebase báo lỗi (${error.code}). Vui lòng kiểm tra cấu hình Authentication.`
  return 'Không thể tạo tài khoản lúc này. Vui lòng thử lại.'
}

export default function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(credential.user, { displayName: fullName.trim() })
      await setDoc(doc(db, 'users', credential.user.uid), {
        uid: credential.user.uid,
        email: credential.user.email,
        fullName: fullName.trim(),
        role: 'customer',
        createdAt: new Date().toISOString(),
      })
      navigate('/customer', { replace: true })
    } catch (error) {
      setErrorMessage(getRegisterErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-choice-page">
      <div className="auth-promo-bar"><span>FreeShip toàn quốc với đơn từ 1,5 triệu</span><span>Hotline: 1900 1234</span></div>
      <header className="auth-choice-header"><Link className="auth-choice-brand" to="/login"><Sparkles size={17} /> KBT Perfume</Link><nav><Link to="/login">Trang chủ</Link><Link to="/login">Sản phẩm</Link><Link to="/login">Về chúng tôi</Link><Link to="/login">Thương hiệu</Link><Link to="/customer/ai-consultation">Tư vấn AI</Link></nav><div className="auth-choice-actions"><Link to="/login">Đăng nhập</Link><Link className="register-nav-link" to="/register">Đăng ký</Link></div></header>
      <section className="auth-choice-panel">
        <div className="auth-panel-inner register-choice-inner">
          <p className="eyebrow">KBT Perfume account</p>
          <h2>Tạo tài khoản khách hàng</h2>
          <p className="auth-subtitle">Đăng ký để mua sắm, theo dõi đơn hàng và lưu lại những mùi hương yêu thích.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Họ và tên
              <span className="input-wrap"><UserRound size={17} /><input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nguyễn Văn A" autoComplete="name" required /></span>
            </label>
            <label>
              Email
              <span className="input-wrap"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></span>
            </label>
            <label>
              Mật khẩu
              <span className="input-wrap"><KeyRound size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tối thiểu 6 ký tự" autoComplete="new-password" minLength={6} required /></span>
            </label>
            {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="auth-admin-note">Tài khoản quản trị được tạo riêng trong Firebase.</p>
          <p className="switch-auth">Đã có tài khoản? <Link to="/login">Đăng nhập khách hàng</Link></p>
        </div>
      </section>
      <AuthFooter />
    </main>
  )
}