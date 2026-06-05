import './FeaturedProducts.css'

const products = [
  {
    id: 1,
    name: 'Diamond Ring',
    price: '$120.00',
    image: '../assets/ring1.jpg'
  },
  {
    id: 2,
    name: 'Gold Ring',
    price: '$95.00',
    image: '../assets/ring2.jpg'
  },
  {
    id: 3,
    name: 'Rose Gold Ring',
    price: '$110.00',
    image: '../assets/ring3.jpg'
  },
  {
    id: 4,
    name: 'Silver Ring',
    price: '$85.00',
    image: '../assets/ring4.jpg'
  }
]

function FeaturedProducts() {
  return (
    <div className="featured">
      <p className="featured-label">SHOP NOW</p>
      <h2 className="featured-title">RINGS</h2>
      <div className="featured-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image-wrapper">
              <img src={product.image} alt={product.name} />
            </div>
            <p className="product-name">{product.name}</p>
            <p className="product-price">{product.price}</p>
          </div>
        ))}
      </div>
      <a href="/products" className="featured-btn">View All</a>
    </div>
  )
}

export default FeaturedProducts