import { ArrowLeft, Bot, Send, ShoppingBag, Sparkles } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import { getConsultationResult, type ConsultationResult } from '../../services/aiService'
import type { Product } from '../../types/product'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const quickQuestions = ['Tôi thích mùi hương tươi mát', 'Tìm nước hoa nữ mùi hoa', 'Tôi muốn mùi gỗ ấm cho nam']

export default function AIConsultation() {
  const [products, setProducts] = useState<Product[]>([])
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<ConsultationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConsulting, setIsConsulting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setErrorMessage('Không thể tải dữ liệu sản phẩm để tư vấn.'))
      .finally(() => setIsLoading(false))
  }, [])

  const handleConsult = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!question.trim()) return

    setIsConsulting(true)
    setErrorMessage('')
    window.setTimeout(() => {
      setResult(getConsultationResult(question.trim(), products))
      setIsConsulting(false)
    }, 350)
  }

  return (
    <main className="consultation-page">
      <header className="shop-header">
        <Link className="shop-brand" to="/customer"><Sparkles size={18} /> KBT Perfume</Link>
        <Link className="ghost-button" to="/customer"><ArrowLeft size={16} /> Về cửa hàng</Link>
      </header>

      <section className="consultation-content">
        <div className="consultation-intro">
          <p className="eyebrow">KBT Scent Advisor</p>
          <h1>Tìm mùi hương dành riêng cho bạn.</h1>
          <p>Chia sẻ phong cách, nốt hương yêu thích hoặc ngân sách. Trợ lý sẽ gợi ý từ bộ sưu tập hiện có.</p>
        </div>

        <section className="consultation-panel">
          <div className="consultation-panel-heading"><span className="consultation-bot-icon"><Bot size={20} /></span><div><strong>Trợ lý tư vấn mùi hương</strong><small>Dữ liệu được lấy từ sản phẩm hiện có</small></div></div>
          <div className="quick-question-list">{quickQuestions.map((item) => <button key={item} onClick={() => setQuestion(item)}>{item}</button>)}</div>
          <form className="consultation-form" onSubmit={handleConsult}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ví dụ: Tôi cần một mùi hương tươi mát dưới 2 triệu..." required /><button className="primary-button" type="submit" disabled={isConsulting || isLoading}><Send size={17} /> {isConsulting ? 'Đang phân tích...' : 'Nhận tư vấn'}</button></form>
          {isLoading && <p className="empty-state">Đang chuẩn bị dữ liệu tư vấn...</p>}
          {errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}
          {result && !isLoading && <div className="consultation-result"><p className="consultation-message"><Bot size={17} /> {result.message}</p><div className="consultation-products">{result.products.map((product) => <article className="consultation-product" key={product.id}><div className="consultation-product-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>{product.brand}</span>}</div><div><p className="product-brand">{product.brand}</p><h2>{product.name}</h2><p className="product-category">{product.category}</p><strong>{formatPrice(product.price)}</strong><Link className="text-link" to={`/customer/products/${product.id}`}><ShoppingBag size={14} /> Xem sản phẩm</Link></div></article>)}</div></div>}
        </section>
      </section>
    </main>
  )
}
