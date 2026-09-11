import { Edit3, FolderTree, PlusCircle, Save, Sparkles, Tag, Trash2, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createTaxonomyItem, deleteTaxonomyItem, updateTaxonomyItem, type TaxonomyCollection } from '../../services/adminTaxonomyService'
import { getBrands, getCategories } from '../../services/taxonomyService'
import type { TaxonomyItem } from '../../types/taxonomy'

const collectionLabels: Record<TaxonomyCollection, string> = { brands: 'Thương hiệu', categories: 'Danh mục' }
const emptyItem: Omit<TaxonomyItem, 'id'> = { name: '', slug: '', status: 'active' }

export default function AdminTaxonomy() {
  const [activeCollection, setActiveCollection] = useState<TaxonomyCollection>('brands')
  const [items, setItems] = useState<Record<TaxonomyCollection, TaxonomyItem[]>>({ brands: [], categories: [] })
  const [form, setForm] = useState(emptyItem)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadItems = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const [brands, categories] = await Promise.all([getBrands(), getCategories()])
      setItems({ brands, categories })
    } catch {
      setErrorMessage('Không thể tải thương hiệu và danh mục.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void loadItems() }, [])

  const openCreate = () => { setEditingId(null); setForm(emptyItem); setIsFormOpen(true); setSuccessMessage('') }
  const openEdit = (item: TaxonomyItem) => { setEditingId(item.id); setForm({ name: item.name, slug: item.slug ?? '', status: item.status ?? 'active' }); setIsFormOpen(true); setSuccessMessage('') }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    try {
      const input = { name: form.name.trim(), slug: (form.slug || form.name).trim().toLowerCase().replace(/\s+/g, '-'), status: form.status ?? 'active' }
      if (editingId) { await updateTaxonomyItem(activeCollection, editingId, input); setItems((current) => ({ ...current, [activeCollection]: current[activeCollection].map((item) => item.id === editingId ? { ...item, ...input } : item) })); setSuccessMessage(`${collectionLabels[activeCollection]} đã được cập nhật.`) } else { const id = await createTaxonomyItem(activeCollection, input); setItems((current) => ({ ...current, [activeCollection]: [...current[activeCollection], { id, ...input }] })); setSuccessMessage(`${collectionLabels[activeCollection]} đã được thêm.`) }
      setIsFormOpen(false)
    } catch { setErrorMessage(`Không thể lưu ${collectionLabels[activeCollection].toLowerCase()}.`) } finally { setIsSaving(false) }
  }

  const handleDelete = async (item: TaxonomyItem) => {
    if (!window.confirm(`Xóa ${collectionLabels[activeCollection].toLowerCase()} “${item.name}”?`)) return
    try { await deleteTaxonomyItem(activeCollection, item.id); setItems((current) => ({ ...current, [activeCollection]: current[activeCollection].filter((entry) => entry.id !== item.id) })); setSuccessMessage('Đã xóa thành công.') } catch { setErrorMessage('Không thể xóa dữ liệu.') }
  }

  const currentItems = items[activeCollection]
  return <main className="app-home"><header className="app-header"><strong><Sparkles size={17} /> KBT Perfume <span className="admin-badge">ADMIN</span></strong><Link className="ghost-button" to="/admin">Về dashboard</Link></header><section className="welcome-section"><p className="eyebrow">Admin workspace / Taxonomy</p><h1>Thương hiệu & danh mục.</h1><p>Quản lý nhóm sản phẩm để storefront và bộ lọc luôn đồng bộ.</p><div className="starter-actions"><button className="primary-button" onClick={openCreate}><PlusCircle size={18} /> Thêm {collectionLabels[activeCollection].toLowerCase()}</button></div></section><section className="admin-panel"><div className="taxonomy-tabs"><button className={activeCollection === 'brands' ? 'active' : ''} onClick={() => { setActiveCollection('brands'); setIsFormOpen(false) }}><Tag size={16} /> Thương hiệu ({items.brands.length})</button><button className={activeCollection === 'categories' ? 'active' : ''} onClick={() => { setActiveCollection('categories'); setIsFormOpen(false) }}><FolderTree size={16} /> Danh mục ({items.categories.length})</button></div>{errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}{successMessage && <p className="success-inline">{successMessage}</p>}{isFormOpen && <form className="taxonomy-form" onSubmit={handleSubmit}><div className="product-form-heading"><div><p className="eyebrow">{editingId ? 'Edit' : 'New'} {collectionLabels[activeCollection]}</p><h2>{editingId ? 'Cập nhật' : 'Thêm mới'}</h2></div><button type="button" className="icon-button" onClick={() => setIsFormOpen(false)} aria-label="Đóng biểu mẫu"><X size={17} /></button></div><div className="taxonomy-form-grid"><label>Tên<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /></label><label>Slug<input value={form.slug ?? ''} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder="tu-dien-mui-huong" /></label><label>Trạng thái<select value={form.status ?? 'active'} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option value="active">Đang hoạt động</option><option value="inactive">Tạm ẩn</option></select></label></div><div className="product-form-actions"><button className="primary-button" type="submit" disabled={isSaving}><Save size={17} /> {isSaving ? 'Đang lưu...' : 'Lưu'}</button></div></form>}{isLoading && <p className="empty-state">Đang tải dữ liệu...</p>}{!isLoading && currentItems.length === 0 && <div className="empty-state"><h3>Chưa có dữ liệu</h3><p>Thêm {collectionLabels[activeCollection].toLowerCase()} đầu tiên.</p></div>}{!isLoading && currentItems.length > 0 && <div className="taxonomy-list">{currentItems.map((item) => <article className="taxonomy-item" key={item.id}><div><strong>{item.name}</strong><small>{item.slug || 'Chưa có slug'} · {item.status === 'inactive' ? 'Tạm ẩn' : 'Đang hoạt động'}</small></div><div className="admin-product-actions"><button className="icon-button" onClick={() => openEdit(item)} aria-label={`Sửa ${item.name}`} title="Sửa"><Edit3 size={16} /></button><button className="icon-button danger-icon" onClick={() => void handleDelete(item)} aria-label={`Xóa ${item.name}`} title="Xóa"><Trash2 size={16} /></button></div></article>)}</div>}</section></main>
}
