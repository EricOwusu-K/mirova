import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import './AdminOrders.css'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [message, setMessage] = useState('')

  const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token

  const fetchOrders = async () => {
    try {
      const res = await fetch('https://mirova-backend.onrender.com/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await fetch(`https://mirova-backend.onrender.com/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      setMessage('Order status updated!')
      fetchOrders()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update order:', error)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Orders">
        <p className="admin-loading">Loading...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Orders">

      <div className="admin-orders-header">
        <p className="admin-page-title">MANAGE ORDERS</p>
      </div>

      {message && <div className="admin-success-msg">{message}</div>}

      {orders.length === 0 ? (
        <p className="admin-no-orders">No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="admin-order-card">

            <div className="admin-order-top">
              <div>
                <p className="admin-order-id">ORDER #{order._id.slice(-8).toUpperCase()}</p>
                <p className="admin-order-name">{order.shippingAddress.fullName}</p>
                <p className="admin-order-meta">{order.shippingAddress.city} · {order.paymentMethod}</p>
              </div>
              <div className="admin-order-right">
                <p className="admin-order-total">${order.totalPrice.toFixed(2)}</p>
                <p className="admin-order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="admin-order-items">
              {order.orderItems.map((item, i) => (
                <p key={i} className="admin-order-item">
                  {item.name} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}
                </p>
              ))}
            </div>

            <div className="admin-order-status-row">
              <span className={`admin-status-pill ${order.status}`}>
                {order.status}
              </span>
              <select
                className="admin-status-select"
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
                disabled={updating === order._id}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {updating === order._id && (
                <span className="admin-updating-text">Updating...</span>
              )}
              <a href={`/admin/orders/${order._id}`} className="admin-order-view-link">
                View Details →
              </a>
            </div>

          </div>
        ))
      )}

    </AdminLayout>
  )
}

export default AdminOrders