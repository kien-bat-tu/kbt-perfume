import { FirebaseError } from 'firebase/app'
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Sparkles, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getProductById } from '../../services/productService'
import { createProductReview, getReviewsByProduct } from '../../services/reviewService'
import { useCartStore } from '../../store/cartStore'
import type { Product } from '../../types/product'
import type { ProductReview } from '../../types/review'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function ProductDetail() {
  const { productId } = useParams()
  const { user, profile } = useAuth()
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)
  const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems])

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!productId) return

    Promise.all([getProductById(productId), getReviewsByProduct(productId)])
      .then(([loadedProduct, loadedReviews]) => {
        setProduct(loadedProduct)
        setReviews(loadedReviews)
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof FirebaseError && error.code === 'permission-denied'
            ? 'Firestore chưa cho phép đọc products.'
            : 'Không thể tải sản phẩm.',
        )
      })
      .finally(() => setIsLoading(false))
  }, [productId])

  if (isLoading) return <main className="loading-screen"><span className="loading-dot" /> Đang tải sản phẩm...</main>
  if (errorMessage) return <main className="loading-screen">{errorMessage}</main>
  if (!product) return <main className="loading-screen">Không tìm thấy sản phẩm. <Link to="/customer">Quay lại</Link></main>

  const handleAddToCart = () => {
    addItem(product, quantity)
    setQuantity(1)
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || !profile || !productId || !comment.trim()) return

    setIsSubmittingReview(true)
    setReviewMessage('')

    try {
      await createProductReview({
        productId,
        userId: user.uid,
        userName: profile.fullName,
        rating,
        comment: comment.trim(),
      })

      setReviews(await getReviewsByProduct(productId))
      setComment('')
      setReviewMessage('Đánh giá của bạn đã được lưu.')
    } catch {
      setReviewMessage('Không thể lưu đánh giá. Vui lòng thử lại.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <main className="detail-page">
      <div className="storefront-topline">
        <span>Free Ship toàn quốc với đơn từ 1.5 triệu</span>
        <span>Hotline: 1900 1234</span>
      </div>

      <header className="shop-header">
        <div className="shop-header-inner">
          <Link className="shop-brand" to="/customer">
            <span className="shop-brand-mark"><Sparkles size={14} /></span>
            KBT Perfume
          </Link>

          <nav className="shop-nav" aria-label="Điều hướng chính">
            <Link to="/customer">Trang chủ</Link>
            <Link to="/customer">Sản phẩm</Link>
            <Link to="/customer">Về chúng tôi</Link>
            <Link to="/customer">Thương hiệu</Link>
            <Link to="/customer">Tư vấn AI</Link>
          </nav>

          <div className="shop-actions">
            <Link className="shop-cart-link" to="/customer/cart">
              <ShoppingBag size={16} />
              <span>Giỏ hàng</span>
              <span className="shop-cart-count">{cartCount}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="detail-content">
        <div className="detail-product-shell">
          <div className="detail-gallery-panel">
            <span className="detail-sale-badge">-7%</span>
            <div className="detail-image-box">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <div className="detail-product-art">
                  <Sparkles size={38} />
                </div>
              )}
            </div>
            <div className="detail-brand-label">{product.brand || 'Tom Ford'}</div>
          </div>

          <section className="detail-info-card">
            <div className="detail-pill-row">
              <span className="detail-pill">{product.brand || 'Tom Ford'}</span>
              <span className="detail-pill detail-pill--muted">{product.category || 'Nước hoa unisex'}</span>
            </div>

            <h1>{product.name}</h1>

            <div className="detail-rating-line">
              <span className="detail-stars">
                <Star size={16} fill="currentColor" />
                {averageRating > 0 ? averageRating.toFixed(1) : '4.7'}
              </span>
              <span>{reviews.length > 0 ? `${reviews.length} đánh giá` : '98 đánh giá'}</span>
            </div>

            <div className="detail-price-block">
              <span className="detail-old-price">{formatPrice(product.price * 1.08)}</span>
              <span className="detail-price">{formatPrice(product.price)}</span>
            </div>

            <span className="detail-stock-badge"><span className="stock-dot" /> Còn hàng (12 sản phẩm)</span>

            <p className="detail-description">
              {product.description || 'Hương gợi cảm với hương anh đào và hương gỗ ấm, mang lại sự sang trọng, hiện đại và rất dễ nhớ.'}
            </p>

            <div className="quantity-row">
              <span>Số lượng</span>
              <div className="quantity-control">
                <button aria-label="Giảm số lượng" type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                  <Minus size={15} />
                </button>
                <strong>{quantity}</strong>
                <button aria-label="Tăng số lượng" type="button" onClick={() => setQuantity((value) => value + 1)}>
                  <Plus size={15} />
                </button>
              </div>
            </div>

            <div className="detail-actions">
              <button className="primary-button" type="button" onClick={handleAddToCart}>
                <ShoppingBag size={18} /> Thêm vào giỏ hàng
              </button>
              <button className="detail-favorite" type="button" aria-label="Thêm vào yêu thích">
                <Heart size={19} />
              </button>
            </div>

            <div className="detail-metadata-panel">
              <div>
                <label>Loại</label>
                <span>{product.category || 'EDP'}</span>
              </div>
              <div>
                <label>Dung tích</label>
                <span>50ml</span>
              </div>
              <div>
                <label>Giới tính</label>
                <span>Unisex</span>
              </div>
            </div>
          </section>
        </div>

        <div className="detail-lower">
          <section className="detail-panel">
            <h2>Thông tin sản phẩm</h2>
            <p>
              {product.description || 'Hương gợi cảm với hương anh đào và hương gỗ ấm, mang lại sự sang trọng, hiện đại và rất dễ nhớ.'}
            </p>
          </section>

          <section className="detail-panel review-panel">
            <div className="review-panel-header">
              <h2>Đánh giá</h2>
              <span className="review-score">
                <Star size={16} fill="currentColor" />
                {averageRating > 0 ? averageRating.toFixed(1) : '4.7'}
              </span>
            </div>

            <div className="detail-review-list">
              {reviews.length === 0 ? (
                <p className="review-empty">Sản phẩm chưa có đánh giá nào.</p>
              ) : (
                reviews.slice(0, 3).map((review) => (
                  <article className="review-item" key={review.id}>
                    <div className="review-item-head">
                      <strong>{review.userName}</strong>
                      <span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))
              )}
            </div>

            {!user ? (
              <div className="review-login-note">
                <p>Bạn cần đăng nhập để gửi đánh giá.</p>
                <Link className="text-link" to="/auth/login">Đăng nhập</Link>
              </div>
            ) : (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <label>
                  Chọn số sao
                  <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>{value} sao</option>
                    ))}
                  </select>
                </label>

                <label>
                  Bình luận
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Mùi hương này rất dễ thương và giữ hương tốt..."
                  />
                </label>

                <button className="primary-button" type="submit" disabled={isSubmittingReview}>
                  {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>

                {reviewMessage && <p className="success-inline">{reviewMessage}</p>}
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
