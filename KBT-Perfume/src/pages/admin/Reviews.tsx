import { ArrowLeft, MessageSquareText, RefreshCw, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProductReview, getAllReviews } from '../../services/reviewService'
import type { ProductReview } from '../../types/review'

function formatDate(dateText: string) {
  const date = new Date(dateText)
  if (Number.isNaN(date.getTime())) return 'Không rõ'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [ratingFilter, setRatingFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadReviews = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      setReviews(await getAllReviews())
    } catch {
      setErrorMessage('Không thể tải đánh giá. Vui lòng kiểm tra quyền Firebase.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadReviews()
  }, [])

  const visibleReviews = useMemo(() => (
    ratingFilter === 'all'
      ? reviews
      : reviews.filter((review) => review.rating === Number(ratingFilter))
  ), [ratingFilter, reviews])

  const handleDelete = async (review: ProductReview) => {
    if (!window.confirm(`Xóa đánh giá của ${review.userName}?`)) return

    setDeletingId(review.id)
    setErrorMessage('')

    try {
      await deleteProductReview(review.id)
      setReviews((currentReviews) => currentReviews.filter((item) => item.id !== review.id))
    } catch {
      setErrorMessage('Không thể xóa đánh giá.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="app-home">
      <header className="app-header">
        <strong><Sparkles size={17} /> KBT Perfume <span className="admin-badge">ADMIN</span></strong>
        <Link className="ghost-button" to="/admin"><ArrowLeft size={16} /> Về dashboard</Link>
      </header>

      <section className="welcome-section">
        <p className="eyebrow">Admin workspace / Reviews</p>
        <h1>Quản lý đánh giá.</h1>
        <p>Theo dõi phản hồi của khách hàng và giữ chất lượng nội dung trên cửa hàng.</p>
      </section>

      <section className="admin-panel">
        <div className="reviews-admin-toolbar">
          <div className="reviews-admin-title">
            <MessageSquareText size={19} />
            <strong>{reviews.length} đánh giá</strong>
          </div>
          <div className="reviews-admin-actions">
            <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)} aria-label="Lọc theo số sao">
              <option value="all">Tất cả số sao</option>
              {[5, 4, 3, 2, 1].map((rating) => <option value={rating} key={rating}>{rating} sao</option>)}
            </select>
            <button className="ghost-button" onClick={() => void loadReviews()} disabled={isLoading}><RefreshCw size={15} /> Làm mới</button>
          </div>
        </div>

        {isLoading && <p className="empty-state">Đang tải đánh giá...</p>}
        {errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}

        {!isLoading && !errorMessage && visibleReviews.length === 0 && (
          <div className="empty-state">
            <h3>Chưa có đánh giá phù hợp</h3>
            <p>Đánh giá mới từ khách hàng sẽ xuất hiện ở đây.</p>
          </div>
        )}

        {!isLoading && !errorMessage && visibleReviews.length > 0 && (
          <div className="admin-review-list">
            {visibleReviews.map((review) => (
              <article className="admin-review-item" key={review.id}>
                <div className="admin-review-main">
                  <div className="review-item-head">
                    <strong>{review.userName}</strong>
                    <span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  </div>
                  <p>{review.comment}</p>
                  <small>Sản phẩm: {review.productId} · {formatDate(review.createdAt)}</small>
                </div>
                <button className="icon-button danger-icon" onClick={() => void handleDelete(review)} disabled={deletingId === review.id} aria-label={`Xóa đánh giá của ${review.userName}`} title="Xóa đánh giá">
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
