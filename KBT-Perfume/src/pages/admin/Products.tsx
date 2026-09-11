import { Edit3, ImagePlus, Package, PlusCircle, Save, Sparkles, Trash2, X } from 'lucide-react'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { uploadProductImage } from '../../firebase/storage'
import { getBrands, getCategories } from '../../services/taxonomyService'
import { createProduct, deleteProduct, updateProduct, type ProductInput } from '../../services/adminProductService'
import { getProducts } from '../../services/productService'
import { subscribeProducts } from '../../services/productService'
import { subscribeBrands, subscribeCategories } from '../../services/taxonomyService'
import type { Product } from '../../types/product'
import type { TaxonomyItem } from '../../types/taxonomy'
import { perfumeBrands, perfumeConcentrations, perfumeGenders, perfumeLongevity, perfumeMoods, perfumeOrigins, perfumeProductTypes, perfumeSeasons, perfumeScentFamilies, perfumeSillage, perfumeStyles, perfumeVolumes, perfumeYears } from '../../lib/fragranceOptions'

const emptyForm: ProductInput = {
  name: '', brand: '', category: '', price: 0, salePrice: 0, volume: '', imageUrl: '', description: '',
  gender: 'Nam', scentFamily: 'Hương hoa', topNotes: '', middleNotes: '', baseNotes: '',
  longevity: '', sillage: '', isFeatured: false, isActive: true, stock: 0,
  brandOrigin: '', concentration: '', season: '', scentMood: '', productType: '', style: '', releaseYear: '',
}

