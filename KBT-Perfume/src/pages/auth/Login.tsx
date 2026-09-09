import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { ArrowRight, KeyRound, Mail, Sparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase/auth'

function getLoginErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/invalid-credential') return 'Email hoặc mật khẩu chưa chính xác.'
    if (error.code === 'auth/too-many-requests') return 'Có quá nhiều lần thử. Vui lòng thử lại sau.'
  }

  return 'Không thể đăng nhập lúc này. Vui lòng thử lại.'
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/customer', { replace: true })
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-intro">
        <div className="brand-mark"><Sparkles size={18} /> KBT Perfume</div>
        <div className="intro-copy">
          <p className="eyebrow">A scent for every story</p>
          <h1>Find the fragrance that feels like you.</h1>
          <p>Khám phá thế giới hương thơm được tuyển chọn riêng cho phong cách của bạn.</p>
        </div>
        <span className="intro-note">Curated in Vietnam · Est. 2024</span>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <p className="eyebrow">Welcome back</p>
          <h2>Đăng nhập</h2>
          <p className="auth-subtitle">Đăng nhập để tiếp tục hành trình hương thơm của bạn.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Email
              <span className="input-wrap"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></span>
            </label>
            <label>
              Mật khẩu
              <span className="input-wrap"><KeyRound size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" autoComplete="current-password" minLength={6} required /></span>
            </label>
            {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="switch-auth">Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link></p>
        </div>
      </section>
    </main>
  )
}