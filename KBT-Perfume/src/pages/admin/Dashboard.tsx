import { BarChart3, Boxes, CheckCircle2, CircleDollarSign, Clock3, Cog, LayoutDashboard, LogOut, PackageCheck, RotateCcw, ShoppingBag, Sparkles, Tags, Truck, Users, XCircle } from 'lucide-react'
import { collection, getDocs, onSnapshot } from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../firebase/firestore'
import { useAuth } from '../../hooks/useAuth'
import { subscribeToAllOrders, updateOrderStatus, updatePaymentStatus } from '../../services/orderService'
import { getProducts } from '../../services/productService'
import type { Order, OrderStatus } from '../../types/order'
import type { PaymentStatus } from '../../types/payment'

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled']

const statusLabels: Record<OrderStatus, string> = {
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

export default function AdminDashboard() {
  const { signOutUser } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [productCount, setProductCount] = useState(0)
  const [customerCount, setCustomerCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [liveMessage, setLiveMessage] = useState('')

  const loadDashboard = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [products, usersSnapshot] = await Promise.all([
        getProducts(),
        getDocs(collection(db, 'users')),
      ])
      setProductCount(products.length)
      setCustomerCount(usersSnapshot.size)
    } catch {
      setErrorMessage('Không thể tải đơn hàng. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()

    let isFirstOrderSnapshot = true
    const unsubscribeOrders = subscribeToAllOrders((nextOrders, changeCount) => {
      setOrders(nextOrders)
      setIsLoading(false)
      if (!isFirstOrderSnapshot && changeCount > 0) {
        setLiveMessage('Có cập nhật mới từ khách hàng hoặc đơn hàng.')
        window.setTimeout(() => setLiveMessage(''), 4500)
      }
      isFirstOrderSnapshot = false
    }, () => {
      setErrorMessage('Không thể kết nối realtime đơn hàng.')
      setIsLoading(false)
    })

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setCustomerCount(snapshot.size)
    })

    let isFirstSupportSnapshot = true
    const unsubscribeSupport = onSnapshot(collection(db, 'supportTickets'), (snapshot) => {
      if (!isFirstSupportSnapshot && snapshot.docChanges().length > 0) {
        setLiveMessage('Có yêu cầu hỗ trợ mới từ khách hàng.')
        window.setTimeout(() => setLiveMessage(''), 4500)
      }
      isFirstSupportSnapshot = false
    })

    let isFirstReviewSnapshot = true
    const unsubscribeReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      if (!isFirstReviewSnapshot && snapshot.docChanges().length > 0) {
        setLiveMessage('Có đánh giá mới từ khách hàng.')
        window.setTimeout(() => setLiveMessage(''), 4500)
      }
      isFirstReviewSnapshot = false
    })

    return () => {
      unsubscribeOrders()
      unsubscribeUsers()
      unsubscribeSupport()
      unsubscribeReviews()
    }
  }, [])

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    shipping: orders.filter((order) => order.status === 'shipping').length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
    revenue: orders.reduce((total, order) => order.status === 'cancelled' ? total : total + order.total, 0),
  }), [orders])

  const quickActions = [
    { to: '/admin/products', label: 'Sản phẩm', description: 'Quản lý sản phẩm, thêm/sửa/xóa và cập nhật kho hàng.', icon: Boxes, action: 'Quản lý', tone: 'violet' },
    { to: '/admin/coupons', label: 'Mã giảm giá', description: 'Tạo mã, giới hạn lượt dùng và bật tắt chương trình ưu đãi.', icon: Tags, action: 'Quản lý', tone: 'amber' },
    { to: '/admin/support', label: 'Hoàn hàng', description: 'Tiếp nhận, duyệt và xác nhận hoàn tiền cho khách hàng.', icon: RotateCcw, action: 'Xem', tone: 'coral' },
    { to: '#orders', label: 'Đơn hàng', description: 'Theo dõi đơn đặt hàng, trạng thái giao hàng và thanh toán.', icon: ShoppingBag, action: 'Xem', tone: 'green' },
    { to: '/admin/users', label: 'Người dùng', description: 'Quản lý tài khoản khách hàng và quyền truy cập admin.', icon: Users, action: 'Quản lý', tone: 'amber' },
    { to: '/admin/reports', label: 'Báo cáo', description: 'Doanh thu, xu hướng bán hàng và thống kê nhanh.', icon: BarChart3, action: 'Xem', tone: 'coral' },
    { to: '/admin/payment-settings', label: 'Cài đặt', description: 'Tùy chỉnh tài khoản ngân hàng và thanh toán QR trực tiếp trên website.', icon: Cog, action: 'Cài đặt', tone: 'violet' },
  ] as const

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId)

    try {
      await updateOrderStatus(orderId, nextStatus)
      setOrders((currentOrders) => currentOrders.map((order) => order.id === orderId ? { ...order, status: nextStatus } : order))
    } catch {
      setErrorMessage('Không thể cập nhật trạng thái đơn hàng.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handlePaymentStatusChange = async (orderId: string, paymentStatus: PaymentStatus) => {
    setUpdatingId(orderId)

    try {
      await updatePaymentStatus(orderId, paymentStatus)
      setOrders((currentOrders) => currentOrders.map((order) => order.id === orderId ? { ...order, paymentStatus } : order))
    } catch {
      setErrorMessage('Không thể cập nhật trạng thái thanh toán.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <main className="app-home">
      <header className="app-header">
        <strong><Sparkles size={17} /> KBT Perfume <span className="admin-badge">ADMIN</span></strong>
        <button className="ghost-button" onClick={signOutUser}><LogOut size={16} /> Đăng xuất</button>
      </header>

      <section className="admin-dashboard-heading">
        <div>
          <p className="eyebrow">BẢNG ĐIỀU KHIỂN</p>
          <h1>Admin KBT Perfume</h1>
        </div>
        <Link className="admin-storefront-button" to="/customer">Xem storefront</Link>
      </section>

      {liveMessage && <div className="admin-live-notice" role="status">{liveMessage}</div>}

      <section className="admin-dashboard-panel">
        <div className="stats-grid">
          <article className="dashboard-stat-card violet">
            <span className="dashboard-stat-icon"><Boxes size={18} /></span>
            <div><small>SẢN PHẨM</small><strong>{productCount}</strong></div>
          </article>
          <article className="dashboard-stat-card green">
            <span className="dashboard-stat-icon"><ShoppingBag size={18} /></span>
            <div><small>ĐƠN HÀNG</small><strong>{stats.total}</strong></div>
          </article>
          <article className="dashboard-stat-card amber">
            <span className="dashboard-stat-icon"><Users size={18} /></span>
            <div><small>KHÁCH HÀNG</small><strong>{customerCount}</strong></div>
          </article>
          <article className="dashboard-stat-card coral">
            <span className="dashboard-stat-icon"><CircleDollarSign size={18} /></span>
            <div><small>DOANH THU</small><strong>{formatPrice(stats.revenue)}</strong></div>
          </article>
        </div>

        <div className="dashboard-actions-grid">
          {quickActions.map(({ to, label, description, icon: Icon, action, tone }) => (
            <article className="dashboard-action-card" key={label}>
              <span className={`dashboard-action-icon ${tone}`}><Icon size={19} /></span>
              <h2>{label}</h2>
              <p>{description}</p>
              {to.startsWith('#') ? <a className="dashboard-action-button" href={to}>{action}</a> : <Link className="dashboard-action-button" to={to}>{action}</Link>}
            </article>
          ))}
        </div>

        <div className="orders-table-wrapper" id="orders">
          <div className="orders-table-header">
            <h2>Đơn hàng gần đây</h2>
            <button className="dashboard-refresh-button" onClick={() => void loadDashboard()}><LayoutDashboard size={16} /> Làm mới</button>
          </div>

          {isLoading && <p className="empty-state">Đang tải đơn hàng...</p>}
          {errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}

          {!isLoading && !errorMessage && orders.length === 0 && (
            <div className="empty-state">
              <h3>Chưa có đơn hàng nào</h3>
              <p>Khách hàng sẽ xuất hiện ở đây khi họ đặt hàng.</p>
            </div>
          )}

          {!isLoading && !errorMessage && orders.length > 0 && (
            <div className="orders-table-scroll">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const StatusIcon = statusIcons[order.status] ?? Clock3
                    const itemSummary = order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')

                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="order-code">
                            <strong>{order.id.slice(0, 8).toUpperCase()}</strong>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <strong>{order.shipping.fullName}</strong>
                            <span>{order.shipping.phone}</span>
                          </div>
                        </td>
                        <td className="products-cell">{itemSummary}</td>
                        <td>{formatPrice(order.total)}</td>
                        <td>
                          <div className="status-select-wrap">
                            <span className={`status-badge status-${order.paymentStatus ?? 'unpaid'}`}>{paymentStatusLabels[order.paymentStatus ?? 'unpaid']}</span>
                            <select value={order.paymentStatus ?? 'unpaid'} onChange={(event) => void handlePaymentStatusChange(order.id, event.target.value as PaymentStatus)} disabled={updatingId === order.id}>
                              {(Object.keys(paymentStatusLabels) as PaymentStatus[]).map((paymentStatus) => <option value={paymentStatus} key={paymentStatus}>{paymentStatusLabels[paymentStatus]}</option>)}
                            </select>
                          </div>
                        </td>
                        <td>
                          <div className="status-select-wrap">
                            <span className={`status-badge status-${order.status}`}>
                              <StatusIcon size={14} />
                              {statusLabels[order.status]}
                            </span>
                            <select
                              value={order.status}
                              onChange={(event) => void handleStatusChange(order.id, event.target.value as OrderStatus)}
                              disabled={updatingId === order.id}
                            >
                              {statusOptions.map((status) => (
                                <option value={status} key={status}>{statusLabels[status]}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: 'Chưa thanh toán',
  pending_confirmation: 'Chờ xác nhận CK',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán lỗi',
}