import { useState } from 'react'
import './Checkout.css'

const orderItems = [
  { id: 1, name: 'Gold Chain Bracelet', variant: '18K Gold · Delicate', price: 120.00, quantity: 1 },
  { id: 2, name: 'Pearl Drop Earrings', variant: 'Sterling Silver · Classic', price: 85.00, quantity: 2 },
  { id: 3, name: 'Diamond Ring', variant: '14K White Gold · Fine', price: 340.00, quantity: 1 }
]

function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    momoNumber: '',
    momoNetwork: ''
  })
  const [orderPlaced, setOrderPlaced] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleSubmit = () => {
    setOrderPlaced(true)
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

            {/* Contact */}
            <div className="form-section">
              <p className="form-section-title">Contact Information</p>
              <div className="field-full">
                <label className="field-label">Email</label>
                <input
                  className="field-input"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Shipping */}
            <div className="form-section">
              <p className="form-section-title">Shipping Address</p>
              <div className="field-row">
                <div>
                  <label className="field-label">First Name</label>
                  <input
                    className="field-input"
                    type="text"
                    name="firstName"
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="field-label">Last Name</label>
                  <input
                    className="field-input"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="field-full">
                <label className="field-label">Address</label>
                <input
                  className="field-input"
                  type="text"
                  name="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="field-row">
                <div>
                  <label className="field-label">City</label>
                  <input
                    className="field-input"
                    type="text"
                    name="city"
                    placeholder="Kumasi"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="field-label">Postal Code</label>
                  <input
                    className="field-input"
                    type="text"
                    name="postalCode"
                    placeholder="00233"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="field-full">
                <label className="field-label">Country</label>
                <input
                  className="field-input"
                  type="text"
                  name="country"
                  placeholder="Ghana"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Payment */}
            <div className="form-section">
              <p className="form-section-title">Payment</p>

              <div
                className={`pay-option ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="pay-radio">
                  {paymentMethod === 'card' && <div className="pay-radio-inner" />}
                </div>
                <span className="pay-label">Credit / Debit Card</span>
              </div>

              <div
                className={`pay-option ${paymentMethod === 'momo' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('momo')}
              >
                <div className="pay-radio">
                  {paymentMethod === 'momo' && <div className="pay-radio-inner" />}
                </div>
                <span className="pay-label">Mobile Money</span>
              </div>

              <div
                className={`pay-option ${paymentMethod === 'paypal' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <div className="pay-radio">
                  {paymentMethod === 'paypal' && <div className="pay-radio-inner" />}
                </div>
                <span className="pay-label">PayPal</span>
              </div>

              {paymentMethod === 'card' && (
                <div className="payment-fields">
                  <div className="field-full">
                    <label className="field-label">Card Number</label>
                    <input
                      className="field-input"
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={formData.cardNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field-row">
                    <div>
                      <label className="field-label">Expiry Date</label>
                      <input
                        className="field-input"
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={formData.expiry}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="field-label">CVV</label>
                      <input
                        className="field-input"
                        type="text"
                        name="cvv"
                        placeholder="123"
                        maxLength={3}
                        value={formData.cvv}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'momo' && (
                <div className="payment-fields">
                  <div className="field-full">
                    <label className="field-label">Mobile Number</label>
                    <input
                      className="field-input"
                      type="text"
                      name="momoNumber"
                      placeholder="024 000 0000"
                      value={formData.momoNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field-full">
                    <label className="field-label">Network</label>
                    <select
                      className="field-input"
                      name="momoNetwork"
                      value={formData.momoNetwork}
                      onChange={handleChange}
                    >
                      <option value="">Select network</option>
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="vodafone">Vodafone Cash</option>
                      <option value="airteltigo">AirtelTigo Money</option>
                    </select>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="payment-fields">
                  <p className="paypal-note">You will be redirected to PayPal to complete your payment.</p>
                </div>
              )}
            </div>

          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <p className="form-section-title">Order Summary</p>
            <div className="summary-card">
              {orderItems.map(item => (
                <div className="summary-item" key={item.id}>
                  <div className="summary-item-info">
                    <span className="summary-dot">✦</span>
                    <div>
                      <p className="summary-item-name">{item.name}</p>
                      <p className="summary-item-variant">{item.variant}</p>
                    </div>
                  </div>
                  <span className="summary-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
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

              <button className="place-order-btn" onClick={handleSubmit}>
                Place Order
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
