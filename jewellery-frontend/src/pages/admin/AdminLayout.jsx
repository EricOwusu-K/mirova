import { useState, useEffect } from 'react'
import './AdminLayout.css'
import { useAuth } from '../../context/AuthContext'
import { MdDashboard, MdDiamond, MdShoppingBag, MdPeople, MdLogout, MdHelp, MdMessage } from 'react-icons/md'

function AdminLayout({ children, currentPage }) {
  const { logout } = useAuth()
  const [openRequestsCount, setOpenRequestsCount] = useState(0)

  const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token

  useEffect(() => {
    const fetchOpenRequests = async () => {
      try {
        const res = await fetch('https://mirova-backend.onrender.com/api/help', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          const openCount = data.filter(r => r.status === 'open').length
          setOpenRequestsCount(openCount)
        }
      } catch (error) {
        console.error('Failed to fetch help requests count:', error)
      }
    }
    fetchOpenRequests()
  }, [currentPage])

  const navItems = [
    { label: 'Dashboard', icon: <MdDashboard />, path: '/admin' },
    { label: 'Products', icon: <MdDiamond />, path: '/admin/products' },
    { label: 'Orders', icon: <MdShoppingBag />, path: '/admin/orders' },
    { label: 'Customers', icon: <MdPeople />, path: '/admin/customers' },
    { label: 'Help Requests', icon: <MdHelp />, path: '/admin/help-requests', count: openRequestsCount },
    { label: 'Messages', icon: <MdMessage />, path: '/admin/messages' },
  ]

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <p>MIROVA</p>
          <span>ADMIN PANEL</span>
        </div>
        {navItems.map(item => (
          <a key={item.path} href={item.path} className={`admin-nav-item ${currentPage === item.label ? 'active' : ''}`}>
            <span className="admin-nav-icon">{item.icon}</span>
            {item.label}
            {item.count > 0 && (
              <span className="admin-nav-badge">{item.count}</span>
            )}
          </a>
        ))}
        <button className="admin-logout-btn" onClick={logout}>
          <MdLogout /> Logout
        </button>
      </div>
      <div className="admin-main">
        {children}
      </div>
    </div>
  )
}

export default AdminLayout