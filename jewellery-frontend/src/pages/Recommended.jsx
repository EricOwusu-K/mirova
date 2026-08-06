import { useState, useEffect } from 'react'
import './Recommended.css'
import { getRecommendations, addToCart } from '../api'
import { useAuth } from '../context/AuthContext'

function Recommended() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [isPersonalised, setIsPersonalised] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    const fetch = async () => {
      try {
        const { data } = await getRecommendations()
        setProducts(data.products)
        setIsPersonalised(data.isPersonalised)
      } catch (err) {
        console.error('Failed to fetch recommendations:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [user])

  const handleAddToCart = async (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await addToCart(product._id, 1, product.sizes?.[0] || '')
      alert(`${product.name} added to cart!`)
    } catch (err) {
      console.error('Failed to add to cart:', err)
    }
  }

  const getReasonText = (product) => {
    if (product.isFeatured) return '★ Featured collection'
    const age = (Date.now() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24)
    if (age < 30) return '✦ New arrival'
    return '↑ Popular with customers'
  }

  if (loading) {
    return (
      <div className="rec-page">
        <div className="rec-loading">Loading your recommendations...</div>
      </div>
    )
  }

  return (
    <div className="rec-page">

      {/* ── Hero ── */}
      <div className="rec-hero">
        <p className="rec-label">PERSONALISED FOR YOU</p>
        <h1 className="rec-title">RECOMMENDED FOR YOU</h1>
        <p className="rec-sub">
          {isPersonalised
            ? 'Based on your browsing, wishlist and purchase history'
            : 'Browse more products to get personalised recommendations'}
        </p>
      </div>

      {/* ── Reason tags ── */}
      {isPersonalised && (
        <div className="rec-tags-row">
          <p className="rec-tags-label">WHY WE PICKED THESE</p>
          <div className="rec-tags">
            <span className="rec-tag active">✦ Your viewed categories</span>
            <span className="rec-tag">◎ Your favourite materials</span>
            <span className="rec-tag">↑ Popular with customers</span>
            <span className="rec-tag">★ Featured collection</span>
          </div>
        </div>
      )}

      <div className="rec-divider" />

      {/* ── Empty state ── */}
      {products.length === 0 ? (
        <div className="rec-empty">
          <p className="rec-empty-title">Nothing to show yet</p>
          <p className="rec-empty-sub">
            Start browsing products and we will personalise your recommendations.
          </p>
          <a href="/products" className="rec-empty-btn">Browse All Products</a>
        </div>
      ) : (
        <>
          <p className="rec-count">
            {isPersonalised ? 'PICKED FOR YOU' : 'YOU MIGHT LIKE'} · {products.length} ITEMS
          </p>

          {/* ── Product Grid ── */}
          <div className="rec-grid">
            {products.map(product => (
              <a href={`/products/${product._id}`} key={product._id} className="rec-card">
                <div className="rec-card-image">
                  {product.badge && (
                    <span className="rec-badge">{product.badge}</span>
                  )}
                  {product.images && product.images.length > 0
                    ? <img src={product.images[0]} alt={product.name} />
                    : <span className="rec-placeholder">✦</span>
                  }
                </div>
                <div className="rec-card-body">
                  <p className="rec-card-name">{product.name}</p>
                  <p className="rec-card-material">{product.material}</p>
                  <p className="rec-card-price">${product.price.toFixed(2)}</p>
                  <div className="rec-card-actions">
                    <button
                      className="rec-btn-cart"
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      Add to Cart
                    </button>
                    <a
                      href="/virtual-try-on"
                      className="rec-btn-tryon"
                      onClick={e => e.stopPropagation()}
                    >
                      Try On ✦
                    </a>
                  </div>
                  <p className="rec-reason">{getReasonText(product)}</p>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Recommended