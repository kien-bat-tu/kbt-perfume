import { ArrowLeft, Minus, Plus, ShoppingBag, Sparkles, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function Cart() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity } = useCartStore()
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <main className="cart-page"><header className="shop-header"><Link className="shop-brand" to="/customer"><Sparkles size={18} /> KBT Perfume</Link><Link className="ghost-button" to="/customer"><ArrowLeft size={16} /> Tiếp tục mua sắm</Link></header><section className="cart-content"><p className="eyebrow">Your selection</p><h1>Giỏ hàng</h1>{items.length === 0 ? <div className="empty-state cart-empty"><ShoppingBag size={25} /><h3>Giỏ hàng đang trống</h3><p>Hãy khám phá bộ sưu tập và chọn mùi hương bạn yêu thích.</p><Link className="primary-button" to="/customer">Xem sản phẩm</Link></div> : <div className="cart-layout"><div className="cart-items">{items.map((item) => <article className="cart-item" key={item.id}><div className="cart-item-image">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>{item.brand}</span>}</div><div className="cart-item-info"><p className="product-brand">{item.brand}</p><h2>{item.name}</h2><p>{formatPrice(item.price)}</p><div className="quantity-control"><button aria-label="Giảm số lượng" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button><strong>{item.quantity}</strong><button aria-label="Tăng số lượng" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button></div></div><button className="remove-button" aria-label={`Xóa ${item.name}`} onClick={() => removeItem(item.id)}><Trash2 size={17} /></button></article>)}</div><aside className="cart-summary"><p className="eyebrow">Order summary</p><h2>Tổng đơn hàng</h2><div className="summary-line"><span>Tạm tính</span><strong>{formatPrice(total)}</strong></div><div className="summary-line"><span>Phí vận chuyển</span><span>Miễn phí</span></div><div className="summary-total"><span>Tổng cộng</span><strong>{formatPrice(total)}</strong></div><button className="primary-button" onClick={() => navigate('/customer/checkout')}>Tiến hành thanh toán</button></aside></div>}</section></main>
  )
}
