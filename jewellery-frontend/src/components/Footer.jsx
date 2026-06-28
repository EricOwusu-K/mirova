import './Footer.css'
import { useState } from 'react'
import { FaFacebookF, FaInstagram, FaPinterestP, FaTwitter } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

function Footer() {
  const { user, logout } = useAuth()
  const [showLoginConfirm, setShowLoginConfirm] = useState(false)
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false)

  const handleLoginClick = (e) => {
    if (user) {
      e.preventDefault()
      setShowLoginConfirm(true)
    }
  }

  const handleRegisterClick = (e) => {
    if (user) {
      e.preventDefault()
      setShowRegisterConfirm(true)
    }
  }

  const handleLogoutAndLogin = () => {
    logout()
    window.location.href = '/login'
  }

  const handleLogoutAndRegister = () => {
    logout()
    window.location.href = '/register'
  }

  return (
    <>
      {/* Login confirmation modal */}
      {showLoginConfirm && (
        <div className="footer-modal-overlay">
          <div className="footer-modal">
            <p className="footer-modal-title">Already Logged In</p>
            <p className="footer-modal-msg">
              You are currently logged in as <strong>{user?.name}</strong>. Do you want to log out and switch accounts?
            </p>
            <div className="footer-modal-actions">
              <button className="footer-modal-yes" onClick={handleLogoutAndLogin}>
                Yes, Log Out
              </button>
              <button className="footer-modal-no" onClick={() => setShowLoginConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register confirmation modal */}
      {showRegisterConfirm && (
        <div className="footer-modal-overlay">
          <div className="footer-modal">
            <p className="footer-modal-title">Already Logged In</p>
            <p className="footer-modal-msg">
              You are currently logged in as <strong>{user?.name}</strong>. Do you want to log out and create a new account?
            </p>
            <div className="footer-modal-actions">
              <button className="footer-modal-yes" onClick={handleLogoutAndRegister}>
                Yes, Log Out
              </button>
              <button className="footer-modal-no" onClick={() => setShowRegisterConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <h2>MIROVA</h2>
            <p>JEWELRY</p>
            <p className="footer-tagline">Fine Jewelry For Every Day</p>
          </div>
          <div className="footer-links">
            <h4>SHOP</h4>
            <ul>
              <li><a href="/products?category=Earrings">Earrings</a></li>
              <li><a href="/products?category=Necklaces">Necklaces</a></li>
              <li><a href="/products?category=Rings">Rings</a></li>
              <li><a href="/products">Best Sellers</a></li>
              <li><a href="/products">New Arrivals</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>EXPLORE</h4>
            <ul>
              <li><a href="/virtual-try-on">Virtual Try On</a></li>
              <li><a href="/recommended">Recommended for You</a></li>
              <li><a href="/cart">Shopping Cart</a></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>ACCOUNT</h4>
            <ul>
              <li>
                <a href="/login" onClick={handleLoginClick}>Login</a>
              </li>
              <li>
                <a href="/register" onClick={handleRegisterClick}>Create Account</a>
              </li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>COMPANY</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/help">Help Center</a></li>
            </ul>
          </div>
          <div className="footer-social">
            <h4>FOLLOW US</h4>
            <div className="social-icons">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaPinterestP /></a>
              <a href="#"><FaTwitter /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Mirova Jewelry. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  )
}

export default Footer