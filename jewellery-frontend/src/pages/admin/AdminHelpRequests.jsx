import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import './AdminHelpRequests.css'

function AdminHelpRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token

  const fetchRequests = async () => {
    try {
      const res = await fetch('https://mirova-backend-production.up.railway.app/api/help', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setRequests(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch help requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  const updateStatus = async (id, status) => {
    try {
      await fetch(`https://mirova-backend-production.up.railway.app/api/help/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      setMessage('Request status updated!')
      fetchRequests()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update request:', error)
    }
  }

  const typeLabel = (type) => {
    const map = {
      complaint: 'Complaint',
      refund: 'Refund Request',
      track: 'Order Tracking',
      inquiry: 'General Inquiry',
    }
    return map[type] || type
  }

  const typeClass = (type) => {
    const map = {
      complaint: 'type-complaint',
      refund: 'type-refund',
      track: 'type-track',
      inquiry: 'type-inquiry',
    }
    return map[type] || ''
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Help Requests">
        <p className="admin-loading">Loading...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Help Requests">

      <div className="admin-help-header">
        <p className="admin-page-title">HELP REQUESTS</p>
        <span className="admin-help-count">{requests.length} {requests.length === 1 ? 'request' : 'requests'}</span>
      </div>

      {message && <div className="admin-success-msg">{message}</div>}

      {requests.length === 0 ? (
        <p className="admin-no-requests">No help requests yet.</p>
      ) : (
        requests.map(req => (
          <div key={req._id} className="help-req-card">

            <div className="help-req-top">
              <div>
                <p className="help-req-name">{req.user?.name || 'Unknown'}</p>
                <p className="help-req-email">{req.user?.email || ''}</p>
                <p className="help-req-date">{new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="help-req-right">
                <span className={`help-req-type ${typeClass(req.type)}`}>{typeLabel(req.type)}</span>
                <span className={`help-req-status ${req.status === 'resolved' ? 'status-resolved' : 'status-open'}`}>
                  {req.status}
                </span>
              </div>
            </div>

            {req.orderId && (
              <p className="help-req-orderid">Order ID: #{req.orderId}</p>
            )}

            <p className="help-req-subject">{req.subject}</p>
            <p className="help-req-message">{req.message}</p>

            <div className="help-req-footer">
              {req.status === 'open' ? (
                <button className="help-req-resolve-btn" onClick={() => updateStatus(req._id, 'resolved')}>
                  Mark as Resolved
                </button>
              ) : (
                <button className="help-req-reopen-btn" onClick={() => updateStatus(req._id, 'open')}>
                  Reopen
                </button>
              )}
              <a href="/admin/messages" className="help-req-reply-btn">
                Reply via Message →
              </a>
            </div>

          </div>
        ))
      )}

    </AdminLayout>
  )
}

export default AdminHelpRequests