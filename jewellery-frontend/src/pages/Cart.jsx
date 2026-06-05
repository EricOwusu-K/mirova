import { useState } from 'react'
import './Cart.css'

const initialItems = [
  {
    id: 1,
    name: 'Gold Chain Bracelet',
    variant: '18K Gold · Delicate',
    price: 120.00,
    quantity: 1,
    image: null
  },
  {
    id: 2,
    name: 'Pearl Drop Earrings',
    variant: 'Sterling Silver · Classic',
    price: 85.00,
    quantity: 2,
    image: null
  },
  {
    id: 3,
    name: 'Diamond Ring',
    variant: '14K White Gold · Fine',
    price: 340.00,
    quantity: 1,
    image: null
  }
]

function Cart() {
  const [items, setItems] = useState(initialItems)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  const updateQuantity = (id, delta) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax
  const discount = promoApplied ? subtotal * 0.1 : 0

  const handlePromo = () => {
    if (promoCode.trim().toLowerCase() === 'mirova10') {
      setPromoApplied(true)
    }
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
                <div className="cart-item" key={item.id}>
                  <div className="item-left">
                    <div className="item-image">
                      {item.image
                        ? <img src={item.image} alt={item.name} />
                        : <span className="item-placeholder">✦</span>
                      }
                    </div>
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      <p className="item-variant">{item.variant}</p>
                      <button
                        className="item-remove"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="item-qty">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>−</button>
                    <span className="qty-num">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                  </div>

                  <div className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
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
              <span>${(total - discount).toFixed(2)}</span>
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
