import Hero from '../components/Hero'
import FeaturedProducts from '../components/FeaturedProducts'
import Categories from '../components/Categories'
import NewArrivals from '../components/NewArrivals'

function Home() {
  return (
    <div>
      <Hero />
      <FeaturedProducts />
      <Categories />
      <NewArrivals />
    </div>
  )
}

export default Home