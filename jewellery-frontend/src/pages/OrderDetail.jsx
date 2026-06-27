import { useState, useEffect } from 'react'
import './OrderDetail.css'
import { useAuth } from '../context/AuthContext'

function OrderDetail() {
  const { user } = useAuth()
  const orderId = window.location.pathname.split('/').pop()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    const fetchOrder = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token
        const res = await fetch(`https://mirova-backend.onrender.com/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setOrder(data)
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId, user])

  const statusClass = (status) => {
    const map = {
      pending: 'od-status-pending',
      processing: 'od-status-processing',
      shipped: 'od-status-shipped',
      delivered: 'od-status-delivered',
      cancelled: 'od-status-cancelled',
    }
    return map[status] || 'od-status-pending'
  }

  if (loading) {
    return (
      <div className="od-page">
        <div className="od-container">
          <p className="od-loading">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="od-page">
        <div className="od-container">
          <p className="od-loading">Order not found.</p>
          <a href="/orders" className="od-back">← Back to Orders</a>
        </div>
      </div>
    )
  }

  return (
    <div className="od-page">
      <div className="od-container">

        <a href="/orders" className="od-back">← Back to Orders</a>

        <div className="od-header">
          <p className="od-title">Order Details</p>
          <p className="od-id">Order #{order._id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="od-status-row">
          <span className={`od-status-badge ${statusClass(order.status)}`}>
            {order.status}
          </span>
          <span className="od-payment">{order.paymentMethod}</span>
        </div>

        <div className="od-card">
          <p className="od-card-title">Items Ordered</p>
          {order.orderItems.map((item, i) => (
            <div key={i} className="od-item-row">
              <div className="od-item-img">
                {item.image
                  ? <img src={item.image} alt={item.name} />
                  : <span>✦</span>
                }
              </div>
              <div className="od-item-info">
                <p className="od-item-name">{item.name}</p>
                <p className="od-item-qty">Qty: {item.quantity}</p>
              </div>
              <p className="od-item-price">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="od-total-row">
            <span>Total</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="od-card">
          <p className="od-card-title">Shipping Address</p>
          <p className="od-info-text">{order.shippingAddress.fullName}</p>
          <p className="od-info-text">{order.shippingAddress.address}</p>
          <p className="od-info-text">{order.shippingAddress.city}</p>
          <p className="od-info-text">{order.shippingAddress.phone}</p>
        </div>

        <div className="od-actions">
          <a href="/orders" className="od-btn">View All Orders</a>
          <a href="/products" className="od-btn-outline">Continue Shopping</a>
        </div>

      </div>
    </div>
  )
}

export default OrderDetail