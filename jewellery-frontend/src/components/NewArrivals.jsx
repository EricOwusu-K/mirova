import './NewArrivals.css'

const newArrivals = [
  {
    id: 1,
    name: 'Pearl Necklace',
    price: '$150.00',
    image: '../assets/necklace1.jpg'
  },
  {
    id: 2,
    name: 'Gold Bracelet',
    price: '$110.00',
    image: '../assets/bracelet1.jpg'
  },
  {
    id: 3,
    name: 'Diamond Earrings',
    price: '$200.00',
    image: '../assets/earring1.jpg'
  },
  {
    id: 4,
    name: 'Silver Pendant',
    price: '$75.00',
    image: '../assets/pendant1.jpg'
  }
]

function NewArrivals() {
  return (
    <div className="new-arrivals">
      <p className="new-arrivals-label">JUST IN</p>
      <h2 className="new-arrivals-title">NEW ARRIVALS</h2>
      <div className="new-arrivals-grid">
        {newArrivals.map((product) => (
          <div key={product.id} className="new-arrival-card">
            <div className="new-arrival-image-wrapper">
              <img src={product.image} alt={product.name} />
            </div>
            <p className="new-arrival-name">{product.name}</p>
            <p className="new-arrival-price">{product.price}</p>
          </div>
        ))}
      </div>
      <a href="/products" className="new-arrivals-btn">View All</a>
    </div>
  )
}

export default NewArrivals