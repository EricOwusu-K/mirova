import { useState, useEffect } from 'react'
import './Checkout.css'
import { getCart, createOrder, clearCart } from '../api'
import { useAuth } from '../context/AuthContext'

const countryData = {
  Ghana: ['Ashanti Region', 'Greater Accra', 'Western Region', 'Eastern Region', 'Northern Region', 'Central Region', 'Volta Region', 'Upper East', 'Upper West', 'Bono Region'],
  Nigeria: ['Lagos', 'Abuja (FCT)', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Anambra', 'Enugu', 'Delta', 'Ogun'],
  Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega'],
  'South Africa': ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape'],
  'United States': ['Alabama', 'Alaska', 'Arizona', 'California', 'Colorado', 'Florida', 'Georgia', 'Illinois', 'New York', 'Texas'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick'],
  Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'],
  Germany: ['Bavaria', 'Berlin', 'Hamburg', 'Hesse', 'North Rhine-Westphalia', 'Saxony', 'Baden-Württemberg'],
  France: ['Île-de-France', 'Provence', 'Auvergne-Rhône-Alpes', 'Normandy', 'Brittany', 'Occitanie'],
  Other: [],
}

const countries = Object.keys(countryData)

const PAYSTACK_PUBLIC_KEY = 'pk_test_0f1f3a78d0cd4d48c87fd619951664ce4f46905a'

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
    region: '',
    postalCode: '',
    country: '',
    phone: '',
    momoNumber: '',
    momoNetwork: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })
  const [errors, setErrors] = useState({})
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
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'country' ? { region: '' } : {}),
    }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const regions = formData.country ? (countryData[formData.country] || []) : []

  const validate = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.country) newErrors.country = 'Please select a country'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    return newErrors
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  // ── Called after Paystack confirms payment ──
  const placeOrderAfterPayment = async (reference) => {
    try {
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
          address: `${formData.address}${formData.region ? ', ' + formData.region : ''}, ${formData.country}`,
          city: formData.city,
          phone: formData.phone || formData.momoNumber || 'N/A',
        },
        paymentMethod,
        totalPrice: total,
        paymentReference: reference,
        isPaid: true,
      })

      await clearCart()
      setOrderPlaced(true)
    } catch (error) {
      console.error('Failed to place order:', error)
    } finally {
      setPlacing(false)
    }
  }

  const handleSubmit = async () => {
    if (cartItems.length === 0) return
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setPlacing(true)

    // Load Paystack inline script dynamically
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    document.body.appendChild(script)

    script.onload = () => {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: formData.email,
        amount: Math.round(total * 100), // Paystack uses pesewas (100 = GH₵1)
        currency: 'GHS',
        channels: paymentMethod === 'Mobile Money'
          ? ['mobile_money']
          : paymentMethod === 'card'
          ? ['card']
          : ['card', 'mobile_money'],
        metadata: {
          custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: `${formData.firstName} ${formData.lastName}` },
            { display_name: 'Phone', variable_name: 'phone', value: formData.phone },
          ]
        },
        // Mobile Money specific
        ...(paymentMethod === 'Mobile Money' && formData.momoNumber && {
          phone: formData.momoNumber,
          mobile_money: {
            phone: formData.momoNumber,
            provider: formData.momoNetwork || 'mtn',
          }
        }),
        callback: function(response) {
          // Payment successful — now create the order
          placeOrderAfterPayment(response.reference)
        },
        onClose: function() {
          // Customer closed the popup without paying
          setPlacing(false)
        }
      })
      handler.openIframe()
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
                <input className={`field-input ${errors.email ? 'field-input-error' : ''}`} type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} />
                {errors.email && <p className="checkout-field-error">{errors.email}</p>}
              </div>
            </div>

            <div className="form-section">
              <p className="form-section-title">Shipping Address</p>

              <div className="field-row">
                <div>
                  <label className="field-label">First Name</label>
                  <input className={`field-input ${errors.firstName ? 'field-input-error' : ''}`} type="text" name="firstName" placeholder="Jane" value={formData.firstName} onChange={handleChange} />
                  {errors.firstName && <p className="checkout-field-error">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="field-label">Last Name</label>
                  <input className={`field-input ${errors.lastName ? 'field-input-error' : ''}`} type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} />
                  {errors.lastName && <p className="checkout-field-error">{errors.lastName}</p>}
                </div>
              </div>

              <div className="field-full">
                <label className="field-label">Country</label>
                <select className={`field-input ${errors.country ? 'field-input-error' : ''}`} name="country" value={formData.country} onChange={handleChange}>
                  <option value="">Select your country</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.country && <p className="checkout-field-error">{errors.country}</p>}
              </div>

              {formData.country && regions.length > 0 && (
                <div className="field-full">
                  <label className="field-label">Region / State</label>
                  <select className="field-input" name="region" value={formData.region} onChange={handleChange}>
                    <option value="">Select region / state</option>
                    {regions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="field-full">
                <label className="field-label">Street Address</label>
                <input className={`field-input ${errors.address ? 'field-input-error' : ''}`} type="text" name="address" placeholder="House number and street name" value={formData.address} onChange={handleChange} />
                {errors.address && <p className="checkout-field-error">{errors.address}</p>}
              </div>

              <div className="field-row">
                <div>
                  <label className="field-label">City</label>
                  <input className={`field-input ${errors.city ? 'field-input-error' : ''}`} type="text" name="city" placeholder="e.g. Kumasi" value={formData.city} onChange={handleChange} />
                  {errors.city && <p className="checkout-field-error">{errors.city}</p>}
                </div>
                <div>
                  <label className="field-label">Postal Code</label>
                  <input className="field-input" type="text" name="postalCode" placeholder="Optional" value={formData.postalCode} onChange={handleChange} />
                </div>
              </div>

              <div className="field-full">
                <label className="field-label">Phone Number</label>
                <input className={`field-input ${errors.phone ? 'field-input-error' : ''}`} type="text" name="phone" placeholder="e.g. 024 000 0000" value={formData.phone} onChange={handleChange} />
                {errors.phone && <p className="checkout-field-error">{errors.phone}</p>}
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
                  <p className="paypal-note">You will be redirected to Paystack to enter your card details securely.</p>
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
                  <p className="paypal-note">You will be redirected to Paystack to complete your payment.</p>
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
                {placing ? 'Processing Payment...' : 'Place Order'}
              </button>

              <div className="secure-note">
                <span className="lock-icon">🔒</span>
                Secure &amp; Encrypted Checkout via Paystack
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Checkout