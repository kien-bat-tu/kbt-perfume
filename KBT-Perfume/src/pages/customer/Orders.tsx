import { CheckCircle2, ChevronDown, Clock3, LogOut, PackageCheck, ShoppingBag, Sparkles, Truck, UserRound, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cancelOrder, subscribeToOrdersByUser } from '../../services/orderService'
import type { Order } from '../../types/order'

const statusLabels: Record<Order['status'], string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
}

const statusIcons = {
  pending: Clock3,
  confirmed: CheckCircle2,
  shipping: Truck,
  delivered: PackageCheck,
  cancelled: XCircle,
} as const

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

function formatDate(dateText: string) {
  if (!dateText) return 'Không rõ'

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

export default function CustomerOrders() {
  const { user, profile, signOutUser } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'>('all')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const unsubscribeOrders = subscribeToOrdersByUser(
      user.uid,
      (nextOrders) => {
        setOrders(nextOrders)
        setIsLoading(false)
      },
      () => {
        setErrorMessage('Không thể tải đơn hàng của bạn lúc này. Vui lòng thử lại sau.')
        setIsLoading(false)
      },
    )

    return () => unsubscribeOrders()
  }, [user])

  const handleCancelSelectedOrder = async (orderId?: string) => {
    const targetOrderId = orderId ?? selectedOrder?.id
    if (!targetOrderId) return

    try {
      await cancelOrder(targetOrderId)
      setOrders((current) => current.map((order) => order.id === targetOrderId ? { ...order, status: 'cancelled' } : order))
      setSelectedOrder((current) => (current && current.id === targetOrderId ? { ...current, status: 'cancelled' } : current))
    } catch {
      setErrorMessage('Không thể hủy đơn hàng. Vui lòng thử lại sau.')
    }
  }

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders
    return orders.filter((order) => order.status === activeTab)
  }, [activeTab, orders])

  const tabs: Array<{ id: 'all' | 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'; label: string }> = [
    { id: 'all', label: 'Tất cả đơn hàng' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'confirmed', label: 'Đã xác nhận' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'delivered', label: 'Đã mua' },
    { id: 'cancelled', label: 'Đã hủy' },
  ]

  return (
    <main className="orders-page-shell">
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
              <span className="shop-cart-count">{orders.reduce((count, order) => count + order.items.reduce((sum, item) => sum + item.quantity, 0), 0)}</span>
            </Link>

            <div className="user-menu-wrap">
              <button className="shop-account-pill" type="button" onClick={() => setMenuOpen((open) => !open)}>
                <UserRound size={14} />
                <span>{profile?.fullName?.split(' ').slice(-1)[0] || 'abc1'}</span>
                <ChevronDown size={14} />
              </button>

              {menuOpen && (
                <div className="user-menu-panel" role="menu">
                  <Link to="/customer/profile" onClick={() => setMenuOpen(false)}>Hồ sơ</Link>
                  <Link to="/customer/orders" onClick={() => setMenuOpen(false)}>Đơn đặt mua</Link>
                  <Link to="/customer/orders" onClick={() => setMenuOpen(false)}>Đơn đã hủy</Link>
                  <Link to="/customer/orders" onClick={() => setMenuOpen(false)}>Tất cả đơn hàng</Link>
                  <button type="button" onClick={() => { void signOutUser(); setMenuOpen(false) }}>
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="orders-history-shell">
        <h1>Lịch sử đơn hàng của tôi</h1>

        <div className="orders-tabs" role="tablist" aria-label="Lọc đơn hàng">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'orders-tab active' : 'orders-tab'}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && <p className="empty-state">Đang tải đơn hàng...</p>}
        {errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}

        {!isLoading && !errorMessage && filteredOrders.length === 0 && (
          <div className="empty-state history-empty">
            <h3>Chưa có đơn hàng nào</h3>
            <p>Hãy lựa chọn những mùi hương yêu thích và đặt hàng đầu tiên của bạn.</p>
            <Link className="primary-button" to="/customer">Khám phá sản phẩm</Link>
          </div>
        )}

        {!isLoading && !errorMessage && filteredOrders.length > 0 && (
          <div className="orders-history-table-wrap">
            <table className="orders-history-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status] ?? Clock3
                  const paymentLabel = order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Thanh toán khi nhận hàng'

                  return (
                    <tr key={order.id}>
                      <td>{order.id.slice(0, 8).toUpperCase()}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{formatPrice(order.total)}</td>
                      <td>
                        <span className={`history-status status-${order.status}`}>
                          <StatusIcon size={12} />
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td>
                        <span className={order.paymentMethod === 'bank_transfer' ? 'payment-pill payment-bank' : 'payment-pill payment-cod'}>
                          {paymentLabel}
                        </span>
                      </td>
                      <td>
                        <div className="history-actions">
                          {order.status !== 'cancelled' && (
                            <button className="history-action action-warning" type="button" onClick={() => void handleCancelSelectedOrder(order.id)}>
                              Đã hủy
                            </button>
                          )}
                          <button className="history-action action-primary" type="button" onClick={() => setSelectedOrder(order)}>
                            Xem chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="shop-footer-dark">
        <div className="shop-footer-dark-inner">
          <div className="shop-footer-brand">
            <span className="shop-brand-mark"><Sparkles size={14} /></span>
            <strong>KBT Perfume</strong>
            <p>Thương hiệu nước hoa cao cấp dành cho mọi phong cách.</p>
          </div>

          <div className="shop-footer-column">
            <strong>LIÊN KẾT</strong>
            <Link to="/customer">Trang chủ</Link>
            <Link to="/customer/products">Sản phẩm</Link>
            <Link to="/customer">Về chúng tôi</Link>
          </div>

          <div className="shop-footer-column">
            <strong>HỖ TRỢ</strong>
            <Link to="/customer/orders">Liện hệ</Link>
            <Link to="/customer/ai-consultation">Tư vấn AI</Link>
            <Link to="/customer/support">Đăng nhập</Link>
          </div>

          <div className="shop-footer-column compact">
            <strong>LIÊN HỆ</strong>
            <span>1900 1234</span>
            <span>hello@kbtperfume.vn</span>
            <span>123 Nguyễn Huệ, Q1, TP.HCM</span>
          </div>
        </div>
        <small>© 2026 KBT Perfume. Bảo lưu mọi quyền.</small>
      </footer>

      {selectedOrder && (
        <div className="order-detail-modal">
          <div className="order-detail-panel">
            <div className="order-detail-header">
              <h2>Đơn hàng {selectedOrder.id.slice(0, 8).toUpperCase()}</h2>
              <button className="icon-button" type="button" onClick={() => setSelectedOrder(null)}>Đóng</button>
            </div>

            <div className="order-status-row">
              <span className={selectedOrder.status === 'pending' ? 'status-pill active' : 'status-pill'}>Chờ xác nhận</span>
              <span className={selectedOrder.status === 'confirmed' ? 'status-pill active' : 'status-pill'}>Đã xác nhận</span>
              <span className={selectedOrder.status === 'shipping' ? 'status-pill active' : 'status-pill'}>Đang giao</span>
            </div>

            <div className="order-detail-summary">
              <div>
                <span>Tổng tiền</span>
                <strong>{formatPrice(selectedOrder.total)}</strong>
              </div>
              <div>
                <span>Phí vận chuyển</span>
                <strong>Miễn phí</strong>
              </div>
              <div>
                <span>Tổng cộng</span>
                <strong>{formatPrice(selectedOrder.total)}</strong>
              </div>
            </div>

            <div className="customer-order-info">
              <p><strong>Khách hàng:</strong> {selectedOrder.shipping.fullName}</p>
              <p><strong>Điện thoại:</strong> {selectedOrder.shipping.phone}</p>
              <p><strong>Địa chỉ:</strong> {selectedOrder.shipping.address}</p>
              <p><strong>Ghi chú:</strong> {selectedOrder.shipping.note || 'Không có'}</p>
            </div>

            {selectedOrder.status !== 'cancelled' && (
              <button className="primary-button red-button" type="button" onClick={() => void handleCancelSelectedOrder(selectedOrder.id)}>
                Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
