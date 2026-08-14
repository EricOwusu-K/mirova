import './About.css'

const team = [
  { name: 'Eric Owusu', role: 'Lead Developer' },
  { name: 'Uthman Memuna', role: 'UI/UX Designer' },
  { name: 'Chris Addo', role: 'Backend Developer' },
]

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase()

function About() {
  return (
    <div className="about-page">

      <div className="about-hero">
        <p className="about-hero-label">Our Story</p>
        <h1 className="about-hero-title">About Mirova</h1>
        <p className="about-hero-sub">
          Fine jewellery crafted with passion, delivered with care.
          We believe every piece tells a story.
        </p>
      </div>

      <div className="about-section">
        <p className="about-section-label">Who We Are</p>
        <h2 className="about-section-title">Our Mission</h2>
        <p className="about-section-text">
          Mirova Jewellery was founded with a simple belief — that fine jewellery should be
          accessible, personal, and beautiful. We combine timeless craftsmanship with modern
          AI technology to help you find the perfect piece and see how it looks on you before you buy.
        </p>
      </div>

      <div className="about-divider" />

      <div className="about-values">
        <div className="about-value-card">
          <p className="about-value-icon">✦</p>
          <p className="about-value-title">Quality</p>
          <p className="about-value-text">
            Every piece is crafted from the finest materials and carefully inspected before delivery.
          </p>
        </div>
        <div className="about-value-card">
          <p className="about-value-icon">◎</p>
          <p className="about-value-title">Innovation</p>
          <p className="about-value-text">
            Our AI-powered virtual try-on lets you see jewellery on yourself before purchasing.
          </p>
        </div>
        <div className="about-value-card">
          <p className="about-value-icon">◈</p>
          <p className="about-value-title">Trust</p>
          <p className="about-value-text">
            30-day returns, secure checkout, and dedicated customer support — always.
          </p>
        </div>
      </div>

      <div className="about-divider" />

      <div className="about-section">
        <p className="about-section-label">The People</p>
        <h2 className="about-section-title">Meet the Team</h2>
        <div className="about-team-grid">
          {team.map((member, i) => (
            <div key={i} className="about-team-card">
              <div className="about-team-avatar">{getInitials(member.name)}</div>
              <p className="about-team-name">{member.name}</p>
              <p className="about-team-role">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default About