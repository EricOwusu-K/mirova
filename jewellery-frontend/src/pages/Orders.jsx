import { useState, useEffect } from 'react'
import './Orders.css'
import { getMyOrders } from '../api'
import { useAuth } from '../context/AuthContext'

function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    const fetchOrders = async () => {
      try {
        const { data } = await getMyOrders()
        setOrders(data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  const statusColor = (status) => {
    const map = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    }
    return map[status] || 'status-pending'
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <p className="orders-loading">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-container">

        <div className="orders-heading">
          <p className="orders-title">My Orders</p>
          <span className="orders-count">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <p>You haven't placed any orders yet.</p>
            <a href="/products" className="orders-shop-btn">Start Shopping</a>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-card-top">
                <div>
                  <p className="order-card-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="order-card-date">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="order-card-right">
                  <p className="order-card-total">${order.totalPrice.toFixed(2)}</p>
                  <p className="order-card-payment">{order.paymentMethod}</p>
                </div>
              </div>

              <div className="order-card-items">
                {order.orderItems.map((item, i) => (
                  <p key={i} className="order-card-item">
                    {item.name} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}
                  </p>
                ))}
              </div>

              <div className="order-card-footer">
                <span className={`order-status-badge ${statusColor(order.status)}`}>
                  {order.status}
                </span>
                <a href={`/orders/${order._id}`} className="order-view-btn">View Details →</a>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  )
}

export default Orders