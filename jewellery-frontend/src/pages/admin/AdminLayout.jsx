import './AdminLayout.css'
import { useAuth } from '../../context/AuthContext'
import { MdDashboard, MdDiamond, MdShoppingBag, MdPeople, MdLogout, MdHelp, MdMessage } from 'react-icons/md'

const navItems = [
  { label: 'Dashboard', icon: <MdDashboard />, path: '/admin' },
  { label: 'Products', icon: <MdDiamond />, path: '/admin/products' },
  { label: 'Orders', icon: <MdShoppingBag />, path: '/admin/orders' },
  { label: 'Customers', icon: <MdPeople />, path: '/admin/customers' },
  { label: 'Help Requests', icon: <MdHelp />, path: '/admin/help-requests' },
  { label: 'Messages', icon: <MdMessage />, path: '/admin/messages' },
]

function AdminLayout({ children, currentPage }) {
  const { logout } = useAuth()

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