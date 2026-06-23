import { useState, useEffect } from 'react'
import './Checkout.css'
import { getCart, createOrder, clearCart } from '../api'
import { useAuth } from '../context/AuthContext'

function Checkout() {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money')
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    momoNumber: '',
    momoNetwork: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    const fetchCart = async () => {
      try {
        const { data } = await getCart()
        setCartItems(data)
      } catch (error) {
        console.error('Failed to fetch cart:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [user])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleSubmit = async () => {
    if (cartItems.length === 0) return
    try {
      setPlacing(true)
      const orderItems = cartItems.map(item => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || '',
        price: item.product.price,
        quantity: item.quantity,
      }))

      await createOrder({
        orderItems,
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          phone: formData.momoNumber || 'N/A',
        },
        paymentMethod,
        totalPrice: total,
      })

      await clearCart()
      setOrderPlaced(true)
    } catch (error) {
      console.error('Failed to place order:', error)
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <p style={{ textAlign: 'center', padding: '60px', letterSpacing: '2px', color: '#aaa' }}>
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="checkout-success">
        <div className="success-box">
          <div className="success-icon">✦</div>
          <p className="success-title">Order Placed!</p>
          <p className="success-sub">Thank you, {formData.firstName || 'dear customer'}. Your order is being processed.</p>
          <a href="/" className="success-btn">Back to Home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        <p className="checkout-label">Checkout</p>

        <div className="checkout-steps">
          <div className="step active">
            <div className="step-num">1</div>
            <span>Information</span>
          </div>
          <div className="step-divider" />
          <div className="step active">
            <div className="step-num">2</div>
            <span>Shipping</span>
          </div>
          <div className="step-divider" />
          <div className="step">
            <div className="step-num inactive">3</div>
            <span className="inactive">Payment</span>
          </div>
        </div>

        <div className="checkout-layout">

          <div className="checkout-form">

            <div className="form-section">
              <p className="form-section-title">Contact Information</p>
              <div className="field-full">
                <label className="field-label">Email</label>
                <input className="field-input" type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="form-section">
              <p className="form-section-title">Shipping Address</p>
              <div className="field-row">
                <div>
                  <label className="field-label">First Name</label>
                  <input className="field-input" type="text" name="firstName" placeholder="Jane" value={formData.firstName} onChange={handleChange} />
                </div>
                <div>
                  <label className="field-label">Last Name</label>
                  <input className="field-input" type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>
              <div className="field-full">
                <label className="field-label">Address</label>
                <input className="field-input" type="text" name="address" placeholder="123 Main Street" value={formData.address} onChange={handleChange} />
              </div>
              <div className="field-row">
                <div>
                  <label className="field-label">City</label>
                  <input className="field-input" type="text" name="city" placeholder="Kumasi" value={formData.city} onChange={handleChange} />
                </div>
                <div>
                  <label className="field-label">Postal Code</label>
                  <input className="field-input" type="text" name="postalCode" placeholder="00233" value={formData.postalCode} onChange={handleChange} />
                </div>
              </div>
              <div className="field-full">
                <label className="field-label">Country</label>
                <input className="field-input" type="text" name="country" placeholder="Ghana" value={formData.country} onChange={handleChange} />
              </div>
            </div>

            <div className="form-section">
              <p className="form-section-title">Payment</p>

              <div className={`pay-option ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>
                <div className="pay-radio">{paymentMethod === 'card' && <div className="pay-radio-inner" />}</div>
                <span className="pay-label">Credit / Debit Card</span>
              </div>

              <div className={`pay-option ${paymentMethod === 'Mobile Money' ? 'active' : ''}`} onClick={() => setPaymentMethod('Mobile Money')}>
                <div className="pay-radio">{paymentMethod === 'Mobile Money' && <div className="pay-radio-inner" />}</div>
                <span className="pay-label">Mobile Money</span>
              </div>

              <div className={`pay-option ${paymentMethod === 'PayPal' ? 'active' : ''}`} onClick={() => setPaymentMethod('PayPal')}>
                <div className="pay-radio">{paymentMethod === 'PayPal' && <div className="pay-radio-inner" />}</div>
                <span className="pay-label">PayPal</span>
              </div>

              {paymentMethod === 'card' && (
                <div className="payment-fields">
                  <div className="field-full">
                    <label className="field-label">Card Number</label>
                    <input className="field-input" type="text" name="cardNumber" placeholder="1234 5678 9012 3456" maxLength={19} value={formData.cardNumber} onChange={handleChange} />
                  </div>
                  <div className="field-row">
                    <div>
                      <label className="field-label">Expiry Date</label>
                      <input className="field-input" type="text" name="expiry" placeholder="MM/YY" maxLength={5} value={formData.expiry} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="field-label">CVV</label>
                      <input className="field-input" type="text" name="cvv" placeholder="123" maxLength={3} value={formData.cvv} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Mobile Money' && (
                <div className="payment-fields">
                  <div className="field-full">
                    <label className="field-label">Mobile Number</label>
                    <input className="field-input" type="text" name="momoNumber" placeholder="024 000 0000" value={formData.momoNumber} onChange={handleChange} />
                  </div>
                  <div className="field-full">
                    <label className="field-label">Network</label>
                    <select className="field-input" name="momoNetwork" value={formData.momoNetwork} onChange={handleChange}>
                      <option value="">Select network</option>
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="vodafone">Vodafone Cash</option>
                      <option value="airteltigo">AirtelTigo Money</option>
                    </select>
                  </div>
                </div>
              )}

              {paymentMethod === 'PayPal' && (
                <div className="payment-fields">
                  <p className="paypal-note">You will be redirected to PayPal to complete your payment.</p>
                </div>
              )}
            </div>

          </div>

          <div className="order-summary">
            <p className="form-section-title">Order Summary</p>
            <div className="summary-card">
              {cartItems.map(item => (
                <div className="summary-item" key={item._id}>
                  <div className="summary-item-info">
                    <span className="summary-dot">✦</span>
                    <div>
                      <p className="summary-item-name">{item.product.name}</p>
                      <p className="summary-item-variant">{item.product.material} · {item.size}</p>
                    </div>
                  </div>
                  <span className="summary-item-price">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="summary-divider" />

              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button className="place-order-btn" onClick={handleSubmit} disabled={placing}>
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>

              <div className="secure-note">
                <span className="lock-icon">🔒</span>
                Secure &amp; Encrypted Checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Checkout