import { useState, useEffect } from 'react'
import './NewArrivals.css'
import { getNewArrivals } from '../api'

function NewArrivals() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const { data } = await getNewArrivals()
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch new arrivals:', error)
      }
    }
    fetchNewArrivals()
  }, [])

  return (
    <div className="new-arrivals">
      <p className="new-arrivals-label">JUST IN</p>
      <h2 className="new-arrivals-title">NEW ARRIVALS</h2>
      <div className="new-arrivals-grid">
        {products.map((product) => (
          <a href={`/products/${product._id}`} key={product._id} className="new-arrival-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="new-arrival-image-wrapper">
              {product.images && product.images.length > 0
                ? <img src={product.images[0]} alt={product.name} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#ccc' }}>✦</div>
              }
            </div>
            <p className="new-arrival-name">{product.name}</p>
            <p className="new-arrival-price">${product.price.toFixed(2)}</p>
          </a>
        ))}
      </div>
      <a href="/products" className="new-arrivals-btn">View All</a>
    </div>
  )
}

export default NewArrivals