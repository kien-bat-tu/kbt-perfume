import { CheckCircle2, Mail, MapPin, Phone, Save, Sparkles, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase/firestore'
import { useAuth } from '../../hooks/useAuth'

export default function CustomerProfile() {
  const { user, profile } = useAuth()
  const [fullName, setFullName] = useState(profile?.fullName ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [address, setAddress] = useState(profile?.address ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '')
      setPhone(profile.phone ?? '')
      setAddress(profile.address ?? '')
    }
  }, [profile])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user || !profile) return

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await updateProfile(user, { displayName: fullName.trim() })
      await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        updatedAt: new Date().toISOString(),
      }, { merge: true })
      setSuccessMessage('Thông tin tài khoản đã được cập nhật.')
    } catch {
      setErrorMessage('Không thể lưu thông tin. Vui lòng thử lại sau.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="profile-page">
      <header className="shop-header">
        <Link className="shop-brand" to="/customer"><Sparkles size={18} /> KBT Perfume</Link>
        <Link className="ghost-button" to="/customer">Tiếp tục mua sắm</Link>
      </header>

      <section className="profile-content">
        <p className="eyebrow">Account</p>
        <h1>Thông tin cá nhân</h1>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Hồ sơ</h2>
            </div>

            <label>
              Họ và tên
              <span className="input-wrap"><UserRound size={17} /><input value={fullName} onChange={(event) => setFullName(event.target.value)} required /></span>
            </label>

            <label>
              Email
              <span className="input-wrap"><Mail size={17} /><input value={profile?.email ?? user?.email ?? ''} disabled /></span>
            </label>

            <label>
              Số điện thoại
              <span className="input-wrap"><Phone size={17} /><input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0901 234 567" /></span>
            </label>
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Địa chỉ nhận hàng</h2>
            </div>

            <label>
              Địa chỉ mặc định
              <span className="input-wrap textarea-wrap"><MapPin size={17} /><textarea value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố" /></span>
            </label>
          </div>

          {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
          {successMessage && <p className="success-inline"><CheckCircle2 size={16} /> {successMessage}</p>}

          <button className="primary-button" type="submit" disabled={isSaving}>
            <Save size={18} /> {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </form>
      </section>
    </main>
  )
}
