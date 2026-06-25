import { useState, useEffect, useRef } from 'react'
import './Navbar.css'
import { FaUser, FaShoppingCart, FaBell, FaSignOutAlt, FaBoxOpen, FaUserEdit } from 'react-icons/fa'
import { FiSearch } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { getCart } from '../api'

function Navbar() {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const dropdownRef = useRef(null)

  // Fetch cart count
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
      fetchCartCount()
    } else {
      setCartCount(0)
    }
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
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
              <button
                className="navbar-profile-btn"
                onClick={() => setDropdownOpen(prev => !prev)}
              >
                <span className="navbar-hi">Hi, {user.name.split(' ')[0]}</span>
                <FaUser className="navbar-icon" />
              </button>

              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <p className="navbar-dropdown-name">{user.name}</p>
                    <p className="navbar-dropdown-email">{user.email}</p>
                  </div>
                  <a href="/notifications" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FaBell className="dropdown-item-icon" />
                    <span>Notifications</span>
                  </a>
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