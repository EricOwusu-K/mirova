import { useState, useEffect } from 'react'
import './Cart.css'
import { getCart, updateCartItem, removeFromCart } from '../api'
import { useAuth } from '../context/AuthContext'

function Cart() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  useEffect(() => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    const fetchCart = async () => {
      try {
        const { data } = await getCart()
        setItems(data)
      } catch (error) {
        console.error('Failed to fetch cart:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [user])

  const updateQuantity = async (item, delta) => {
    const newQty = item.quantity + delta
    if (newQty < 1) return
    try {
      const { data } = await updateCartItem(item.product._id, newQty, item.size)
      setItems(data)
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  const removeItem = async (item) => {
    try {
      const { data } = await removeFromCart(item.product._id, item.size)
      setItems(data)
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const discount = promoApplied ? subtotal * 0.1 : 0
  const total = subtotal + tax - discount

  const handlePromo = () => {
    if (promoCode.trim().toLowerCase() === 'mirova10') {
      setPromoApplied(true)
    }
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <p style={{ textAlign: 'center', padding: '60px', letterSpacing: '2px', color: '#aaa' }}>
            Loading cart...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-container">

        <div className="cart-heading">
          <p className="cart-label">Shopping Cart</p>
          <span className="cart-count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>

        <div className="cart-layout">

          <div className="cart-items">
            <div className="items-header">
              <span>Product</span>
              <span>Quantity</span>
              <span>Price</span>
            </div>

            {items.length === 0 ? (
              <div className="cart-empty">
                <p>Your cart is empty.</p>
                <a href="/products" className="empty-link">Continue Shopping</a>
              </div>
            ) : (
              items.map(item => (
                <div className="cart-item" key={item._id}>
                  <div className="item-left">
                    <div className="item-image">
                      {item.product.images && item.product.images.length > 0
                        ? <img src={item.product.images[0]} alt={item.product.name} />
                        : <span className="item-placeholder">✦</span>
                      }
                    </div>
                    <div className="item-info">
                      <p className="item-name">{item.product.name}</p>
                      <p className="item-variant">{item.product.material} · {item.size}</p>
                      <button className="item-remove" onClick={() => removeItem(item)}>
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="item-qty">
                    <button className="qty-btn" onClick={() => updateQuantity(item, -1)}>−</button>
                    <span className="qty-num">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item, 1)}>+</button>
                  </div>

                  <div className="item-price">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}

            <a href="/products" className="continue-link">← Continue Shopping</a>
          </div>

          <div className="cart-summary">
            <p className="summary-title">Order Summary</p>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div className="summary-row discount">
                  <span>Discount (10%)</span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <a href="/checkout" className="checkout-btn">Proceed to Checkout</a>

            <div className="promo-section">
              <p className="promo-label">Promo Code</p>
              <div className="promo-row">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="promo-input"
                />
                <button className="promo-btn" onClick={handlePromo}>Apply</button>
              </div>
              {promoApplied && (
                <p className="promo-success">Code applied successfully!</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Cart