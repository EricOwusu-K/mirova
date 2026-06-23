import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import './AdminCustomers.css'

function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setCustomers(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch customers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  if (loading) {
    return (
      <AdminLayout currentPage="Customers">
        <p className="admin-loading">Loading...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Customers">

      <div className="admin-customers-header">
        <p className="admin-page-title">MANAGE CUSTOMERS</p>
        <span className="admin-customers-count">{customers.length} registered</span>
      </div>

      {customers.length === 0 ? (
        <p className="admin-no-customers">No customers yet.</p>
      ) : (
        <div className="admin-customers-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id}>
                  <td className="admin-td-bold">{customer.name}</td>
                  <td className="admin-td-muted">{customer.email}</td>
                  <td className="admin-td-muted">{customer.phone || '—'}</td>
                  <td>
                    <span className={`admin-role-badge ${customer.role}`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="admin-td-muted">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </AdminLayout>
  )
}

export default AdminCustomers