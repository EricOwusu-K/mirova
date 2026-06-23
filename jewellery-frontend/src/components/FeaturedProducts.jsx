import { useState, useEffect } from 'react'
import './FeaturedProducts.css'
import { getProducts } from '../api'

function FeaturedProducts() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await getProducts({ category: 'Rings' })
        setProducts(data.slice(0, 4))
      } catch (error) {
        console.error('Failed to fetch featured products:', error)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <div className="featured">
      <p className="featured-label">SHOP NOW</p>
      <h2 className="featured-title">RINGS</h2>
      <div className="featured-grid">
        {products.map((product) => (
          <a href={`/products/${product._id}`} key={product._id} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="product-image-wrapper">
              {product.images && product.images.length > 0
                ? <img src={product.images[0]} alt={product.name} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#ccc' }}>✦</div>
              }
            </div>
            <p className="product-name">{product.name}</p>
            <p className="product-price">${product.price.toFixed(2)}</p>
          </a>
        ))}
      </div>
      <a href="/products" className="featured-btn">View All</a>
    </div>
  )
}

export default FeaturedProducts