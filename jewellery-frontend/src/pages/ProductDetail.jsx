import { useState, useEffect } from 'react'
import './ProductDetails.css'
import { getProductById, addToCart, logInteraction } from '../api'
import { useAuth } from '../context/AuthContext'

function ProductDetails() {
  const { user } = useAuth()
  const id = window.location.pathname.split('/').pop()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [wished, setWished] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const { data } = await getProductById(id)
        setProduct(data)
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0])
        }
        // Log view interaction if user is logged in
        if (user) {
          await logInteraction(id, 'view')
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    try {
      await addToCart(product._id, quantity, selectedSize)
      if (user) await logInteraction(product._id, 'cart')
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-container">
          <p className="pd-not-found">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pd-page">
        <div className="pd-container">
          <p className="pd-not-found">Product not found.</p>
        </div>
      </div>
    )
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [null, null, null]

  return (
    <div className="pd-page">
      <div className="pd-container">

        <p className="pd-breadcrumb">
          <a href="/">Home</a>
          <span>·</span>
          <a href="/products">Products</a>
          <span>·</span>
          <span className="pd-breadcrumb-current">{product.name}</span>
        </p>

        <div className="pd-layout">

          <div className="pd-images">
            <div className="pd-thumbs">
              {images.map((img, index) => (
                <div
                  key={index}
                  className={`pd-thumb ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  {img
                    ? <img src={img} alt={`View ${index + 1}`} />
                    : <span className="thumb-placeholder">✦</span>
                  }
                </div>
              ))}
            </div>

            <div className="pd-main-image">
              {images[activeImage]
                ? <img src={images[activeImage]} alt={product.name} />
                : <span className="main-placeholder">✦</span>
              }
            </div>
          </div>

          <div className="pd-info">

            {product.badge && (
              <span className="pd-badge">{product.badge}</span>
            )}

            <h1 className="pd-name">{product.name}</h1>
            <p className="pd-variant">{product.material}</p>
            <p className="pd-price">${product.price.toFixed(2)}</p>

            <hr className="pd-divider" />

            <p className="pd-section-label">Description</p>
            <p className="pd-description">{product.description}</p>

            {product.sizes && product.sizes.length > 0 && (
              <>
                <p className="pd-section-label">Size</p>
                <div className="pd-sizes">
                  {product.sizes.map(size => (
                    <div
                      key={size}
                      className={`pd-size ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="pd-section-label">Quantity</p>
            <div className="pd-quantity">
              <button className="qty-btn" onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>−</button>
              <span className="qty-num">{quantity}</span>
              <button className="qty-btn" onClick={() => setQuantity(prev => prev + 1)}>+</button>
            </div>

            <div className="pd-actions">
              <button
                className={`btn-add ${addedToCart ? 'added' : ''}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? '✓ Added' : 'Add to Cart'}
              </button>
              <a href="/virtual-try-on" className="btn-try">Try On</a>
              <button
                className={`btn-wish ${wished ? 'wished' : ''}`}
                onClick={() => setWished(prev => !prev)}
                aria-label="Add to wishlist"
              >
                {wished ? '♥' : '♡'}
              </button>
            </div>

            <hr className="pd-divider" />

            {product.details && product.details.length > 0 && (
              <>
                <p className="pd-section-label">Details</p>
                <div className="pd-details">
                  {product.details.map((detail, index) => (
                    <div key={index} className="pd-detail-item">
                      <div className="pd-detail-dot" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails