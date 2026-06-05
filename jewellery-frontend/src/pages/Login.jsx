import { useState } from 'react'
import './Login.css'

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
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
      <div className="login-success">
        <div className="success-box">
          <div className="success-icon">✦</div>
          <p className="success-title">Welcome Back</p>
          <p className="success-sub">You have signed in successfully.</p>
          <a href="/" className="success-btn">Continue Shopping</a>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-logo">
          <p className="logo-name">Mirova</p>
          <p className="logo-sub">Jewellery</p>
        </div>

        <p className="login-title">Welcome Back</p>
        <p className="login-sub">Sign in to your Mirova account</p>

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

        <div className="forgot">
          <a href="/forgot-password">Forgot password?</a>
        </div>

        <button className="login-btn" onClick={handleSubmit}>
          Sign In
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

        <p className="register-link">
          Don't have an account? <a href="/register">Create one</a>
        </p>

      </div>
    </div>
  )
}

export default Login