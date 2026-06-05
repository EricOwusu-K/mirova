import { useState } from 'react'
import './Register.css'

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="register-success">
        <div className="success-box">
          <div className="success-icon">✦</div>
          <p className="success-title">Welcome to Mirova</p>
          <p className="success-sub">Your account has been created successfully, {formData.firstName}!</p>
          <a href="/" className="success-btn">Start Shopping</a>
        </div>
      </div>
    )
  }

  return (
    <div className="register-page">
      <div className="register-container">

        <div className="register-logo">
          <p className="logo-name">Mirova</p>
          <p className="logo-sub">Jewellery</p>
        </div>

        <p className="register-title">Create Account</p>
        <p className="register-sub">Join Mirova and enjoy a personalised experience</p>

        <div className="field-row">
          <div className="field">
            <label className="field-label">First Name</label>
            <input
              className={`field-input ${errors.firstName ? 'error' : ''}`}
              type="text"
              name="firstName"
              placeholder="Jane"
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && <p className="field-error">{errors.firstName}</p>}
          </div>
          <div className="field">
            <label className="field-label">Last Name</label>
            <input
              className={`field-input ${errors.lastName ? 'error' : ''}`}
              type="text"
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
            />
            {errors.lastName && <p className="field-error">{errors.lastName}</p>}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Email Address</label>
          <input
            className={`field-input ${errors.email ? 'error' : ''}`}
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="field">
          <label className="field-label">Phone Number</label>
          <input
            className={`field-input ${errors.phone ? 'error' : ''}`}
            type="text"
            name="phone"
            placeholder="+233 24 000 0000"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
        </div>

        <div className="field">
          <label className="field-label">Password</label>
          <input
            className={`field-input ${errors.password ? 'error' : ''}`}
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="field">
          <label className="field-label">Confirm Password</label>
          <input
            className={`field-input ${errors.confirmPassword ? 'error' : ''}`}
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
        </div>

        <button className="register-btn" onClick={handleSubmit}>
          Create Account
        </button>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">or</span>
          <div className="divider-line" />
        </div>

        <button className="google-btn">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="signin-link">
          Already have an account? <a href="/login">Sign in</a>
        </p>

        <p className="terms">
          By creating an account you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </p>

      </div>
    </div>
  )
}

export default Register