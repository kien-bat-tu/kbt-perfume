import { CheckCircle2, Gift, PlusCircle, XCircle } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createCoupon, getAllCoupons, updateCouponStatus } from '../../services/couponService'
import type { Coupon, CouponStatus, CreateCouponInput, CouponType } from '../../types/coupon'

const typeOptions: CouponType[] = ['percentage', 'fixed']
const statusOptions: CouponStatus[] = ['active', 'inactive']

function formatPercent(value: number) {
  return `${value}%`
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export default function AdminCoupons() {
  const { signOutUser } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [form, setForm] = useState<CreateCouponInput>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 10,
    minOrder: 0,
    maxDiscount: 0,
    status: 'active',
    expiresAt: '',
  })

  const loadCoupons = async () => {
    setIsLoading(true)
    try {
      const loadedCoupons = await getAllCoupons()
      setCoupons(loadedCoupons)
    } catch {
      setErrorMessage('Không thể tải danh sách coupon.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCoupons()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await createCoupon({
        ...form,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim(),
      })
      setSuccessMessage('Mã giảm giá đã được tạo.')
      setForm({
        code: '',
        name: '',
        description: '',
        type: 'percentage',
        value: 10,
        minOrder: 0,
        maxDiscount: 0,
        status: 'active',
        expiresAt: '',
      })
      await loadCoupons()
    } catch {
      setErrorMessage('Không thể tạo coupon. Vui lòng thử lại.')
    }
  }

  const handleStatusChange = async (couponId: string, nextStatus: CouponStatus) => {
    try {
      await updateCouponStatus(couponId, nextStatus)
      setCoupons((currentCoupons) => currentCoupons.map((coupon) => coupon.id === couponId ? { ...coupon, status: nextStatus } : coupon))
    } catch {
      setErrorMessage('Không thể cập nhật trạng thái coupon.')
    }
  }

  return (
    <main className="app-home">
      <header className="app-header">
        <strong><Gift size={17} /> KBT Perfume <span className="admin-badge">ADMIN</span></strong>
        <button className="ghost-button" onClick={signOutUser}>Đăng xuất</button>
      </header>

      <section className="admin-panel">
        <div className="promo-layout">
          <div className="promo-form-card">
            <p className="eyebrow">Promotions</p>
            <h1>Tạo mã giảm giá</h1>

            <form className="coupon-form" onSubmit={handleSubmit}>
              <label>
                Mã coupon
                <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} placeholder="SAVE10" required />
              </label>

              <label>
                Tên chương trình
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Khuyến mãi tháng 9" required />
              </label>

              <label>
                Mô tả
                <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Giảm 10% cho đơn từ 500.000đ" required />
              </label>

              <div className="coupon-grid">
                <label>
                  Loại
                  <select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as CouponType }))}>
                    {typeOptions.map((type) => <option value={type} key={type}>{type === 'percentage' ? 'Phần trăm' : 'Cố định'}</option>)}
                  </select>
                </label>

                <label>
                  Giá trị
                  <input type="number" min={0} value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: Number(event.target.value) }))} required />
                </label>
              </div>

              <div className="coupon-grid">
                <label>
                  Đơn tối thiểu
                  <input type="number" min={0} value={form.minOrder} onChange={(event) => setForm((current) => ({ ...current, minOrder: Number(event.target.value) }))} required />
                </label>

                <label>
                  Giảm tối đa
                  <input type="number" min={0} value={form.maxDiscount ?? 0} onChange={(event) => setForm((current) => ({ ...current, maxDiscount: Number(event.target.value) }))} />
                </label>
              </div>

              <div className="coupon-grid">
                <label>
                  Trạng thái
                  <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as CouponStatus }))}>
                    {statusOptions.map((status) => <option value={status} key={status}>{status === 'active' ? 'Kích hoạt' : 'Tắt'}</option>)}
                  </select>
                </label>

                <label>
                  Hết hạn
                  <input type="date" value={form.expiresAt ?? ''} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))} />
                </label>
              </div>

              {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
              {successMessage && <p className="success-inline"><CheckCircle2 size={15} /> {successMessage}</p>}

              <button className="primary-button" type="submit"><PlusCircle size={18} /> Tạo mã</button>
            </form>
          </div>

          <div className="promo-list-card">
            <p className="eyebrow">Available codes</p>
            <h2>Danh sách coupon</h2>

            {isLoading && <p className="empty-state">Đang tải coupon...</p>}

            {!isLoading && coupons.length === 0 && (
              <div className="empty-state">
                <h3>Chưa có mã giảm giá</h3>
              </div>
            )}

            <div className="coupon-list">
              {coupons.map((coupon) => (
                <article className="coupon-card" key={coupon.id}>
                  <div className="coupon-card-head">
                    <div>
                      <p className="eyebrow">{coupon.code}</p>
                      <h3>{coupon.name}</h3>
                    </div>
                    <span className={`status-badge status-${coupon.status}`}>
                      {coupon.status === 'active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {coupon.status === 'active' ? 'Đang hoạt động' : 'Tắt'}
                    </span>
                  </div>

                  <p>{coupon.description}</p>
                  <div className="coupon-detail-row">
                    <span>Giá trị</span>
                    <strong>{coupon.type === 'percentage' ? formatPercent(coupon.value) : formatPrice(coupon.value)}</strong>
                  </div>
                  <div className="coupon-detail-row">
                    <span>Đơn tối thiểu</span>
                    <strong>{formatPrice(coupon.minOrder)}</strong>
                  </div>
                  {coupon.maxDiscount ? (
                    <div className="coupon-detail-row">
                      <span>Giảm tối đa</span>
                      <strong>{formatPrice(coupon.maxDiscount)}</strong>
                    </div>
                  ) : null}

                  <select value={coupon.status} onChange={(event) => void handleStatusChange(coupon.id, event.target.value as CouponStatus)}>
                    {statusOptions.map((status) => <option value={status} key={status}>{status === 'active' ? 'Kích hoạt' : 'Tắt'}</option>)}
                  </select>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
