import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import './AdminCustomerDetail.css'

function AdminCustomerDetail() {
  const customerId = window.location.pathname.split('/').pop()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          fetch('https://mirova-backend.onrender.com/api/auth/users', {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => r.json()),
          fetch('https://mirova-backend.onrender.com/api/orders', {
            headers: { Authorization: `Bearer ${token}` },
          }).then(r => r.json()),
        ])

        const foundCustomer = usersRes.find(u => u._id === customerId)
        setCustomer(foundCustomer || null)

        const customerOrders = ordersRes.filter(o =>
          o.user === customerId || o.user?._id === customerId
        )
        setOrders(customerOrders)
      } catch (error) {
        console.error('Failed to fetch customer details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [customerId])

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const statusClass = (status) => {
    const map = {
      pending: 'cd-status-pending',
      processing: 'cd-status-processing',
      Sent: 'cd-status-Sent',
      delivered: 'cd-status-delivered',
      cancelled: 'cd-status-cancelled',
    }
    return map[status] || 'cd-status-pending'
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Customers">
        <p className="admin-loading">Loading...</p>
      </AdminLayout>
    )
  }

  if (!customer) {
    return (
      <AdminLayout currentPage="Customers">
        <p className="admin-loading">Customer not found.</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Customers">

      <a href="/admin/customers" className="admin-cd-back">← Back to Customers</a>

      <div className="admin-cd-header">
        <p className="admin-page-title">Customer Details</p>
      </div>

      <div className="admin-cd-card">
        <p className="admin-cd-card-title">Profile</p>
        <div className="admin-cd-profile-top">
          <div className="admin-cd-avatar">{getInitials(customer.name)}</div>
          <div>
            <p className="admin-cd-name">{customer.name}</p>
            <p className="admin-cd-email">{customer.email}</p>
          </div>
        </div>
        <div className="admin-cd-row">
          <span className="admin-cd-label">Phone</span>
          <span className="admin-cd-value">{customer.phone || '—'}</span>
        </div>
        <div className="admin-cd-row">
          <span className="admin-cd-label">Role</span>
          <span className={`admin-role-badge ${customer.role}`}>{customer.role}</span>
        </div>
        <div className="admin-cd-row">
          <span className="admin-cd-label">Joined</span>
          <span className="admin-cd-value">
            {new Date(customer.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="admin-cd-row">
          <span className="admin-cd-label">Total Orders</span>
          <span className="admin-cd-value">{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
        </div>
      </div>

      <div className="admin-cd-card">
        <p className="admin-cd-card-title">Order History</p>
        {orders.length === 0 ? (
          <p className="admin-cd-no-orders">No orders placed yet.</p>
        ) : (
          orders.map(order => (
            <div key={order._id} className="admin-cd-order-row">
              <div>
                <p className="admin-cd-order-id">#{order._id.slice(-8).toUpperCase()}</p>
                <p className="admin-cd-order-date">
                  {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className={`admin-cd-status ${statusClass(order.status)}`}>{order.status}</span>
              <p className="admin-cd-order-total">${order.totalPrice.toFixed(2)}</p>
            </div>
          ))
        )}
      </div>

      <div className="admin-cd-card">
        <p className="admin-cd-card-title">Actions</p>
        <div className="admin-cd-actions">
          <a href="/admin/messages" className="admin-cd-btn">Send Message</a>
          <a href="/admin/orders" className="admin-cd-btn">View All Orders</a>
        </div>
      </div>

    </AdminLayout>
  )
}

export default AdminCustomerDetail