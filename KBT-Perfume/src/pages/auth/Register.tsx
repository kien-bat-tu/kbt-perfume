import { FirebaseError } from 'firebase/app'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { ArrowRight, KeyRound, Mail, Sparkles, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase/auth'
import { db } from '../../firebase/firestore'

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
    <main className="auth-shell auth-shell-register">
      <section className="auth-intro">
        <div className="brand-mark"><Sparkles size={18} /> KBT Perfume</div>
        <div className="intro-copy">
          <p className="eyebrow">Begin your ritual</p>
          <h1>Your signature scent starts here.</h1>
          <p>Tạo tài khoản để lưu lại những mùi hương bạn yêu thích và theo dõi đơn hàng.</p>
        </div>
        <span className="intro-note">Small details. Lasting impressions.</span>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <p className="eyebrow">New here?</p>
          <h2>Tạo tài khoản</h2>
          <p className="auth-subtitle">Bắt đầu trải nghiệm KBT Perfume hôm nay.</p>

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

          <p className="switch-auth">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
        </div>
      </section>
    </main>
  )
}