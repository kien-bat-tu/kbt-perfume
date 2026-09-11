import { ArrowLeft, BarChart3, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllOrders } from '../../services/orderService'
import { buildOrderReport } from '../../services/reportService'
import type { Order } from '../../types/order'

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date)
}

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadOrders = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      setOrders(await getAllOrders())
    } catch {
      setErrorMessage('Không thể tải dữ liệu báo cáo.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  const report = useMemo(() => buildOrderReport(orders), [orders])
  const maxDailyRevenue = Math.max(...report.dailyRevenue.map((item) => item.revenue), 1)

  return (
    <main className="app-home">
      <header className="app-header">
        <strong><Sparkles size={17} /> KBT Perfume <span className="admin-badge">ADMIN</span></strong>
        <Link className="ghost-button" to="/admin"><ArrowLeft size={16} /> Về dashboard</Link>
      </header>

      <section className="welcome-section">
        <p className="eyebrow">Admin workspace / Reports</p>
        <h1>Báo cáo kinh doanh.</h1>
        <p>Tổng hợp hiệu quả đơn hàng từ dữ liệu thực tế trong Firebase.</p>
      </section>

      <section className="admin-panel">
        <div className="report-toolbar">
          <div><BarChart3 size={19} /> <strong>Tổng quan bán hàng</strong></div>
          <button className="ghost-button" onClick={() => void loadOrders()} disabled={isLoading}><RefreshCw size={15} /> Làm mới</button>
        </div>

        {isLoading && <p className="empty-state">Đang tải báo cáo...</p>}
        {errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}

        {!isLoading && !errorMessage && (
          <>
            <div className="report-stats-grid">
              <article className="report-stat-card accent"><span>Doanh thu hợp lệ</span><strong>{formatPrice(report.totalRevenue)}</strong></article>
              <article className="report-stat-card"><span>Tổng đơn hàng</span><strong>{report.totalOrders}</strong></article>
              <article className="report-stat-card green"><span>Đơn đã giao</span><strong>{report.deliveredOrders}</strong></article>
              <article className="report-stat-card blue"><span>Giá trị đơn trung bình</span><strong>{formatPrice(report.averageOrderValue)}</strong></article>
            </div>

            <div className="report-grid">
              <section className="report-card">
                <div className="report-card-heading"><h2>Doanh thu 7 ngày gần nhất</h2><TrendingUp size={18} /></div>
                {report.dailyRevenue.length === 0 ? <p className="empty-state">Chưa có dữ liệu.</p> : <div className="revenue-bars">{report.dailyRevenue.map((item) => <div className="revenue-bar-item" key={item.date}><div className="revenue-bar-value">{formatPrice(item.revenue)}</div><div className="revenue-bar-track"><span style={{ height: `${Math.max(6, (item.revenue / maxDailyRevenue) * 100)}%` }} /></div><small>{formatDate(item.date)}</small></div>)}</div>}
              </section>

              <section className="report-card">
                <div className="report-card-heading"><h2>Sản phẩm bán chạy</h2><BarChart3 size={18} /></div>
                {report.topProducts.length === 0 ? <p className="empty-state">Chưa có dữ liệu.</p> : <div className="top-product-list">{report.topProducts.map((product, index) => <div className="top-product-item" key={product.name}><span className="top-product-rank">0{index + 1}</span><div><strong>{product.name}</strong><small>{product.quantity} sản phẩm · {formatPrice(product.revenue)}</small></div></div>)}</div>}
              </section>
            </div>

            <div className="report-status-line"><span>Đang chờ: <strong>{report.pendingOrders}</strong></span><span>Đã hủy: <strong>{report.cancelledOrders}</strong></span><span>Dữ liệu từ {orders.length} đơn hàng</span></div>
          </>
        )}
      </section>
    </main>
  )
}
