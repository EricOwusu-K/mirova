import { useState } from 'react'
import './Products.css'

export const allProducts = [
  { id: 1, name: 'Gold Chain Bracelet', variant: '18K Gold · Delicate', price: 120.00, category: 'Bracelets', material: 'Gold', badge: 'New', image: null, sizes: ['XS', 'S', 'M', 'L'], description: 'A timeless delicate chain bracelet crafted in 18K gold. Lightweight and elegant, perfect for everyday wear or layering with other pieces.', details: ['Material: 18K Gold', 'Free shipping on orders above $150', '30-day return policy', 'Comes in a Mirova gift box'] },
  { id: 2, name: 'Pearl Drop Earrings', variant: 'Sterling Silver · Classic', price: 85.00, category: 'Earrings', material: 'Silver', badge: null, image: null, sizes: ['S', 'M'], description: 'Elegant pearl drop earrings set in sterling silver. A classic piece that adds a touch of sophistication to any outfit.', details: ['Material: Sterling Silver', 'Free shipping on orders above $150', '30-day return policy', 'Comes in a Mirova gift box'] },
  { id: 3, name: 'Diamond Ring', variant: '14K White Gold · Fine', price: 340.00, category: 'Rings', material: 'Gold', badge: 'Best Seller', image: null, sizes: ['XS', 'S', 'M', 'L', 'XL'], description: 'A stunning diamond ring set in 14K white gold. Crafted with precision and care for a brilliant shine that lasts a lifetime.', details: ['Material: 14K White Gold', 'Free shipping on orders above $150', '30-day return policy', 'Comes in a Mirova gift box', 'Certificate of authenticity included'] },
  { id: 4, name: 'Rose Gold Necklace', variant: 'Rose Gold · Layered', price: 210.00, category: 'Necklaces', material: 'Rose Gold', badge: null, image: null, sizes: ['S', 'M', 'L'], description: 'A delicate layered rose gold necklace perfect for everyday elegance. Adjustable length for a customised fit.', details: ['Material: Rose Gold', 'Free shipping on orders above $150', '30-day return policy', 'Comes in a Mirova gift box'] },
  { id: 5, name: 'Sapphire Stud Earrings', variant: 'White Gold · Gemstone', price: 175.00, category: 'Earrings', material: 'Gold', badge: null, image: null, sizes: ['S', 'M'], description: 'Beautiful sapphire stud earrings set in white gold. The deep blue gemstones add a pop of colour to any look.', details: ['Material: White Gold', 'Genuine sapphire gemstones', 'Free shipping on orders above $150', '30-day return policy'] },
  { id: 6, name: 'Silver Bangle', variant: '925 Silver · Minimal', price: 65.00, category: 'Bracelets', material: 'Silver', badge: 'Sale', image: null, sizes: ['XS', 'S', 'M', 'L'], description: 'A sleek and minimal 925 silver bangle. Simple yet striking, this piece pairs well with everything.', details: ['Material: 925 Sterling Silver', 'Free shipping on orders above $150', '30-day return policy', 'Comes in a Mirova gift box'] },
  { id: 7, name: 'Gold Hoop Earrings', variant: '18K Gold · Bold', price: 95.00, category: 'Earrings', material: 'Gold', badge: null, image: null, sizes: ['S', 'M', 'L'], description: 'Bold 18K gold hoop earrings that make a statement. Lightweight despite their size, comfortable for all-day wear.', details: ['Material: 18K Gold', 'Free shipping on orders above $150', '30-day return policy', 'Comes in a Mirova gift box'] },
  { id: 8, name: 'Diamond Pendant', variant: '14K Gold · Fine', price: 280.00, category: 'Necklaces', material: 'Gold', badge: 'New', image: null, sizes: ['S', 'M', 'L'], description: 'A fine diamond pendant in 14K gold. Minimalist design with maximum sparkle — a true wardrobe essential.', details: ['Material: 14K Gold', 'Genuine diamond', 'Free shipping on orders above $150', '30-day return policy', 'Certificate of authenticity included'] },
  { id: 9, name: 'Silver Chain Bracelet', variant: '925 Silver · Delicate', price: 75.00, category: 'Bracelets', material: 'Silver', badge: null, image: null, sizes: ['XS', 'S', 'M'], description: 'A delicate 925 silver chain bracelet, perfect for stacking or wearing solo. Lightweight and comfortable.', details: ['Material: 925 Sterling Silver', 'Free shipping on orders above $150', '30-day return policy', 'Comes in a Mirova gift box'] },
  { id: 10, name: 'Rose Gold Ring', variant: 'Rose Gold · Minimal', price: 130.00, category: 'Rings', material: 'Rose Gold', badge: null, image: null, sizes: ['XS', 'S', 'M', 'L', 'XL'], description: 'A minimal rose gold ring with a smooth finish. Elegant and understated — perfect for everyday wear.', details: ['Material: Rose Gold', 'Free shipping on orders above $150', '30-day return policy', 'Comes in a Mirova gift box'] },
  { id: 11, name: 'Pearl Necklace', variant: 'Sterling Silver · Classic', price: 190.00, category: 'Necklaces', material: 'Silver', badge: 'Best Seller', image: null, sizes: ['S', 'M', 'L'], description: 'A classic pearl necklace set in sterling silver. Timeless, elegant, and versatile enough for any occasion.', details: ['Material: Sterling Silver', 'Genuine freshwater pearls', 'Free shipping on orders above $150', '30-day return policy'] },
  { id: 12, name: 'Gold Tennis Bracelet', variant: '18K Gold · Luxury', price: 450.00, category: 'Bracelets', material: 'Gold', badge: null, image: null, sizes: ['XS', 'S', 'M', 'L'], description: 'A luxurious 18K gold tennis bracelet encrusted with fine stones. The ultimate statement piece for special occasions.', details: ['Material: 18K Gold', 'Free shipping on all orders', '30-day return policy', 'Comes in a Mirova gift box', 'Certificate of authenticity included'] },
]

