import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import './AdminMessages.css'

function AdminMessages() {
  const [customers, setCustomers] = useState([])
  const [sentMessages, setSentMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    customerId: '',
    subject: '',
    messageText: '',
  })

  const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token

  const fetchCustomers = async () => {
    try {
      const res = await fetch('https://mirova-backend-production.up.railway.app/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data.filter(u => u.role === 'user') : [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  const fetchSentMessages = async () => {
    try {
      const res = await fetch('https://mirova-backend-production.up.railway.app/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setSentMessages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
    fetchSentMessages()
  }, [])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSend = async () => {
    if (!formData.customerId || !formData.subject || !formData.messageText) {
      setMessage('Please fill in all fields.')
      setTimeout(() => setMessage(''), 3000)
      return
    }
    setSending(true)
    try {
      const res = await fetch('https://mirova-backend-production.up.railway.app/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          recipientId: formData.customerId,
          subject: formData.subject,
          messageText: formData.messageText,
        }),
      })
      if (res.ok) {
        setMessage('Message sent successfully!')
        setFormData({ customerId: '', subject: '', messageText: '' })
        fetchSentMessages()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessage('Failed to send message. Please try again.')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Messages">
        <p className="admin-loading">Loading...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Messages">

      <div className="admin-messages-header">
        <p className="admin-page-title">MESSAGES</p>
      </div>

      {message && (
        <div className={`admin-msg-feedback ${message.includes('Failed') || message.includes('Please') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="admin-compose-card">
        <p className="admin-compose-title">Send a Message to Customer</p>

        <div className="admin-compose-field">
          <label className="admin-compose-label">Select Customer</label>
          <select
            className="admin-compose-select"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
          >
            <option value="">Choose a customer...</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name} — {customer.email}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-compose-field">
          <label className="admin-compose-label">Subject</label>
          <input
            className="admin-compose-input"
            type="text"
            name="subject"
            placeholder="e.g. Your refund has been processed"
            value={formData.subject}
            onChange={handleChange}
          />
        </div>

        <div className="admin-compose-field">
          <label className="admin-compose-label">Message</label>
          <textarea
            className="admin-compose-textarea"
            name="messageText"
            placeholder="Type your message here..."
            value={formData.messageText}
            onChange={handleChange}
          />
        </div>

        <button className="admin-send-btn" onClick={handleSend} disabled={sending}>
          {sending ? 'Sending...' : 'Send Message'}
        </button>
      </div>

      <p className="admin-sent-title">SENT MESSAGES</p>

      {sentMessages.length === 0 ? (
        <p className="admin-no-messages">No messages sent yet.</p>
      ) : (
        sentMessages.map(msg => (
          <div key={msg._id} className="admin-sent-card">
            <div className="admin-sent-top">
              <div>
                <p className="admin-sent-to">To: {msg.recipient?.name || 'Unknown'}</p>
                <p className="admin-sent-email">{msg.recipient?.email || ''}</p>
              </div>
              <p className="admin-sent-date">
                {new Date(msg.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <p className="admin-sent-subject">{msg.subject}</p>
            <p className="admin-sent-msg">{msg.messageText}</p>
          </div>
        ))
      )}

    </AdminLayout>
  )
}

export default AdminMessages