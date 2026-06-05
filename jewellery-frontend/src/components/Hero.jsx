import { useState, useEffect } from 'react'
import './Hero.css'
import heroImage1 from '../assets/hero1.jpeg'
import heroImage2 from '../assets/hero2.jpeg'
import heroImage3 from '../assets/hero3.jpeg'

const slides = [
  {
    subtitle: 'SIMPLY RADIANT.',
    title: 'Fine Jewelry For Every Day.',
    btnText: 'Shop Now',
    btnLink: '/products',
    image: heroImage1
  },
  {
    subtitle: 'TRY BEFORE YOU BUY.',
    title: 'See How It Looks On You Before Purchasing.',
    btnText: 'Try Now',
    btnLink: '/virtual-try-on',
    image: heroImage2
  },
  {
    subtitle: 'MADE FOR YOU.',
    title: 'Jewelry Recommended Just For You.',
    btnText: 'Check Out',
    btnLink: '/recommended',
    image: heroImage3
  }
]

function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="hero">
      <img src={slides[current].image} alt="Hero" className="hero-image" />
      <div className="hero-content">
        <p className="hero-subtitle">{slides[current].subtitle}</p>
        <h1 className="hero-title">{slides[current].title}</h1>
        <a href={slides[current].btnLink} className="hero-btn">
          {slides[current].btnText}
        </a>
      </div>
      <div className="hero-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === current ? 'active' : ''}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default Hero