import { useState } from 'react'
import './Register.css'
import { registerUser } from '../api'
import { useAuth } from '../context/AuthContext'
import { MdErrorOutline } from 'react-icons/md'

function Register() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    setServerError('')
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

  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    try {
      setLoading(true)
      const { data } = await registerUser(formData)
      login(data)
      window.location.href = '/'
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
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

        {serverError && (
          <div className="register-error-box">
            <MdErrorOutline className="register-error-icon" />
            <p className="register-error-text">{serverError}</p>
          </div>
        )}

        <div className="field-row">
          <div className="field">
            <label className="field-label">First Name</label>
            <input className={`field-input ${errors.firstName ? 'error' : ''}`} type="text" name="firstName" placeholder="Jane" value={formData.firstName} onChange={handleChange} />
            {errors.firstName && <p className="field-error">{errors.firstName}</p>}
          </div>
          <div className="field">
            <label className="field-label">Last Name</label>
            <input className={`field-input ${errors.lastName ? 'error' : ''}`} type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} />
            {errors.lastName && <p className="field-error">{errors.lastName}</p>}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Email Address</label>
          <input className={`field-input ${errors.email ? 'error' : ''}`} type="email" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="field">
          <label className="field-label">Phone Number</label>
          <input className={`field-input ${errors.phone ? 'error' : ''}`} type="text" name="phone" placeholder="+233 24 000 0000" value={formData.phone} onChange={handleChange} />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
        </div>

        <div className="field">
          <label className="field-label">Password</label>
          <input className={`field-input ${errors.password ? 'error' : ''}`} type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="field">
          <label className="field-label">Confirm Password</label>
          <input className={`field-input ${errors.confirmPassword ? 'error' : ''}`} type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
        </div>

        <button className="register-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="signin-link">
          Already have an account? <a href="/login">Sign in</a>
        </p>

      </div>
    </div>
  )
}

export default Register