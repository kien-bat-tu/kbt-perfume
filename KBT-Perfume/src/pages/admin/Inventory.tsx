import { AlertTriangle, Package, RefreshCw, Save, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import { updateProduct } from '../../services/adminProductService'
import type { Product } from '../../types/product'

const LOW_STOCK_LIMIT = 5

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadProducts = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      setProducts(await getProducts())
    } catch {
      setErrorMessage('Không thể tải dữ liệu tồn kho.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void loadProducts() }, [])

  const lowStockCount = useMemo(() => products.filter((product) => (product.stock ?? 0) <= LOW_STOCK_LIMIT).length, [products])
  const updateStock = async (product: Product) => {
    setSavingId(product.id)
    setErrorMessage('')
    try {
      await updateProduct(product.id, { stock: Math.max(0, Number(product.stock ?? 0)) })
      setSuccessMessage(`Đã cập nhật tồn kho cho ${product.name}.`)
    } catch {
      setErrorMessage('Không thể cập nhật tồn kho.')
    } finally {
      setSavingId(null)
    }
  }

  return <main className="app-home"><header className="app-header"><strong><Sparkles size={17} /> KBT Perfume <span className="admin-badge">ADMIN</span></strong><Link className="ghost-button" to="/admin">Về dashboard</Link></header><section className="welcome-section"><p className="eyebrow">Admin workspace / Inventory</p><h1>Quản lý tồn kho.</h1><p>Theo dõi số lượng hiện tại và cập nhật nhanh các sản phẩm sắp hết hàng.</p></section><section className="admin-panel"><div className="inventory-toolbar"><div><Package size={19} /><strong>{products.length} sản phẩm</strong><span className="inventory-warning"><AlertTriangle size={15} /> {lowStockCount} sắp hết</span></div><button className="ghost-button" onClick={() => void loadProducts()} disabled={isLoading}><RefreshCw size={15} /> Làm mới</button></div>{errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}{successMessage && <p className="success-inline">{successMessage}</p>}{isLoading && <p className="empty-state">Đang tải tồn kho...</p>}{!isLoading && products.length === 0 && <div className="empty-state"><h3>Chưa có sản phẩm</h3></div>}{!isLoading && products.length > 0 && <div className="inventory-list">{products.map((product) => { const stock = product.stock ?? 0; return <article className={stock <= LOW_STOCK_LIMIT ? 'inventory-item low-stock' : 'inventory-item'} key={product.id}><div className="inventory-product"><strong>{product.name}</strong><small>{product.brand} · {product.category}</small></div><span className="inventory-status">{stock === 0 ? 'Hết hàng' : stock <= LOW_STOCK_LIMIT ? 'Sắp hết' : 'Còn hàng'}</span><input type="number" min="0" value={stock} onChange={(event) => setProducts((current) => current.map((item) => item.id === product.id ? { ...item, stock: Number(event.target.value) } : item))} aria-label={`Tồn kho ${product.name}`} /><button className="icon-button" onClick={() => void updateStock(product)} disabled={savingId === product.id} aria-label={`Lưu tồn kho ${product.name}`} title="Lưu tồn kho"><Save size={16} /></button></article> })}</div>}</section></main>
}
