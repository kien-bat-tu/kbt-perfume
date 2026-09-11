import { Heart, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getProductById } from '../../services/productService'
import { getWishlistByUser, removeFromWishlist } from '../../services/wishlistService'
import type { Product } from '../../types/product'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function CustomerWishlist() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    getWishlistByUser(user.uid)
      .then(async (productIds) => {
        const favoriteProducts = await Promise.all(
          productIds.map(async (productId) => getProductById(productId)),
        )

        setProducts(favoriteProducts.filter((product): product is Product => product !== null))
      })
      .catch(() => setErrorMessage('Không thể tải sản phẩm yêu thích lúc này.'))
      .finally(() => setIsLoading(false))
  }, [user])

  const handleRemove = async (productId: string) => {
    if (!user) return

    try {
      await removeFromWishlist(user.uid, productId)
      setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId))
    } catch {
      setErrorMessage('Không thể xóa sản phẩm yêu thích.')
    }
  }

  return (
    <main className="wishlist-page">
      <header className="shop-header">
        <Link className="shop-brand" to="/customer"><Sparkles size={18} /> KBT Perfume</Link>
        <Link className="ghost-button" to="/customer">Tiếp tục mua sắm</Link>
      </header>

      <section className="wishlist-content">
        <p className="eyebrow">Favorites</p>
        <h1>Sản phẩm yêu thích</h1>

        {isLoading && <p className="empty-state">Đang tải danh sách yêu thích...</p>}
        {errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}

        {!isLoading && !errorMessage && products.length === 0 && (
          <div className="empty-state">
            <h3>Chưa có sản phẩm yêu thích</h3>
            <p>Hãy nhấn vào biểu tượng tim trên các sản phẩm để lưu lại.</p>
            <Link className="primary-button" to="/customer">Khám phá sản phẩm</Link>
          </div>
        )}

        {!isLoading && !errorMessage && products.length > 0 && (
          <div className="wishlist-grid">
            {products.map((product) => (
              <article className="wishlist-card" key={product.id}>
                <div className="product-image wishlist-image">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>{product.brand}</span>}
                </div>

                <div className="wishlist-info">
                  <p className="product-brand">{product.brand}</p>
                  <h2>{product.name}</h2>
                  <p className="product-category">{product.category}</p>
                  <strong>{formatPrice(product.price)}</strong>
                </div>

                <div className="wishlist-actions">
                  <Link className="primary-button" to={`/customer/products/${product.id}`}>Xem chi tiết</Link>
                  <button className="remove-button" aria-label={`Xóa ${product.name}`} onClick={() => void handleRemove(product.id)}>
                    <Heart size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