const fragranceTypes = perfumeConcentrations

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<TaxonomyItem[]>([])
  const [categories, setCategories] = useState<TaxonomyItem[]>([])
  const [form, setForm] = useState<ProductInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const [loadedProducts, loadedBrands, loadedCategories] = await Promise.all([getProducts(), getBrands().catch(() => []), getCategories().catch(() => [])])
      setProducts(loadedProducts)
      setBrands(loadedBrands)
      setCategories(loadedCategories)
    } catch {
      setErrorMessage('Không thể tải danh sách sản phẩm.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    const unsubscribeProducts = subscribeProducts((loaded) => setProducts(loaded))
    const unsubscribeBrands = subscribeBrands((loaded) => setBrands(loaded))
    const unsubscribeCategories = subscribeCategories((loaded) => setCategories(loaded))
    return () => {
      unsubscribeProducts()
      unsubscribeBrands()
      unsubscribeCategories()
    }
  }, [])

  const openCreateForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setSelectedImage(null)
    setSuccessMessage('')
    setErrorMessage('')
    setIsFormOpen(true)
  }

  const openEditForm = (product: Product) => {
    setEditingId(product.id)
    setSelectedImage(null)
    setForm({
      ...emptyForm,
      ...product,
      brandId: product.brandId ?? brands.find((brand) => brand.name === product.brand)?.id,
      categoryId: product.categoryId ?? categories.find((category) => category.name === product.category)?.id,
      salePrice: product.salePrice ?? 0,
      description: product.description ?? '',
      isFeatured: product.isFeatured ?? false,
      isActive: product.isActive ?? true,
      stock: product.stock ?? 0,
    })
    setSuccessMessage('')
    setErrorMessage('')
    setIsFormOpen(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')
    try {
      const selectedBrand = brands.find((brand) => brand.id === form.brand || brand.name === form.brand)
      const selectedCategory = categories.find((category) => category.id === form.category || category.name === form.category)
      const imageUrl = selectedImage ? await uploadProductImage(selectedImage) : form.imageUrl.trim()
      const input: ProductInput = {
        ...form,
        name: form.name.trim(),
        brand: selectedBrand?.name ?? form.brand.trim(),
        category: selectedCategory?.name ?? form.category.trim(),
        price: Number(form.price),
        salePrice: Number(form.salePrice ?? 0),
        stock: Number(form.stock ?? 0),
        imageUrl,
        description: form.description?.trim() ?? '',
        brandId: selectedBrand?.id ?? form.brandId,
        categoryId: selectedCategory?.id ?? form.categoryId,
      }
      if (editingId) {
        await updateProduct(editingId, input)
        setProducts((current) => current.map((product) => product.id === editingId ? { ...product, ...input } : product))
        setSuccessMessage('Sản phẩm đã được cập nhật.')
      } else {
        const productId = await createProduct(input)
        setProducts((current) => [...current, { ...input, id: productId } as Product])
        setSuccessMessage('Sản phẩm đã được thêm.')
      }
      setIsFormOpen(false)
    } catch {
      setErrorMessage('Không thể lưu sản phẩm. Hãy kiểm tra quyền Firebase và ảnh tải lên.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) return
    try {
      await deleteProduct(product.id)
      setProducts((current) => current.filter((item) => item.id !== product.id))
      setSuccessMessage('Sản phẩm đã được xóa.')
    } catch {
      setErrorMessage('Không thể xóa sản phẩm.')
    }
  }

  const updateField = <Key extends keyof ProductInput>(key: Key, value: ProductInput[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => setSelectedImage(event.target.files?.[0] ?? null)

  const sanitizedCategories = categories.filter((item) => !/^category[\s_-]*\d*$/i.test(String(item.name ?? '')))
  const selectableBrands = Array.from(new Set([...brands.map((brand) => brand.name), ...perfumeBrands, ...(form.brand ? [form.brand] : [])]))
  const selectableVolumes = Array.from(new Set([...(form.volume ? [form.volume] : []), ...perfumeVolumes]))
  const selectableFragranceTypes = Array.from(new Set([...(form.scentFamily ? [form.scentFamily] : []), ...perfumeScentFamilies]))
  const selectableLongevity = Array.from(new Set([...(form.longevity ? [form.longevity] : []), ...perfumeLongevity]))
  const selectableSillage = Array.from(new Set([...(form.sillage ? [form.sillage] : []), ...perfumeSillage]))

  return (
    <main className="app-home">
      <header className="app-header"><strong><Sparkles size={17} /> KBT Perfume <span className="admin-badge">ADMIN</span></strong><Link className="ghost-button" to="/admin">Về dashboard</Link></header>
      <section className="admin-page-heading"><div><h1>Quản lý sản phẩm</h1><p>Theo dõi và quản lý kho hàng của cửa hàng.</p></div><button className="primary-button" onClick={openCreateForm}><PlusCircle size={18} /> Thêm sản phẩm</button></section>
      <section className="admin-panel admin-products-panel">
        {errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}
        {successMessage && <p className="success-inline">{successMessage}</p>}
        {isFormOpen && <form className="product-admin-form product-form-reference" onSubmit={handleSubmit}>
          <div className="product-form-heading"><div><p className="eyebrow">{editingId ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</p><h2>{editingId ? 'Cập nhật sản phẩm' : 'Thông tin sản phẩm'}</h2></div><button type="button" className="icon-button" onClick={() => setIsFormOpen(false)} aria-label="Đóng biểu mẫu"><X size={17} /></button></div>
          <div className="product-admin-grid">
            <label>Tên sản phẩm<input value={form.name} onChange={(event) => updateField('name', event.target.value)} required /></label>
            <label>Giá<input type="number" min="0" value={form.price} onChange={(event) => updateField('price', Number(event.target.value))} required /></label>
            <label>Giá khuyến mãi<input type="number" min="0" value={form.salePrice ?? 0} onChange={(event) => updateField('salePrice', Number(event.target.value))} /></label>
            <label>Số lượng tồn kho<input type="number" min="0" value={form.stock ?? 0} onChange={(event) => updateField('stock', Number(event.target.value))} required /></label>
            <label>Danh mục<select value={form.categoryId ?? form.category} onChange={(event) => updateField('category', event.target.value)} required><option value="">Chọn danh mục</option>{sanitizedCategories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
            <label>Thương hiệu<select value={form.brand} onChange={(event) => updateField('brand', event.target.value)} required><option value="">Chọn thương hiệu</option>{selectableBrands.map((brand) => <option value={brand} key={brand}>{brand}</option>)}</select></label>
            <label>Dung tích<select value={form.volume ?? ''} onChange={(event) => updateField('volume', event.target.value)}><option value="">Chọn dung tích</option>{selectableVolumes.map((volume) => <option value={volume} key={volume}>{volume}</option>)}</select></label>
            <label>Loại nước hoa<select value={form.scentFamily ?? ''} onChange={(event) => updateField('scentFamily', event.target.value)}><option value="">Chọn loại nước hoa</option>{selectableFragranceTypes.map((type) => <option value={type} key={type}>{type}</option>)}</select></label>
            <label>Giới tính<select value={form.gender ?? 'Nam'} onChange={(event) => updateField('gender', event.target.value)}>{perfumeGenders.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
            <label>Xuất xứ thương hiệu<select value={form.brandOrigin ?? ''} onChange={(event) => updateField('brandOrigin', event.target.value)}><option value="">Chọn xuất xứ</option>{perfumeOrigins.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
            <label>Nồng độ / Phân loại<select value={form.concentration ?? ''} onChange={(event) => updateField('concentration', event.target.value)}><option value="">Chọn nồng độ</option>{fragranceTypes.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
            <label>Mùa<select value={form.season ?? ''} onChange={(event) => updateField('season', event.target.value)}><option value="">Chọn mùa</option>{perfumeSeasons.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
            <label>Cảm giác mùi hương<select value={form.scentMood ?? ''} onChange={(event) => updateField('scentMood', event.target.value)}><option value="">Chọn cảm giác</option>{perfumeMoods.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
            <label>Dạng sản phẩm<select value={form.productType ?? ''} onChange={(event) => updateField('productType', event.target.value)}><option value="">Chọn dạng sản phẩm</option>{perfumeProductTypes.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
                        <label>Phong cách<select value={form.style ?? ''} onChange={(event) => updateField('style', event.target.value)}><option value="">Chọn phong cách</option>{perfumeStyles.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
                        <label>Năm phát hành<select value={form.releaseYear ?? ''} onChange={(event) => updateField('releaseYear', event.target.value)}><option value="">Chọn năm</option>{perfumeYears.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
            <label className="product-form-wide">Mô tả<textarea value={form.description ?? ''} onChange={(event) => updateField('description', event.target.value)} rows={4} /></label>
            <label>Hương đầu<textarea value={form.topNotes ?? ''} onChange={(event) => updateField('topNotes', event.target.value)} rows={2} /></label>
            <label>Hương giữa<textarea value={form.middleNotes ?? ''} onChange={(event) => updateField('middleNotes', event.target.value)} rows={2} /></label>
            <label>Hương cuối<textarea value={form.baseNotes ?? ''} onChange={(event) => updateField('baseNotes', event.target.value)} rows={2} /></label>
            <label>Độ lưu hương<select value={form.longevity ?? ''} onChange={(event) => updateField('longevity', event.target.value)}><option value="">Chọn độ lưu hương</option>{selectableLongevity.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
            <label>Độ lan tỏa<select value={form.sillage ?? ''} onChange={(event) => updateField('sillage', event.target.value)}><option value="">Chọn độ lan tỏa</option>{selectableSillage.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
            <label>Hình ảnh chính<input type="file" accept="image/*" onChange={handleImageChange} /><small>{selectedImage ? selectedImage.name : 'Chọn ảnh để tải lên Firebase Storage'}</small></label>
            <label>URL hình ảnh trên Internet<input value={form.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} placeholder="https://example.com/image.jpg" /><small>Chọn file sẽ được ưu tiên hơn URL.</small></label>
            <label className="checkbox-label"><input type="checkbox" checked={form.isFeatured ?? false} onChange={(event) => updateField('isFeatured', event.target.checked)} /> Sản phẩm nổi bật</label>
            <label className="checkbox-label"><input type="checkbox" checked={form.isActive ?? true} onChange={(event) => updateField('isActive', event.target.checked)} /> Hoạt động</label>
          </div>
          <div className="product-form-actions"><button className="primary-button" type="submit" disabled={isSaving}><Save size={17} /> {isSaving ? 'Đang lưu...' : 'Lưu'}</button></div>
        </form>}
        {isLoading && <p className="empty-state">Đang tải sản phẩm...</p>}
        {!isLoading && products.length === 0 && <div className="empty-state"><Package size={28} /><h3>Chưa có sản phẩm</h3><p>Hãy thêm sản phẩm đầu tiên cho cửa hàng.</p></div>}
        {!isLoading && products.length > 0 && <div className="products-table-scroll"><table className="products-table"><thead><tr><th>ID</th><th>Sản phẩm</th><th>Giá</th><th>Kho</th><th>Thương hiệu</th><th>Trạng thái</th><th>Hành động</th></tr></thead><tbody>{products.map((product, index) => <tr key={product.id}><td>{products.length - index}</td><td><div className="product-table-name"><div className="product-table-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <ImagePlus size={18} />}</div><div><strong>{product.name}</strong><small>{product.volume || '100ml'}</small></div></div></td><td>{formatPrice(product.salePrice || product.price)}</td><td>{product.stock ?? 0}</td><td>{product.brand}</td><td><span className={`product-status ${product.isActive === false ? 'inactive' : ''}`}>{product.isActive === false ? 'Ẩn' : 'Hiển thị'}</span></td><td><div className="product-table-actions"><button className="product-edit-button" onClick={() => openEditForm(product)}><Edit3 size={14} /> Sửa</button><button className="product-delete-button" onClick={() => void handleDelete(product)}><Trash2 size={14} /> Xóa</button></div></td></tr>)}</tbody></table></div>}
      </section>
    </main>
  )
}
