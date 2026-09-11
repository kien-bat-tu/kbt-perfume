import { ArrowLeft, Minus, Plus, ShoppingBag, Sparkles, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getEffectiveProductPrice, useCartStore } from '../../store/cartStore'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function Cart() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity } = useCartStore()
  const total = items.reduce((sum, item) => sum + getEffectiveProductPrice(item) * item.quantity, 0)

  return (
    <main className="cart-page">
      <div className="storefront-topline">
        <span>FreeShip toàn quốc với đơn từ 1.5 triệu</span>
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
            <Link to="/customer/products">Sản phẩm</Link>
            <Link to="/customer">Về chúng tôi</Link>
            <Link to="/customer">Thương hiệu</Link>
            <Link to="/customer/ai-consultation">Tư vấn AI</Link>
          </nav>

          <div className="shop-actions">
            <Link className="shop-cart-link" to="/customer/cart">
              <ShoppingBag size={16} />
              <span>Giỏ hàng</span>
              <span className="shop-cart-count">{items.reduce((count, item) => count + item.quantity, 0)}</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="cart-content">
        <h1>Giỏ hàng của bạn</h1>

        {items.length === 0 ? (
          <div className="empty-state cart-empty">
            <ShoppingBag size={28} />
            <h3>Giỏ hàng đang trống</h3>
            <p>Hãy khám phá bộ sưu tập và chọn mùi hương bạn yêu thích.</p>
            <Link className="primary-button" to="/customer">Xem sản phẩm</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-wrap">
              <div className="cart-table-head">
                <span>Sản phẩm</span>
                <span>Giá</span>
                <span>Số lượng</span>
                <span>Tổng</span>
              </div>

              {items.map((item) => {
                const itemUnitPrice = getEffectiveProductPrice(item)
                const originalPrice = Number(item.price ?? 0)
                const discountPercent = Number(item.salePrice ?? 0) > 0 && originalPrice > 0 && Number(item.salePrice) < originalPrice
                  ? Math.round((1 - Number(item.salePrice) / originalPrice) * 100)
                  : 0
                const hasDiscount = discountPercent > 0

                return (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-item-main">
                      <div className="cart-item-image">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>{item.brand}</span>}
                      </div>

                      <div className="cart-item-info">
                        <span className="product-brand-tag">{item.brand}</span>
                        <h2>{item.name}</h2>
                      </div>
                    </div>

                    <div className="cart-item-price-wrap">
                      {hasDiscount ? (
                        <div className="cart-price-inline">
                          <span className="cart-old-price">{formatPrice(originalPrice)}</span>
                          <span className="cart-discount-badge">-{discountPercent}%</span>
                        </div>
                      ) : null}
                      <span className="cart-unit-price">{formatPrice(itemUnitPrice)}</span>
                    </div>

                    <div className="quantity-control cart-quantity-control">
                      <button aria-label="Giảm số lượng" type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={14} />
                      </button>
                      <strong>{item.quantity}</strong>
                      <button aria-label="Tăng số lượng" type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="cart-item-total">
                      <strong>{formatPrice(itemUnitPrice * item.quantity)}</strong>
                      <button className="remove-button" aria-label={`Xóa ${item.name}`} type="button" onClick={() => removeItem(item.id)}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            <aside className="cart-summary">
              <h2>Tóm tắt đơn hàng</h2>
              <div className="summary-row">
                <span>Tổng tiền</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className="summary-total">
                <span>Tổng cộng</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              <button className="primary-button" type="button" onClick={() => navigate('/customer/checkout')}>
                Thanh toán
              </button>

              <button className="ghost-button cart-back-button" type="button" onClick={() => navigate('/customer')}>
                <ArrowLeft size={16} /> Tiếp tục mua sắm
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}
