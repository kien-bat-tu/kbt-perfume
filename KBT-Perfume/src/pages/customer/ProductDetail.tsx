import { FirebaseError } from 'firebase/app'
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProductById } from '../../services/productService'
import { useCartStore } from '../../store/cartStore'
import type { Product } from '../../types/product'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!productId) return

    getProductById(productId)
      .then((loadedProduct) => setProduct(loadedProduct))
      .catch((error: unknown) => {
        setErrorMessage(error instanceof FirebaseError && error.code === 'permission-denied' ? 'Firestore chưa cho phép đọc products.' : 'Không thể tải sản phẩm.')
      })
      .finally(() => setIsLoading(false))
  }, [productId])

  if (isLoading) return <main className="loading-screen"><span className="loading-dot" /> Đang tải sản phẩm...</main>
  if (errorMessage) return <main className="loading-screen">{errorMessage}</main>
  if (!product) return <main className="loading-screen">Không tìm thấy sản phẩm. <Link to="/customer">Quay lại</Link></main>

  const handleAddToCart = () => {
    addItem(product, quantity)
    navigate('/customer/cart')
  }

  return (
    <main className="detail-page">
      <header className="shop-header"><Link className="shop-brand" to="/customer"><Sparkles size={18} /> KBT Perfume</Link><Link className="ghost-button" to="/customer/cart"><ShoppingBag size={17} /> Giỏ hàng</Link></header>
      <div className="detail-content"><Link className="back-link" to="/customer"><ArrowLeft size={16} /> Quay lại bộ sưu tập</Link><div className="detail-grid"><div className="detail-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>{product.brand}</span>}</div><section className="detail-info"><p className="product-brand">{product.brand}</p><h1>{product.name}</h1><p className="detail-price">{formatPrice(product.price)}</p><p className="product-category">{product.category}</p><p className="detail-description">{product.description || 'Một mùi hương được tuyển chọn để lưu lại dấu ấn riêng trên làn da bạn.'}</p><div className="quantity-row"><span>Số lượng</span><div className="quantity-control"><button aria-label="Giảm số lượng" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button><strong>{quantity}</strong><button aria-label="Tăng số lượng" onClick={() => setQuantity((value) => value + 1)}><Plus size={15} /></button></div></div><div className="detail-actions"><button className="primary-button" onClick={handleAddToCart}><ShoppingBag size={18} /> Thêm vào giỏ hàng</button><button className="icon-button detail-favorite" aria-label="Thêm vào yêu thích"><Heart size={19} /></button></div></section></div></div>
    </main>
  )
}
