import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getProducts } from '../../api'
import './AdminDashboard.css'

function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          getProducts(),
          fetch('http://localhost:5000/api/orders', {
            headers: { Authorization: `Bearer ${token}` }
          }).then(r => r.json())
        ])
        setProducts(productsRes.data)
        setOrders(Array.isArray(ordersRes) ? ordersRes : [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)

  const statCards = [
    { label: 'TOTAL PRODUCTS', value: products.length, sub: 'In catalogue' },
    { label: 'TOTAL ORDERS', value: orders.length, sub: 'All time' },
    { label: 'REVENUE', value: `$${totalRevenue.toFixed(2)}`, sub: 'Total earnings' },
  ]

  if (loading) {
    return (
      <AdminLayout currentPage="Dashboard">
        <p className="admin-loading">Loading...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Dashboard">

      <div className="admin-dashboard-header">
        <p className="admin-page-title">DASHBOARD OVERVIEW</p>
        <a href="/admin/products" className="admin-add-btn">+ Add Product</a>
      </div>

      <div className="admin-stats">
        {statCards.map(card => (
          <div key={card.label} className="admin-stat-card">
            <p className="admin-stat-label">{card.label}</p>
            <p className="admin-stat-value">{card.value}</p>
            <p className="admin-stat-sub">{card.sub}</p>
          </div>
        ))}
      </div>

      <p className="admin-section-title">RECENT PRODUCTS</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.slice(0, 5).map(product => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td className="admin-td-muted">{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td className="admin-td-muted">{product.stock}</td>
                <td>
                  <a href="/admin/products" className="admin-table-link">Manage →</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="admin-section-title">RECENT ORDERS</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map(order => (
              <tr key={order._id}>
                <td className="admin-td-id">#{order._id.slice(-8)}</td>
                <td>${order.totalPrice.toFixed(2)}</td>
                <td className="admin-td-muted">{order.paymentMethod}</td>
                <td>
                  <span className={`admin-status-badge ${order.status}`}>{order.status}</span>
                </td>
                <td>
                  <a href="/admin/orders" className="admin-table-link">View →</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </AdminLayout>
  )
}

export default AdminDashboard