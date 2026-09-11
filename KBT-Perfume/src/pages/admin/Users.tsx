import { Lock, RefreshCw, Sparkles, Unlock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { subscribeToUsers, updateUserActiveStatus } from '../../services/userService'
import type { UserProfile } from '../../types/auth'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingUid, setUpdatingUid] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeToUsers((loadedUsers) => {
      setUsers(loadedUsers)
      setIsLoading(false)
    }, () => {
      setErrorMessage('Không thể tải danh sách người dùng. Hãy kiểm tra quyền Firestore.')
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const handleToggleActive = async (profile: UserProfile) => {
    if (profile.role === 'admin' || profile.uid === currentUser?.uid) return
    setUpdatingUid(profile.uid)
    setErrorMessage('')
    try {
      await updateUserActiveStatus(profile.documentId ?? profile.uid, profile.isActive === false)
      setUsers((current) => current.map((user) => user.uid === profile.uid ? { ...user, isActive: profile.isActive === false } : user))
    } catch {
      setErrorMessage('Không thể cập nhật trạng thái tài khoản.')
    } finally {
      setUpdatingUid(null)
    }
  }

  return (
    <main className="app-home">
      <header className="app-header"><strong><Sparkles size={17} /> KBT Perfume <span className="admin-badge">ADMIN</span></strong><Link className="ghost-button" to="/admin">Về dashboard</Link></header>
      <section className="admin-page-heading"><div><h1>Quản lý người dùng</h1><p>Theo dõi tài khoản, vai trò và trạng thái hoạt động của khách hàng.</p></div><button className="ghost-button" onClick={() => window.location.reload()} disabled={isLoading}><RefreshCw size={15} /> Làm mới</button></section>
      <section className="admin-panel users-admin-panel">
        {errorMessage && <p className="error-banner" role="alert">{errorMessage}</p>}
        {isLoading && <p className="empty-state">Đang tải người dùng...</p>}
        {!isLoading && !errorMessage && users.length === 0 && <div className="empty-state"><h3>Chưa có người dùng</h3><p>Tài khoản khách hàng sẽ xuất hiện ở đây.</p></div>}
        {!isLoading && !errorMessage && users.length > 0 && <div className="users-table-scroll"><table className="users-table"><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{users.map((profile, index) => { const isActive = profile.isActive !== false; const isProtected = profile.role === 'admin' || profile.uid === currentUser?.uid; return <tr key={profile.uid}><td>{users.length - index}</td><td>{profile.fullName || 'Khách hàng'}</td><td>{profile.email}</td><td>{profile.role === 'admin' ? 'Admin' : 'Khách hàng'}</td><td><span className={`user-status ${isActive ? 'active' : 'blocked'}`}>{isActive ? 'Hoạt động' : 'Đã khóa'}</span></td><td>{isProtected ? <span className="current-user-label">Tài khoản hiện tại</span> : <button className={`user-toggle-button ${isActive ? 'block' : 'unblock'}`} onClick={() => void handleToggleActive(profile)} disabled={updatingUid === profile.uid}>{isActive ? <><Lock size={14} /> Khóa</> : <><Unlock size={14} /> Mở khóa</>}</button>}</td></tr> })}</tbody></table></div>}
      </section>
    </main>
  )
}
