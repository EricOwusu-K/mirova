import { useState, useEffect, useRef } from 'react'
import './Navbar.css'
import { FaUser, FaShoppingCart, FaBell, FaSignOutAlt, FaBoxOpen, FaUserEdit } from 'react-icons/fa'
import { FiSearch } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { getCart, getNotifications, markAllAsRead } from '../api'

function Navbar() {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const dropdownRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.isRead).length

  useEffect(() => {
    if (user) {
      const fetchCartCount = async () => {
        try {
          const { data } = await getCart()
          setCartCount(data.length)
        } catch (err) {
          console.error('Failed to fetch cart count:', err)
        }
      }
      const fetchNotifications = async () => {
        try {
          const { data } = await getNotifications()
          setNotifications(data)
        } catch (err) {
          console.error('Failed to fetch notifications:', err)
        }
      }
      fetchCartCount()
      fetchNotifications()
    } else {
      setCartCount(0)
      setNotifications([])
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const handleNotifOpen = () => {
    setNotifOpen(prev => !prev)
    setDropdownOpen(false)
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <nav>
      <div className="navbar-logo">
        <h1>MIROVA</h1>
        <p>JEWELRY</p>
      </div>

      <ul className="navbar-links">
        <li><a href="/">Home</a></li>
        <li><a href="/products">All Products</a></li>
        <li><a href="/virtual-try-on">Virtual Try On</a></li>
        <li><a href="/recommended">Recommended For You</a></li>
        <li><a href="/help">Help</a></li>
      </ul>

      <div className="navbar-actions">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>

        {user ? (
          <>
            <a href="/cart" className="navbar-cart-wrap">
              <FaShoppingCart className="navbar-icon" />
              {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
            </a>

            <div className="navbar-profile-wrap" ref={dropdownRef}>

              {/* Profile button with notification count badge */}
              <button
                className="navbar-profile-btn"
                onClick={() => { setDropdownOpen(prev => !prev); setNotifOpen(false) }}
              >
                <span className="navbar-hi">Hi, {user.name.split(' ')[0]}</span>
                <div className="navbar-profile-icon-wrap">
                  <FaUser className="navbar-icon" />
                  {unreadCount > 0 && (
                    <span className="navbar-notif-count">{unreadCount}</span>
                  )}
                </div>
              </button>

              {/* Profile dropdown */}
              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <p className="navbar-dropdown-name">{user.name}</p>
                    <p className="navbar-dropdown-email">{user.email}</p>
                  </div>
                  <button className="navbar-dropdown-item" onClick={handleNotifOpen}>
                    <FaBell className="dropdown-item-icon" />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="dropdown-notif-count">{unreadCount}</span>
                    )}
                  </button>
                  <a href="/orders" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FaBoxOpen className="dropdown-item-icon" />
                    <span>My Orders</span>
                  </a>
                  <a href="/profile" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FaUserEdit className="dropdown-item-icon" />
                    <span>Edit Profile</span>
                  </a>
                  <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout}>
                    <FaSignOutAlt className="dropdown-item-icon" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* Notifications panel */}
              {notifOpen && (
                <div className="navbar-notif-panel">
                  <div className="notif-panel-header">
                    <p className="notif-panel-title">Notifications</p>
                    {unreadCount > 0 && (
                      <button className="notif-mark-all" onClick={handleMarkAllRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="notif-empty">No notifications yet</p>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif._id} className={`notif-item ${!notif.isRead ? 'unread' : ''}`}>
                        <div className={`notif-dot ${notif.isRead ? 'read' : ''}`} />
                        <div className="notif-content">
                          <p className="notif-title">{notif.title}</p>
                          <p className="notif-msg">{notif.message}</p>
                          <p className="notif-time">{timeAgo(notif.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <a href="/orders" className="notif-view-all" onClick={() => setNotifOpen(false)}>
                    View All Orders →
                  </a>
                </div>
              )}

            </div>
          </>
        ) : (
          <>
            <a href="/login" className="profile-icon">
              <FaUser />
              <span className="icon-tooltip">Login</span>
            </a>
            <a href="/register" className="create-account-btn">Create Account</a>
            <a href="/cart" className="cart-icon">
              <FaShoppingCart />
              <span className="icon-tooltip">Shopping Cart</span>
            </a>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar