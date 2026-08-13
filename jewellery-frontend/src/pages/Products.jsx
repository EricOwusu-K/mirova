import { useState, useEffect } from 'react'
import './Products.css'
import { getProducts, addToCart, getWishlist, toggleWishlist } from '../api'
import { useAuth } from '../context/AuthContext'

const categories = ['All', 'Bracelets', 'Earrings', 'Necklaces', 'Rings']
const priceRanges = ['All', 'Under $100', '$100 – $300', 'Above $300']
const materials = ['All', 'Gold', 'Silver', 'Rose Gold']

function Products() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const params = new URLSearchParams(window.location.search)
  const initialCategory = params.get('category') || 'All'
  const initialSearch = params.get('search') || ''

  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [activePriceRange, setActivePriceRange] = useState('All')
  const [activeMaterial, setActiveMaterial] = useState('All')
  const [sortBy, setSortBy] = useState('Featured')
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const { data } = await getProducts()
        setAllProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()

    if (user) {
      getWishlist()
        .then(({ data }) => setWishlist(data.map(p => p._id)))
        .catch(err => console.error('Failed to fetch wishlist:', err))
    }
  }, [user])

  const handleToggleWishlist = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      window.location.href = '/login'
      return
    }
    const wasWished = wishlist.includes(id)
    setWishlist(prev => wasWished ? prev.filter(w => w !== id) : [...prev, id])
    try {
      await toggleWishlist(id)
    } catch (error) {
      console.error('Failed to update wishlist:', error)
      setWishlist(prev => wasWished ? [...prev, id] : prev.filter(w => w !== id))
    }
  }

  const handleAddToCart = async (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      window.location.href = '/login'
      return
    }
    try {
      await addToCart(product._id, 1, product.sizes?.[0] || '')
      alert(`${product.name} added to cart!`)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const filterProducts = () => {
    let filtered = [...allProducts]
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.material?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }
    if (activeCategory !== 'All') filtered = filtered.filter(p => p.category === activeCategory)
    if (activePriceRange === 'Under $100') filtered = filtered.filter(p => p.price < 100)
    else if (activePriceRange === '$100 – $300') filtered = filtered.filter(p => p.price >= 100 && p.price <= 300)
    else if (activePriceRange === 'Above $300') filtered = filtered.filter(p => p.price > 300)
    if (activeMaterial !== 'All') filtered = filtered.filter(p => p.material === activeMaterial)
    if (sortBy === 'Price: Low to High') filtered.sort((a, b) => a.price - b.price)
    else if (sortBy === 'Price: High to Low') filtered.sort((a, b) => b.price - a.price)
    else if (sortBy === 'Newest') filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return filtered
  }

  const products = filterProducts()

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-container">
          <div className="no-products"><p>Loading products...</p></div>
        </div>
      </div>
    )
  }

  return (
    <div className="products-page">
      <div className="products-container">

        <div className="products-header">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label="Toggle filters"
            >
              <span></span><span></span><span></span>
            </button>
            <p className="products-title">
              {searchQuery.trim() ? `Results for "${searchQuery}"` : 'All Products'}
            </p>
          </div>
          <span className="products-count">{products.length} items</span>
        </div>

        {searchQuery.trim() && (
          <div className="search-result-bar">
            <p>Showing results for <strong>"{searchQuery}"</strong></p>
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('')
                window.history.replaceState({}, '', '/products')
              }}
            >
              ✕ Clear search
            </button>
          </div>
        )}

        <div className={`products-layout ${sidebarOpen ? '' : 'collapsed'}`}>
          <div className={`products-sidebar ${sidebarOpen ? '' : 'hidden'}`}>
            <p className="filter-section-label">Category</p>
            {categories.map(cat => (
              <div
                key={cat}
                className={`filter-item ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span>{cat}</span>
                <span>{cat === 'All' ? allProducts.length : allProducts.filter(p => p.category === cat).length}</span>
              </div>
            ))}
            <hr className="filter-divider" />
            <p className="filter-section-label">Price Range</p>
            {priceRanges.map(range => (
              <div
                key={range}
                className={`filter-item ${activePriceRange === range ? 'active' : ''}`}
                onClick={() => setActivePriceRange(range)}
              >
                <span>{range}</span>
              </div>
            ))}
            <hr className="filter-divider" />
            <p className="filter-section-label">Material</p>
            {materials.map(mat => (
              <div
                key={mat}
                className={`filter-item ${activeMaterial === mat ? 'active' : ''}`}
                onClick={() => setActiveMaterial(mat)}
              >
                <span>{mat}</span>
              </div>
            ))}
          </div>

          <div className="products-main">
            <div className="sort-row">
              <span className="sort-label">Sort by</span>
              <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div className="no-products">
                <p>
                  {searchQuery.trim()
                    ? `No products found for "${searchQuery}". Try a different search.`
                    : 'No products match your filters.'
                  }
                </p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <a href={`/products/${product._id}`} className="product-card" key={product._id}>
                    <div className="product-image">
                      {product.badge && <span className="product-badge">{product.badge}</span>}
                      {product.images && product.images.length > 0
                        ? <img src={product.images[0]} alt={product.name} />
                        : <span className="product-placeholder">✦</span>
                      }
                    </div>
                    <p className="product-name">{product.name}</p>
                    <p className="product-variant">{product.material}</p>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <div className="product-actions">
                      <button className="btn-cart" onClick={(e) => handleAddToCart(e, product)}>
                        Add to Cart
                      </button>
                      <a href={`/virtual-try-on?product=${product._id}`} className="btn-tryon" onClick={e => e.stopPropagation()}>
                        Try On
                      </a>
                      <button
                        className={`btn-wish ${wishlist.includes(product._id) ? 'wished' : ''}`}
                        onClick={(e) => handleToggleWishlist(product._id, e)}
                        aria-label="Add to wishlist"
                      >
                        {wishlist.includes(product._id) ? '♥' : '♡'}
                      </button>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products