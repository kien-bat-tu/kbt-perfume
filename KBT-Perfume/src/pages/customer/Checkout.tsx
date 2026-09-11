import { FirebaseError } from 'firebase/app'
import { ArrowLeft, PackageCheck } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cancelOrder, createOrder } from '../../services/orderService'
import { subscribeBankAccountSettings } from '../../services/paymentService'
import { getEffectiveProductPrice, useCartStore } from '../../store/cartStore'
import type { Order } from '../../types/order'
import type { BankAccountSettings, PaymentMethod } from '../../types/payment'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

function buildVietQrPayload({
  bankName,
  accountNumber,
  accountHolder,
  amount,
  note,
}: {
  bankName: string
  accountNumber: string
  accountHolder: string
  amount: number
  note: string
}) {
  return [
    'VietQR',
    bankName,
    accountNumber,
    accountHolder,
    String(amount),
    note,
  ].join('|')
}

function getOrderErrorMessage(error: unknown) {
  if (error instanceof FirebaseError && error.code === 'permission-denied') return 'Firestore đang chặn tạo đơn. Hãy kiểm tra Rules của collection orders.'
  return 'Không thể tạo đơn hàng lúc này. Vui lòng thử lại.'
}

export default function Checkout() {
  const { user, profile } = useAuth()
  const { items, clearCart } = useCartStore()
  const [fullName, setFullName] = useState(profile?.fullName ?? '')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod')
  const [bankSettings, setBankSettings] = useState<BankAccountSettings | null>(null)
  const [selectedQr, setSelectedQr] = useState('vcb')
  const [couponCode, setCouponCode] = useState('')
  const [specialNote, setSpecialNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const total = items.reduce((sum, item) => sum + getEffectiveProductPrice(item) * item.quantity, 0)
  const bankTransferEnabled = bankSettings?.bankTransferEnabled ?? false
  const selectedBankName = bankSettings?.bankName ?? ''

  useEffect(() => {
    const unsubscribe = subscribeBankAccountSettings((settings) => {
      setBankSettings(settings)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!bankTransferEnabled && paymentMethod === 'bank_transfer') {
      setPaymentMethod('cod')
    }
  }, [bankTransferEnabled, paymentMethod])

  useEffect(() => {
    if (!createdOrder || !bankSettings?.accountNumber || !bankSettings?.accountHolder || !selectedBankName) return

    const amount = createdOrder.total
    const note = ((bankSettings?.transferNote ?? 'KBT Perfume - [Mã đơn hàng]').replace('[Mã đơn hàng]', createdOrder.id.slice(0, 8).toUpperCase()))
    const payload = buildVietQrPayload({
      bankName: selectedBankName,
      accountNumber: bankSettings.accountNumber,
      accountHolder: bankSettings.accountHolder,
      amount,
      note,
    })

    QRCode.toDataURL(payload, {
      width: 310,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0b0b0d',
        light: '#ffffff',
      },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(''))
  }, [bankSettings, createdOrder, selectedBankName])

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
        paymentMethod,
      })

      const nextOrder: Order = {
        id: orderId,
        userId: user.uid,
        items,
        shipping: { fullName: fullName.trim(), phone: phone.trim(), address: address.trim(), note: note.trim() },
        total,
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }

      clearCart()
      setCreatedOrder(nextOrder)
      setShowQrModal(paymentMethod === 'bank_transfer')
    } catch (error) {
      setErrorMessage(error instanceof Error && error.message.startsWith('insufficient-stock:') ? `Sản phẩm không đủ tồn kho: ${error.message.replace('insufficient-stock:', '')}.` : getOrderErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!createdOrder) return
    try {
      await cancelOrder(createdOrder.id)
      setCreatedOrder({ ...createdOrder, status: 'cancelled' })
    } catch {
      setErrorMessage('Không thể hủy đơn hàng. Vui lòng thử lại.')
    }
  }

  const bankName = selectedBankName || 'Chưa cấu hình'
  const accountNumber = bankSettings?.accountNumber || 'Chưa cấu hình'
  const accountHolder = bankSettings?.accountHolder || 'Chưa cấu hình'
  const bankTransferNote = createdOrder
    ? ((bankSettings?.transferNote ?? 'KBT Perfume - [Mã đơn hàng]').replace('[Mã đơn hàng]', createdOrder.id.slice(0, 8).toUpperCase()))
    : 'KBT PERFUME'

  if (createdOrder) {
    return (
      <main className="orders-page">
        <header className="shop-header">
          <Link className="shop-brand" to="/customer"><PackageCheck size={18} /> KBT Perfume</Link>
          <Link className="ghost-button" to="/customer"><ArrowLeft size={16} /> Quay lại cửa hàng</Link>
        </header>

        {showQrModal && createdOrder.paymentMethod === 'bank_transfer' && (
          <div className="qr-modal-overlay">
            <div className="qr-payment-sheet">
              <div className="qr-payment-header">
                <h2>THANH TOÁN CHUYỂN KHOẢN</h2>
                <span className="qr-status-badge">Đang chờ</span>
                <button type="button" className="qr-close-button" onClick={() => setShowQrModal(false)}>Đóng</button>
              </div>

              <p className="qr-subtitle">Quét mã QR để hoàn tất thanh toán</p>

              <div className="qr-payment-body">
                <div className="qr-code-panel">
                  <div className="qr-brand-row">
                    <span className="vietqr-word">VIETQR</span>
                  </div>

                  {qrDataUrl ? (
                    <img className="generated-qr-image" src={qrDataUrl} alt="VietQR thanh toán" />
                  ) : (
                    <div className="qr-grid-placeholder" aria-label="Mã QR thanh toán" />
                  )}

                  <div className="qr-bank-row">
                    <span className="napas-badge">napas 24</span>
                    <span className="vietbank-tag">{bankName}</span>
                  </div>
                </div>

                <div className="qr-info-panel">
                  <div className="qr-info-row">
                    <span>Ngân hàng</span>
                    <strong>{bankName}</strong>
                  </div>
                  <div className="qr-info-row">
                    <span>Số tài khoản</span>
                    <strong>{accountNumber}</strong>
                  </div>
                  <div className="qr-info-row">
                    <span>Chủ tài khoản</span>
                    <strong>{accountHolder}</strong>
                  </div>
                  <div className="qr-info-row highlight-row">
                    <span>Số tiền cần thanh toán</span>
                    <strong>{formatPrice(createdOrder.total)}</strong>
                  </div>
                  <div className="qr-info-row">
                    <span>Nội dung chuyển khoản</span>
                    <strong>{bankTransferNote}</strong>
                  </div>
                </div>
              </div>

              <div className="qr-confirm-box">
                Sau khi chuyển khoản thành công, bấm “Tôi đã chuyển khoản”. Cửa hàng sẽ kiểm tra giao dịch thực tế trước khi xác nhận đơn.
              </div>

              <div className="qr-footer-actions">
                <button type="button" className="primary-button green-button" onClick={() => setShowQrModal(false)}>Tôi đã chuyển khoản</button>
                <button type="button" className="secondary-button" onClick={() => setShowQrModal(false)}>Đóng</button>
              </div>
            </div>
          </div>
        )}

        <section className="orders-content">
          <h1>Đơn hàng {createdOrder.id.slice(0, 8).toUpperCase()}</h1>

          <div className="orders-detail-layout">
            <div className="orders-detail-main">
              <div className="detail-card">
                <h2>Trạng thái đơn hàng</h2>
                <div className="order-status-row">
                  <span className={createdOrder.status === 'pending' ? 'status-pill active' : 'status-pill'}>Chờ xác nhận</span>
                  <span className={createdOrder.status === 'confirmed' ? 'status-pill active' : 'status-pill'}>Thành toán</span>
                  <span className={createdOrder.status === 'shipping' ? 'status-pill active' : 'status-pill'}>Phương thức</span>
                </div>
              </div>

              <div className="detail-card">
                <h2>Chi tiết sản phẩm</h2>
                <div className="order-items-table">
                  <div className="order-items-head">
                    <span>Sản phẩm</span>
                    <span>Số lượng</span>
                    <span>Giá</span>
                    <span>Tổng</span>
                  </div>
                  {createdOrder.items.map((item) => {
                    const effectiveUnitPrice = getEffectiveProductPrice(item)
                    return (
                      <div className="order-items-row" key={item.id}>
                        <span>{item.name}</span>
                        <span>{item.quantity}</span>
                        <span>{formatPrice(effectiveUnitPrice)}</span>
                        <span>{formatPrice(effectiveUnitPrice * item.quantity)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="detail-card">
                <h2>Thông tin giao hàng</h2>
                <div className="customer-order-info">
                  <p><strong>Kiến:</strong> {createdOrder.shipping.address}</p>
                  <p><strong>Họ và tên:</strong> {createdOrder.shipping.fullName}</p>
                  <p><strong>Số điện thoại:</strong> {createdOrder.shipping.phone}</p>
                  <p><strong>Email:</strong> {user?.email || 'khachhang@gmail.com'}</p>
                </div>
              </div>
            </div>

            <aside className="checkout-summary order-summary-card">
              <h2>Tóm tắt đơn hàng</h2>
              <div className="summary-line">
                <span>Tổng tiền</span>
                <strong>{formatPrice(createdOrder.total)}</strong>
              </div>
              <div className="summary-line">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="summary-total">
                <span>Tổng cộng</span>
                <strong>{formatPrice(createdOrder.total)}</strong>
              </div>

              <div className="cancel-order-box">
                <button className="primary-button cancel-button" type="button" onClick={async () => { await handleCancelOrder(); setShowQrModal(false) }}>
                  Hủy đơn hàng
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>
    )
  }

  if (items.length === 0) return <main className="loading-screen"><PackageCheck size={22} /> Giỏ hàng đang trống. <Link to="/customer">Quay lại mua sắm</Link></main>

  return (
    <main className="checkout-page">
      <header className="shop-header">
        <Link className="shop-brand" to="/customer"><PackageCheck size={18} /> KBT Perfume</Link>
        <Link className="ghost-button" to="/customer/cart"><ArrowLeft size={16} /> Quay lại giỏ hàng</Link>
      </header>

      <section className="checkout-content">
        <h1>Thanh toán đơn hàng</h1>
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="checkout-panel">
              <h2>Thông tin giao hàng</h2>

              <div className="checkout-grid two-col">
                <label>
                  Họ và tên
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} required placeholder="Nguyễn Văn A" />
                </label>
                <label>
                  Email
                  <input value={user?.email || ''} readOnly placeholder="kien1234@gmail.com" />
                </label>
              </div>

              <div className="checkout-grid two-col">
                <label>
                  Số điện thoại
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} required inputMode="tel" placeholder="0123456789" />
                </label>
                <label>
                  Mã bưu điện
                  <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="90415" />
                </label>
              </div>

              <label>
                Địa chỉ giao hàng
                <textarea value={address} onChange={(event) => setAddress(event.target.value)} required placeholder="Số 365/3 khu vực 6" />
              </label>

              <div className="checkout-grid two-col">
                <label>
                  Thành phố
                  <input value="An Giang" readOnly />
                </label>
                <label>
                  Quốc gia
                  <input value="Vietnam" readOnly />
                </label>
              </div>
            </div>

            <div className="checkout-panel">
              <h2>Mã giảm giá</h2>
              <input
                className="coupon-input"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Nhập mã giảm giá nếu có"
              />
            </div>

            <div className="checkout-panel">
              <h2>Phương Thức Thanh Toán</h2>

              <select
                className="payment-select"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
              >
                <option value="cod">Thanh toán khi nhận hàng</option>
                <option value="vnpay">VNPay</option>
                <option value="momo">MoMo</option>
                <option value="bank_transfer">Chuyển khoản ngân hàng (QR)</option>
              </select>

              {paymentMethod === 'bank_transfer' && (
                <div className="qr-payment-box">
                  {!bankSettings ? (
                    <div className="bank-transfer-info">
                      <strong>Chưa có tài khoản ngân hàng được cài đặt</strong>
                      <small>Vui lòng cập nhật thông tin tài khoản nhận thanh toán ở trang quản trị.</small>
                    </div>
                  ) : (
                    <>
                      <label className="qr-select-wrap">
                        Chọn mã QR
                        <select value={selectedQr} onChange={(event) => setSelectedQr(event.target.value)}>
                          <option value="vcb">{bankSettings.bankName}</option>
                        </select>
                      </label>

                      <div className="qr-preview">
                        {Array.from({ length: 64 }, (_, index) => {
                          const row = Math.floor(index / 8)
                          const col = index % 8
                          const active = (row + col + index % 3) % 2 === 0 || (row > 1 && row < 6 && col > 1 && col < 6)
                          return <span key={`${row}-${col}`} className={active ? 'qr-cell active' : 'qr-cell'} />
                        })}
                      </div>

                      <div className="bank-transfer-info">
                        <strong>{bankSettings.bankName}</strong>
                        <span>Số tài khoản: {bankSettings.accountNumber}</span>
                        <span>Chủ tài khoản: {bankSettings.accountHolder}</span>
                        <small>Nội dung: {bankSettings.transferNote || 'KBT Perfume - [Mã đơn hàng]'}</small>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="checkout-panel">
              <h2>Ghi Chú Thêm</h2>
              <textarea
                className="note-textarea"
                value={specialNote}
                onChange={(event) => setSpecialNote(event.target.value)}
                placeholder="Ghi chú cho đơn hàng..."
              />
            </div>

            {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
            <button className="primary-button green-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo đơn...' : 'Thanh toán'}
            </button>
          </form>

          <aside className="checkout-summary">
            <h2>Tóm tắt đơn hàng</h2>
            {items.map((item) => (
              <div className="checkout-item" key={item.id}>
                <span>{item.name} <small>x{item.quantity}</small></span>
                <strong>{formatPrice(getEffectiveProductPrice(item) * item.quantity)}</strong>
              </div>
            ))}

            <div className="checkout-total">
              <span>Tổng tiền</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div className="checkout-total checkout-total-muted">
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>
            <div className="checkout-total checkout-grand-total">
              <span>Tổng cộng</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