const categories = ['All', 'Bracelets', 'Earrings', 'Necklaces', 'Rings']
const priceRanges = ['All', 'Under $100', '$100 – $300', 'Above $300']
const materials = ['All', 'Gold', 'Silver', 'Rose Gold']

function Products() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const params = new URLSearchParams(window.location.search)
  const initialCategory = params.get('category') || 'All'
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [activePriceRange, setActivePriceRange] = useState('All')
  const [activeMaterial, setActiveMaterial] = useState('All')
  const [sortBy, setSortBy] = useState('Featured')
  const [wishlist, setWishlist] = useState([])

  const toggleWishlist = (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlist(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    )
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const filterProducts = () => {
    let filtered = [...allProducts]
    if (activeCategory !== 'All') filtered = filtered.filter(p => p.category === activeCategory)
    if (activePriceRange === 'Under $100') filtered = filtered.filter(p => p.price < 100)
    else if (activePriceRange === '$100 – $300') filtered = filtered.filter(p => p.price >= 100 && p.price <= 300)
    else if (activePriceRange === 'Above $300') filtered = filtered.filter(p => p.price > 300)
    if (activeMaterial !== 'All') filtered = filtered.filter(p => p.material === activeMaterial)
    if (sortBy === 'Price: Low to High') filtered.sort((a, b) => a.price - b.price)
    else if (sortBy === 'Price: High to Low') filtered.sort((a, b) => b.price - a.price)
    else if (sortBy === 'Newest') filtered.sort((a, b) => b.id - a.id)
    return filtered
  }

  const products = filterProducts()

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
            <p className="products-title">All Products</p>
          </div>
          <span className="products-count">{products.length} items</span>
        </div>

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
              <div className="no-products"><p>No products match your filters.</p></div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <a href={`/products/${product.id}`} className="product-card" key={product.id}>
                    <div className="product-image">
                      {product.badge && <span className="product-badge">{product.badge}</span>}
                      {product.image
                        ? <img src={product.image} alt={product.name} />
                        : <span className="product-placeholder">✦</span>
                      }
                    </div>
                    <p className="product-name">{product.name}</p>
                    <p className="product-variant">{product.variant}</p>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <div className="product-actions">
                      <button className="btn-cart" onClick={handleAddToCart}>Add to Cart</button>
                      <a href="/virtual-try-on" className="btn-tryon" onClick={e => e.stopPropagation()}>Try On</a>
                      <button
                        className={`btn-wish ${wishlist.includes(product.id) ? 'wished' : ''}`}
                        onClick={(e) => toggleWishlist(product.id, e)}
                        aria-label="Add to wishlist"
                      >♡</button>
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