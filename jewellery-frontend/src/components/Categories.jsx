import './Categories.css'

const categories = [
  {
    id: 1,
    name: 'Necklaces',
    image: '../assets/necklaces.jpg',
    link: '/products?category=Necklaces'
  },
  {
    id: 2,
    name: 'Bracelets',
    image: '../assets/bracelets.jpg',
    link: '/products?category=Bracelets'
  },
  {
    id: 3,
    name: 'Rings',
    image: '../assets/rings.jpg',
    link: '/products?category=Rings'
  },
  {
    id: 4,
    name: 'Earrings',
    image: '../assets/earrings.jpg',
    link: '/products?category=Earrings'
  }
]

function Categories() {
  return (
    <div className="categories">
      <p className="categories-label">SHOP BY</p>
      <h2 className="categories-title">CATEGORIES</h2>
      <div className="categories-grid">
        {categories.map((category) => (
          <a href={category.link} key={category.id} className="category-card">
            <div className="category-image-wrapper">
              <img src={category.image} alt={category.name} />
            </div>
            <p className="category-name">{category.name}</p>
          </a>
        ))}
      </div>
    </div>
  )
}

export default Categories