import './Navbar.css'
import { FaUser, FaShoppingCart } from 'react-icons/fa'
import { FiSearch } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav>
      <div className="navbar-logo">
        <h1>MIROVA</h1>
        <p>JEWELRY</p>
      </div>
      <ul className="navbar-links">
        <li><a href="/">Home</a></li>
        <li><a href="/products?category=Earrings">Earrings</a></li>
        <li><a href="/products?category=Necklaces">Necklaces</a></li>
        <li><a href="/products?category=Rings">Rings</a></li>
        <li><a href="/virtual-try-on">Virtual Try On</a></li>
        <li><a href="/recommended">Recommended for You</a></li>
      </ul>
      <div className="navbar-actions">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>
        {user ? (
          <>
            <span style={{ fontSize: '12px', color: '#1a1a1a', letterSpacing: '1px' }}>
              Hi, {user.name.split(' ')[0]}
            </span>
            <button
              onClick={logout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#888', letterSpacing: '1px' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" className="profile-icon">
              <FaUser />
              <span className="icon-tooltip">Login</span>
            </a>
            <a href="/register" className="create-account-btn">Create Account</a>
          </>
        )}
        <a href="/cart" className="cart-icon">
          <FaShoppingCart />
          <span className="icon-tooltip">Shopping Cart</span>
        </a>
      </div>
    </nav>
  )
}

export default Navbar