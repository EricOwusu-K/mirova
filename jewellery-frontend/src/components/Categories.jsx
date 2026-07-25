import './Categories.css'
import necklaces from '../assets/necklaces.jpeg'
import bracelets from '../assets/bracelets.jpeg'
import rings from '../assets/rings.jpeg'
import earrings from '../assets/earrings.jpeg'

const categories = [
  {
    id: 1,
    name: 'Necklaces',
    link: '/products?category=Necklaces'
  },
  {
    id: 2,
    name: 'Bracelets',
    link: '/products?category=Bracelets'
  },
  {
    id: 3,
    name: 'Rings',
    link: '/products?category=Rings'
  },
  {
    id: 4,
    name: 'Earrings',
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