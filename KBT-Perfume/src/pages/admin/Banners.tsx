import { Edit3, Image, PlusCircle, Save, Sparkles, Trash2, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createBanner, deleteBanner, getBanners, updateBanner } from '../../services/bannerService'
import type { Banner, BannerInput } from '../../types/banner'

const emptyForm: BannerInput = { title: '', subtitle: '', imageUrl: '', linkUrl: '/customer', isActive: true, order: 1 }

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [form, setForm] = useState<BannerInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadBanners = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try { setBanners(await getBanners()) } catch { setErrorMessage('Không thể tải banner.') } finally { setIsLoading(false) }
  }

  useEffect(() => { void loadBanners() }, [])

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setIsFormOpen(true); setSuccessMessage('') }
  const openEdit = (banner: Banner) => { setEditingId(banner.id); setForm({ title: banner.title, subtitle: banner.subtitle, imageUrl: banner.imageUrl, linkUrl: banner.linkUrl, isActive: banner.isActive, order: banner.order }); setIsFormOpen(true); setSuccessMessage('') }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    try {
      const input = { ...form, title: form.title.trim(), subtitle: form.subtitle.trim(), imageUrl: form.imageUrl.trim(), linkUrl: form.linkUrl.trim(), order: Number(form.order) }
      if (editingId) { await updateBanner(editingId, input); setBanners((current) => current.map((banner) => banner.id === editingId ? { ...banner, ...input } : banner)); setSuccessMessage('Banner đã được cập nhật.') } else { const id = await createBanner(input); setBanners((current) => [...current, { ...input, id, createdAt: new Date().toISOString() }]); setSuccessMessage('Banner đã được tạo.') }
      setIsFormOpen(false)
    } catch { setErrorMessage('Không thể lưu banner.') } finally { setIsSaving(false) }
  }

  const handleDelete = async (banner: Banner) => {
    if (!window.confirm(`Xóa banner “${banner.title}”?`)) return
    try { await deleteBanner(banner.id); setBanners((current) => current.filter((item) => item.id !== banner.id)); setSuccessMessage('Banner đã được xóa.') } catch { setErrorMessage('Không thể xóa banner.') }
  }

  return <main className="app-home"><header className="app-header"><strong><Sparkles size={17} /> KBT Perfume <span className="admin-badge">ADMIN</span></strong><Link className="ghost-button" to="/admin">Về dashboard</Link></header><section className="welcome-section"><p className="eyebrow">Admin workspace / Banners</p><h1>Quản lý banner.</h1><p>Cập nhật hình ảnh và nội dung nổi bật trên trang cửa hàng mà không cần sửa code.</p><div className="starter-actions"><button className="primary-button" onClick={openCreate}><PlusCircle size={18} /> Thêm banner</button></div></section><section className="admin-panel">{errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}{successMessage && <p className="success-inline">{successMessage}</p>}{isFormOpen && <form className="banner-admin-form" onSubmit={handleSubmit}><div className="product-form-heading"><div><p className="eyebrow">{editingId ? 'Edit banner' : 'New banner'}</p><h2>{editingId ? 'Cập nhật banner' : 'Tạo banner mới'}</h2></div><button type="button" className="icon-button" onClick={() => setIsFormOpen(false)} aria-label="Đóng biểu mẫu"><X size={17} /></button></div><div className="product-admin-grid"><label>Tiêu đề<input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></label><label>Thứ tự<input type="number" min="0" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: Number(event.target.value) }))} required /></label><label className="product-form-wide">Mô tả ngắn<input value={form.subtitle} onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))} required /></label><label className="product-form-wide">URL hình ảnh<input value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="https://..." required /></label><label>Đường dẫn nút<input value={form.linkUrl} onChange={(event) => setForm((current) => ({ ...current, linkUrl: event.target.value }))} placeholder="/customer" required /></label><label className="checkbox-label"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /> Hiển thị banner</label></div><div className="product-form-actions"><button className="primary-button" type="submit" disabled={isSaving}><Save size={17} /> {isSaving ? 'Đang lưu...' : 'Lưu banner'}</button></div></form>}{isLoading && <p className="empty-state">Đang tải banner...</p>}{!isLoading && banners.length === 0 && <div className="empty-state"><Image size={28} /><h3>Chưa có banner</h3><p>Thêm banner đầu tiên cho trang cửa hàng.</p></div>}{!isLoading && banners.length > 0 && <div className="banner-admin-list">{banners.map((banner) => <article className="banner-admin-item" key={banner.id}><div className="banner-admin-image">{banner.imageUrl ? <img src={banner.imageUrl} alt={banner.title} /> : <Image size={20} />}</div><div><p className="eyebrow">Thứ tự {banner.order} · {banner.isActive ? 'Đang hiển thị' : 'Đang tắt'}</p><h2>{banner.title}</h2><p>{banner.subtitle}</p></div><div className="admin-product-actions"><button className="icon-button" onClick={() => openEdit(banner)} aria-label={`Sửa ${banner.title}`} title="Sửa"><Edit3 size={16} /></button><button className="icon-button danger-icon" onClick={() => void handleDelete(banner)} aria-label={`Xóa ${banner.title}`} title="Xóa"><Trash2 size={16} /></button></div></article>)}</div>}</section></main>
}
