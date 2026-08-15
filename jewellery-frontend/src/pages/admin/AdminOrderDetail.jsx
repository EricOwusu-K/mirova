import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import './AdminOrderDetail.css'

function AdminOrderDetail() {
  const orderId = window.location.pathname.split('/').pop()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`https://mirova-backend.onrender.com/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setOrder(data)
        setSelectedStatus(data.status)
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  const handleUpdateStatus = async () => {
    setUpdating(true)
    try {
      await fetch(`https://mirova-backend.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: selectedStatus }),
      })
      setOrder(prev => ({ ...prev, status: selectedStatus }))
      setMessage('Order status updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Orders">
        <p className="admin-loading">Loading...</p>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout currentPage="Orders">
        <p className="admin-loading">Order not found.</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Orders">

      <a href="/admin/orders" className="admin-od-back">← Back to Orders</a>

      <div className="admin-od-header">
        <p className="admin-page-title">Order Details</p>
        <p className="admin-od-id">Order #{order._id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {message && <div className="admin-success-msg">{message}</div>}

      <div className="admin-od-grid">
        <div className="admin-od-card">
          <p className="admin-od-card-title">Customer Info</p>
          <div className="admin-od-row">
            <span className="admin-od-label">Name</span>
            <span className="admin-od-value">{order.user?.name || order.shippingAddress.fullName}</span>
          </div>
          <div className="admin-od-row">
            <span className="admin-od-label">Email</span>
            <span className="admin-od-value">{order.user?.email || '—'}</span>
          </div>
          <div className="admin-od-row">
            <span className="admin-od-label">Phone</span>
            <span className="admin-od-value">{order.shippingAddress.phone}</span>
          </div>
        </div>

        <div className="admin-od-card">
          <p className="admin-od-card-title">Shipping Address</p>
          <div className="admin-od-row">
            <span className="admin-od-label">Full Name</span>
            <span className="admin-od-value">{order.shippingAddress.fullName}</span>
          </div>
          <div className="admin-od-row">
            <span className="admin-od-label">Address</span>
            <span className="admin-od-value">{order.shippingAddress.address}</span>
          </div>
          <div className="admin-od-row">
            <span className="admin-od-label">City</span>
            <span className="admin-od-value">{order.shippingAddress.city}</span>
          </div>
          <div className="admin-od-row">
            <span className="admin-od-label">Phone</span>
            <span className="admin-od-value">{order.shippingAddress.phone}</span>
          </div>
        </div>
      </div>

      <div className="admin-od-card" style={{ marginBottom: '14px' }}>
        <p className="admin-od-card-title">Order Items</p>
        {order.orderItems.map((item, i) => (
          <div key={i} className="admin-od-item-row">
            <span className="admin-od-item-name">{item.name}</span>
            <span className="admin-od-item-qty">× {item.quantity}</span>
            <span className="admin-od-item-price">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="admin-od-total-row">
          <span className="admin-od-total-label">Total</span>
          <span className="admin-od-total-val">${order.totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="admin-od-card">
        <p className="admin-od-card-title">Order Status</p>
        <div className="admin-od-row">
          <span className="admin-od-label">Payment Method</span>
          <span className="admin-od-value">{order.paymentMethod}</span>
        </div>
        <div className="admin-od-row">
          <span className="admin-od-label">Current Status</span>
          <span className={`admin-status-pill ${order.status}`}>{order.status}</span>
        </div>
        <div className="admin-od-status-row">
          <select
            className="admin-od-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            className="admin-od-update-btn"
            onClick={handleUpdateStatus}
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>

    </AdminLayout>
  )
}

export default AdminOrderDetail