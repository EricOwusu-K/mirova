import { useState } from 'react'
import './Help.css'
import { useAuth } from '../context/AuthContext'

const helpOptions = [
  {
    id: 'complaint',
    title: 'Report a Complaint',
    desc: 'Tell us about an issue with your order',
    icon: '📋',
  },
  {
    id: 'refund',
    title: 'Ask for a Refund',
    desc: 'Request a return or refund on your order',
    icon: '↩️',
  },
  {
    id: 'track',
    title: 'Track My Order',
    desc: 'Check the status of your delivery',
    icon: '📦',
  },
  {
    id: 'inquiry',
    title: 'General Inquiry',
    desc: 'Ask us anything about Mirova',
    icon: '💬',
  },
]

function Help() {
  const { user } = useAuth()
  const [selected, setSelected] = useState(null)
  const [formData, setFormData] = useState({ subject: '', message: '', orderId: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSelect = (id) => {
    setSelected(id)
    setSubmitted(false)
    setError('')
    setFormData({ subject: '', message: '', orderId: '' })
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    if (!formData.subject.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    try {
      setLoading(true)
      const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token
      const res = await fetch('https://mirova-backend.onrender.com/api/help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: selected,
          subject: formData.subject,
          message: formData.message,
          orderId: formData.orderId,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Failed to submit. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedOption = helpOptions.find(o => o.id === selected)

  return (
    <div className="help-page">
      <div className="help-container">

        <p className="help-label">Support</p>
        <h1 className="help-title">Help Center</h1>
        <p className="help-sub">How can we help you today?</p>

        <div className="help-grid">
          {helpOptions.map(option => (
            <div
              key={option.id}
              className={`help-card ${selected === option.id ? 'active' : ''}`}
              onClick={() => handleSelect(option.id)}
            >
              <div className="help-card-left">
                <div>
                  <p className="help-card-title">{option.title}</p>
                  <p className="help-card-desc">{option.desc}</p>
                </div>
              </div>
              <span className="help-card-arrow">→</span>
            </div>
          ))}
        </div>

        {selected && !submitted && (
          <div className="help-form">
            <p className="help-form-title">{selectedOption?.title}</p>

            {error && (
              <div className="help-error-box">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {(selected === 'complaint' || selected === 'refund' || selected === 'track') && (
              <div className="help-field">
                <label className="help-field-label">Order ID (optional)</label>
                <input
                  className="help-field-input"
                  type="text"
                  name="orderId"
                  placeholder="e.g. 6A2D64AA"
                  value={formData.orderId}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="help-field">
              <label className="help-field-label">Subject *</label>
              <input
                className="help-field-input"
                type="text"
                name="subject"
                placeholder="Brief summary of your issue"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>

            <div className="help-field">
              <label className="help-field-label">Message *</label>
              <textarea
                className="help-field-textarea"
                name="message"
                placeholder="Please describe your issue in detail..."
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            {!user && (
              <p className="help-login-note">
                You need to <a href="/login">sign in</a> to submit a request.
              </p>
            )}

            <button className="help-submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        )}

        {submitted && (
          <div className="help-success">
            <p className="help-success-icon">✦</p>
            <p className="help-success-title">Request Submitted</p>
            <p className="help-success-sub">
              Thank you for reaching out. Our team will review your request and get back to you shortly.
            </p>
            <button className="help-submit-btn" onClick={() => { setSelected(null); setSubmitted(false) }}>
              Submit Another Request
            </button>
          </div>
        )}

        <div className="help-divider" />

        <p className="help-contact-title">Contact Us Directly</p>
        <div className="help-contact-box">
          <div>
            <p className="help-contact-text">Email Us</p>
            <p className="help-contact-sub">support@mirova.com · We reply within 24 hours</p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Help