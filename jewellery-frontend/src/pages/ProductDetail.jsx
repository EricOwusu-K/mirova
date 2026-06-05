import { useState } from 'react'
import './ProductDetails.css'
import { allProducts } from './Products'

function ProductDetails() {
  const id = Number(window.location.pathname.split('/').pop())
  const product = allProducts.find(p => p.id === id)

  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [wished, setWished] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const handleAddToCart = () => {
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
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
            <p className="pd-variant">{product.variant}</p>
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
              <button
                className="qty-btn"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >−</button>
              <span className="qty-num">{quantity}</span>
              <button
                className="qty-btn"
                onClick={() => setQuantity(prev => prev + 1)}
              >+</button>
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