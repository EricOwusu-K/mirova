import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getProducts } from '../../api'
import './AdminProducts.css'

const emptyForm = {
  name: '', description: '', price: '', category: 'Earrings',
  material: '', stock: '', badge: '', sizes: '', details: '',
  isFeatured: false,
}

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token

  const fetchProducts = async () => {
    try {
      const { data } = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleImageUpload = async () => {
    if (!imageFile) return
    setUploading(true)
    try {
      const formDataImg = new FormData()
      formDataImg.append('image', imageFile)
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataImg,
      })
      const data = await res.json()
      setUploadedImageUrl(data.imageUrl)
      setMessage('Image uploaded successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to upload image:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        details: formData.details.split(',').map(d => d.trim()).filter(Boolean),
        images: uploadedImageUrl ? [uploadedImageUrl] : [],
      }

      const url = editId
        ? `http://localhost:5000/api/products/${editId}`
        : 'http://localhost:5000/api/products'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setMessage(editId ? 'Product updated!' : 'Product added!')
        setShowForm(false)
        setFormData(emptyForm)
        setEditId(null)
        setImageFile(null)
        setImagePreview('')
        setUploadedImageUrl('')
        fetchProducts()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Failed to save product:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      material: product.material,
      stock: product.stock,
      badge: product.badge || '',
      sizes: product.sizes.join(', '),
      details: product.details.join(', '),
      isFeatured: product.isFeatured,
    })
    setEditId(product._id)
    setUploadedImageUrl(product.images?.[0] || '')
    setImagePreview(product.images?.[0] || '')
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setFormData(emptyForm)
    setEditId(null)
    setImageFile(null)
    setImagePreview('')
    setUploadedImageUrl('')
  }

  if (loading) {
    return (
      <AdminLayout currentPage="Products">
        <p className="admin-loading">Loading...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="Products">

      <div className="admin-products-header">
        <p className="admin-page-title">MANAGE PRODUCTS</p>
        <button className="admin-toggle-btn" onClick={showForm ? handleCancel : () => setShowForm(true)}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {message && <div className="admin-success-msg">{message}</div>}

      {showForm && (
        <div className="admin-form-card">
          <p className="admin-form-title">{editId ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}</p>

          <div className="admin-form-grid">
            <div>
              <label className="admin-field-label">Product Name</label>
              <input className="admin-field-input" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Gold Chain Bracelet" />
            </div>
            <div>
              <label className="admin-field-label">Price ($)</label>
              <input className="admin-field-input" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g. 120" />
            </div>
            <div>
              <label className="admin-field-label">Category</label>
              <select className="admin-field-input" name="category" value={formData.category} onChange={handleChange}>
                <option>Earrings</option>
                <option>Necklaces</option>
                <option>Bracelets</option>
                <option>Rings</option>
                <option>Sunglasses</option>
              </select>
            </div>
            <div>
              <label className="admin-field-label">Material</label>
              <input className="admin-field-input" name="material" value={formData.material} onChange={handleChange} placeholder="e.g. 18K Gold" />
            </div>
            <div>
              <label className="admin-field-label">Stock</label>
              <input className="admin-field-input" name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="e.g. 20" />
            </div>
            <div>
              <label className="admin-field-label">Badge (optional)</label>
              <input className="admin-field-input" name="badge" value={formData.badge} onChange={handleChange} placeholder="e.g. New, Best Seller, Sale" />
            </div>
            <div>
              <label className="admin-field-label">Sizes (comma separated)</label>
              <input className="admin-field-input" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="e.g. XS, S, M, L" />
            </div>
            <div>
              <label className="admin-field-label">Featured</label>
              <div className="admin-checkbox-row">
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                <span className="admin-checkbox-label">Show on homepage</span>
              </div>
            </div>
          </div>

          <div>
            <label className="admin-field-label">Description</label>
            <textarea className="admin-field-textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Product description..." />
          </div>

          <div>
            <label className="admin-field-label">Details (comma separated)</label>
            <input className="admin-field-input" name="details" value={formData.details} onChange={handleChange} placeholder="e.g. Material: 18K Gold, Free shipping, 30-day return policy" />
          </div>

          <div className="admin-image-section">
            <label className="admin-field-label">Product Image</label>
            <div className="admin-image-upload-row">
              <input type="file" accept="image/*" onChange={handleImageChange} className="admin-image-input" />
              {imageFile && (
                <button className="admin-upload-btn" onClick={handleImageUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
            </div>
            {imagePreview && (
              <div className="admin-image-preview-wrap">
                <img src={imagePreview} alt="Preview" className="admin-image-preview" />
                {uploadedImageUrl && (
                  <p className="admin-image-success">✓ Image uploaded to cloud</p>
                )}
              </div>
            )}
          </div>

          <button className="admin-save-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      )}

      <div className="admin-products-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Badge</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>
                  {product.images && product.images.length > 0
                    ? <img src={product.images[0]} alt={product.name} className="admin-product-thumb" />
                    : <div className="admin-product-no-img">✦</div>
                  }
                </td>
                <td className="admin-td-bold">{product.name}</td>
                <td className="admin-td-muted">{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td className={product.stock < 5 ? 'stock-low' : 'admin-td-muted'}>{product.stock}</td>
                <td className="admin-td-muted">{product.badge || '—'}</td>
                <td className={product.isFeatured ? 'featured-yes' : 'featured-no'}>{product.isFeatured ? '✓ Yes' : 'No'}</td>
                <td>
                  <div className="admin-action-btns">
                    <button className="admin-edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="admin-delete-btn" onClick={() => handleDelete(product._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </AdminLayout>
  )
}

export default AdminProducts