import { FirebaseError } from 'firebase/app'
import { ArrowLeft, CheckCircle2, CreditCard, MapPin, PackageCheck, Phone, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { createOrder } from '../../services/orderService'
import { useCartStore } from '../../store/cartStore'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

function getOrderErrorMessage(error: unknown) {
  if (error instanceof FirebaseError && error.code === 'permission-denied') return 'Firestore đang chặn tạo đơn. Hãy kiểm tra Rules của collection orders.'
  return 'Không thể tạo đơn hàng lúc này. Vui lòng thử lại.'
}

export default function Checkout() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { items, clearCart } = useCartStore()
  const [fullName, setFullName] = useState(profile?.fullName ?? '')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [createdOrderId, setCreatedOrderId] = useState('')
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || items.length === 0) return
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const orderId = await createOrder({
        userId: user.uid,
        items,
        shipping: { fullName: fullName.trim(), phone: phone.trim(), address: address.trim(), note: note.trim() },
        total,
      })
      clearCart()
      setCreatedOrderId(orderId)
    } catch (error) {
      setErrorMessage(getOrderErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (createdOrderId) {
    return <main className="success-page"><CheckCircle2 size={46} /><p className="eyebrow">Order confirmed</p><h1>Đặt hàng thành công.</h1><p>Mã đơn hàng của bạn là <strong>{createdOrderId}</strong>.</p><button className="primary-button" onClick={() => navigate('/customer')}>Tiếp tục mua sắm</button></main>
  }

  if (items.length === 0) {
    return <main className="loading-screen"><PackageCheck size={22} /> Giỏ hàng đang trống. <Link to="/customer">Quay lại mua sắm</Link></main>
  }

  return (
    <main className="checkout-page"><header className="shop-header"><Link className="shop-brand" to="/customer"><PackageCheck size={18} /> KBT Perfume</Link><Link className="ghost-button" to="/customer/cart"><ArrowLeft size={16} /> Quay lại giỏ hàng</Link></header><section className="checkout-content"><p className="eyebrow">Almost yours</p><h1>Thanh toán</h1><div className="checkout-layout"><form className="checkout-form" onSubmit={handleSubmit}><h2>Thông tin giao hàng</h2><label>Họ và tên<span className="input-wrap"><UserRound size={17} /><input value={fullName} onChange={(event) => setFullName(event.target.value)} required placeholder="Nguyễn Văn A" /></span></label><label>Số điện thoại<span className="input-wrap"><Phone size={17} /><input value={phone} onChange={(event) => setPhone(event.target.value)} required inputMode="tel" placeholder="0901 234 567" /></span></label><label>Địa chỉ nhận hàng<span className="input-wrap textarea-wrap"><MapPin size={17} /><textarea value={address} onChange={(event) => setAddress(event.target.value)} required placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố" /></span></label><label>Ghi chú <span className="optional-label">(không bắt buộc)</span><textarea className="plain-textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Giao hàng giờ hành chính..." /></label>{errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}<div className="payment-choice"><CreditCard size={18} /><span><strong>Thanh toán khi nhận hàng</strong><small>COD · Bạn thanh toán khi nhận được sản phẩm</small></span></div><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Đang tạo đơn...' : 'Xác nhận đặt hàng'}</button></form><aside className="checkout-summary"><p className="eyebrow">Your order</p><h2>Tóm tắt đơn hàng</h2>{items.map((item) => <div className="checkout-item" key={item.id}><span>{item.name} × {item.quantity}</span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}<div className="summary-total"><span>Tổng cộng</span><strong>{formatPrice(total)}</strong></div></aside></div></section></main>
  )
}
