import { Check, Clock3, RefreshCw, Sparkles, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeToReturnRequests, updateReturnRequestStatus } from '../../services/returnRequestService'
import type { ReturnRequest, ReturnRequestStatus } from '../../types/returnRequest'

const statusOptions: ReturnRequestStatus[] = ['pending', 'approved', 'refunded', 'rejected']
const statusLabels: Record<ReturnRequestStatus, string> = { pending: 'Chờ xử lý', approved: 'Đã duyệt', refunded: 'Đã hoàn tiền', rejected: 'Từ chối' }

function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không rõ'
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

export default function AdminSupport() {
  const [requests, setRequests] = useState<ReturnRequest[]>([])
  const [filter, setFilter] = useState<ReturnRequestStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToReturnRequests((loadedRequests) => {
      setRequests(loadedRequests)
      setIsLoading(false)
    }, () => {
      setErrorMessage('Không thể kết nối danh sách yêu cầu hoàn hàng realtime.')
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const visibleRequests = useMemo(() => filter === 'all' ? requests : requests.filter((request) => request.status === filter), [filter, requests])

  const handleStatusChange = async (requestId: string, status: ReturnRequestStatus) => {
    setUpdatingId(requestId)
    try {
      await updateReturnRequestStatus(requestId, status)
      setRequests((current) => current.map((request) => request.id === requestId ? { ...request, status } : request))
    } catch {
      setErrorMessage('Không thể cập nhật trạng thái hoàn hàng.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <main className="app-home">
      <header className="app-header"><strong><Sparkles size={17} /> KBT Perfume <span className="admin-badge">ADMIN</span></strong><Link className="ghost-button" to="/admin">Về dashboard</Link></header>
      <section className="admin-page-heading"><div><h1>Hoàn hàng</h1><p>Tiếp nhận, duyệt và xử lý yêu cầu hoàn hàng.</p></div><button className="ghost-button" onClick={() => window.location.reload()} disabled={isLoading}><RefreshCw size={15} /> Làm mới</button></section>
      <section className="admin-panel return-admin-panel">
        <div className="return-filter-tabs"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Tất cả</button>{statusOptions.map((status) => <button className={filter === status ? 'active' : ''} onClick={() => setFilter(status)} key={status}>{statusLabels[status]}</button>)}</div>
        {errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}
        {isLoading && <p className="empty-state">Đang tải yêu cầu hoàn hàng...</p>}
        {!isLoading && !errorMessage && visibleRequests.length === 0 && <div className="return-empty-state"><Clock3 size={24} /><p>Chưa có yêu cầu hoàn hàng.</p></div>}
        {!isLoading && !errorMessage && visibleRequests.length > 0 && <div className="return-table-scroll"><table className="return-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Lý do</th><th>Hoàn tiền</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead><tbody>{visibleRequests.map((request) => <tr key={request.id}><td>{request.orderId.slice(0, 16).toUpperCase()}</td><td>{request.userName}</td><td>{request.reason}</td><td>{formatPrice(request.refundAmount)}</td><td><span className={`return-status ${request.status}`}>{statusLabels[request.status]}</span></td><td>{formatDate(request.createdAt)}</td><td><div className="return-action-cell"><select value={request.status} onChange={(event) => void handleStatusChange(request.id, event.target.value as ReturnRequestStatus)} disabled={updatingId === request.id} aria-label={`Trạng thái hoàn hàng ${request.orderId}`}>{statusOptions.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select>{request.status === 'approved' && <button className="refund-button" onClick={() => void handleStatusChange(request.id, 'refunded')}><Check size={14} /> Hoàn tiền</button>}{request.status === 'rejected' && <XCircle size={17} className="return-rejected-icon" />}</div></td></tr>)}</tbody></table></div>}
      </section>
    </main>
  )
}
