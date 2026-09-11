import { MessageCircleQuestion, Send, Sparkles } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { createSupportTicket, getSupportTicketsByUser } from '../../services/supportService'
import type { SupportTicket } from '../../types/support'

const faqs = [
  {
    question: 'Làm thế nào để theo dõi đơn hàng?',
    answer: 'Bạn vào mục Đơn hàng của tôi trong trang tài khoản để xem tiến độ và trạng thái hiện tại của đơn.',
  },
  {
    question: 'Phương thức thanh toán nào hỗ trợ?',
    answer: 'Hiện hệ thống hỗ trợ COD, chuyển khoản ngân hàng và thanh toán QR Code theo hướng dẫn trong checkout.',
  },
  {
    question: 'Có thể đổi trả không?',
    answer: 'Đổi trả được xem xét theo điều kiện đơn hàng và sản phẩm. Vui lòng gửi yêu cầu hỗ trợ để được hỗ trợ cụ thể.',
  },
  {
    question: 'Tôi muốn đặt hàng số lượng lớn?',
    answer: 'Bạn có thể liên hệ qua form hỗ trợ với nội dung yêu cầu số lượng lớn để được tư vấn chi tiết.',
  },
]

function formatDate(dateText: string) {
  if (!dateText) return 'Không rõ'

  const date = new Date(dateText)
  if (Number.isNaN(date.getTime())) return 'Không rõ'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export default function CustomerSupport() {
  const { user, profile } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    getSupportTicketsByUser(user.uid)
      .then((loadedTickets) => setTickets(loadedTickets))
      .catch(() => setErrorMessage('Không thể tải yêu cầu hỗ trợ.'))
      .finally(() => setIsLoading(false))
  }, [user])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || !profile) return

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await createSupportTicket({
        userId: user.uid,
        userName: profile.fullName,
        subject: subject.trim(),
        message: message.trim(),
        status: 'open',
      })
      setSubject('')
      setMessage('')
      setSuccessMessage('Yêu cầu hỗ trợ của bạn đã được gửi thành công.')

      const nextTickets = await getSupportTicketsByUser(user.uid)
      setTickets(nextTickets)
    } catch {
      setErrorMessage('Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="support-page">
      <header className="shop-header">
        <Link className="shop-brand" to="/customer"><Sparkles size={18} /> KBT Perfume</Link>
        <Link className="ghost-button" to="/customer">Tiếp tục mua sắm</Link>
      </header>

      <section className="support-content">
        <p className="eyebrow">Customer care</p>
        <h1>Hỗ trợ khách hàng</h1>

        <div className="support-layout">
          <div className="support-stack">
            <div className="support-card">
              <div className="support-card-header">
                <MessageCircleQuestion size={18} />
                <h2>Câu hỏi thường gặp</h2>
              </div>

              <div className="faq-list">
                {faqs.map((faq) => (
                  <article className="faq-item" key={faq.question}>
                    <h3>{faq.question}</h3>
                    <p>{faq.answer}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="support-card">
              <div className="support-card-header">
                <Send size={18} />
                <h2>Gửi yêu cầu hỗ trợ</h2>
              </div>

              <form className="ticket-form" onSubmit={handleSubmit}>
                <label>
                  Chủ đề
                  <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Ví dụ: Đơn hàng chưa được cập nhật" required />
                </label>

                <label>
                  Nội dung
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Mô tả vấn đề bạn đang gặp..." required />
                </label>

                {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
                {successMessage && <p className="success-inline">{successMessage}</p>}

                <button className="primary-button" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang gửi...' : 'Gửi hỗ trợ'}
                </button>
              </form>
            </div>
          </div>

          <div className="support-card history-card">
            <div className="support-card-header">
              <MessageCircleQuestion size={18} />
              <h2>Yêu cầu của tôi</h2>
            </div>

            {isLoading && <p className="empty-state">Đang tải...</p>}

            {!isLoading && tickets.length === 0 && (
              <div className="empty-state">
                <h3>Chưa có yêu cầu nào</h3>
                <p>Hệ thống hỗ trợ sẽ hiển thị lịch sử ở đây.</p>
              </div>
            )}

            <div className="ticket-list">
              {tickets.map((ticket) => (
                <article className="ticket-item" key={ticket.id}>
                  <div className="ticket-item-head">
                    <strong>{ticket.subject}</strong>
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status === 'open' ? 'Mới' : ticket.status === 'pending' ? 'Đang xử lý' : 'Đã giải quyết'}
                    </span>
                  </div>
                  <p>{ticket.message}</p>
                  <small>{formatDate(ticket.createdAt)}</small>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
