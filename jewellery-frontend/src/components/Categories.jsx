import './Categories.css'

const categories = [
  {
    id: 1,
    name: 'Necklaces',
    image: '../assets/necklaces.jpg',
    link: '/necklaces'
  },
  {
    id: 2,
    name: 'Bracelets',
    image: '../assets/bracelets.jpg',
    link: '/bracelets'
  },
  {
    id: 3,
    name: 'Rings',
    image: '../assets/rings.jpg',
    link: '/rings'
  },
  {
    id: 4,
    name: 'Earrings',
    image: '../assets/earrings.jpg',
    link: '/earrings'
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