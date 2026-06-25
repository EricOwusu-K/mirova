import { useState } from 'react'
import './Login.css'
import { loginUser } from '../api'
import { useAuth } from '../context/AuthContext'
import { MdErrorOutline } from 'react-icons/md'

function Login() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    setServerError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    return newErrors
  }

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    try {
      setLoading(true)
      const { data } = await loginUser(formData)
      login(data)
      if (data.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
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

        {serverError && (
          <div className="login-error-box">
            <MdErrorOutline className="login-error-icon" />
            <p className="login-error-text">
              Sorry, we don't recognize that username or password. You can try again or reset your password.
            </p>
          </div>
        )}

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

        <button className="login-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="register-link">
          Don't have an account? <a href="/register">Create one</a>
        </p>

      </div>
    </div>
  )
}

export default Login