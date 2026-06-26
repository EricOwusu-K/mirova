import './Footer.css'
import { FaFacebookF, FaInstagram, FaPinterestP, FaTwitter } from 'react-icons/fa'

function Footer() {
  return (
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
            <li><a href="/login">Login</a></li>
            <li><a href="/register">Create Account</a></li>
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
  )
}

export default Footer