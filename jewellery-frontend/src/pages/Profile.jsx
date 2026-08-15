import { useState, useEffect } from 'react'
import './Profile.css'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, login } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    }))
  }, [user])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    setServerError('')
    setSuccess('')
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email'
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
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
      const token = JSON.parse(localStorage.getItem('mirovaUser'))?.token
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }
      if (formData.password) payload.password = formData.password

      const res = await fetch('https://mirova-backend-production.up.railway.app/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        login(data)
        setSuccess('Profile updated successfully!')
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
      } else {
        setServerError(data.message || 'Failed to update profile.')
      }
    } catch (error) {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
          </div>
          <div>
            <p className="profile-name">{user?.name}</p>
            <p className="profile-email-sub">{user?.email}</p>
          </div>
        </div>

        <p className="profile-title">Edit Profile</p>
        <p className="profile-sub">Update your personal information below</p>

        {serverError && (
          <div className="profile-error-box">
            <span>!</span>
            <p>{serverError}</p>
          </div>
        )}

        {success && (
          <div className="profile-success-box">
            <span>✓</span>
            <p>{success}</p>
          </div>
        )}

        <div className="profile-field">
          <label className="profile-label">Full Name</label>
          <input
            className={`profile-input ${errors.name ? 'profile-input-error' : ''}`}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
          />
          {errors.name && <p className="profile-field-error">{errors.name}</p>}
        </div>

        <div className="profile-field">
          <label className="profile-label">Email Address</label>
          <input
            className={`profile-input ${errors.email ? 'profile-input-error' : ''}`}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
          />
          {errors.email && <p className="profile-field-error">{errors.email}</p>}
        </div>

        <div className="profile-field">
          <label className="profile-label">Phone Number</label>
          <input
            className="profile-input"
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="024 000 0000"
          />
        </div>

        <div className="profile-divider" />

        <p className="profile-section-label">Change Password</p>
        <p className="profile-section-sub">Leave blank to keep your current password</p>

        <div className="profile-field">
          <label className="profile-label">New Password</label>
          <input
            className={`profile-input ${errors.password ? 'profile-input-error' : ''}`}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
          {errors.password && <p className="profile-field-error">{errors.password}</p>}
        </div>

        <div className="profile-field">
          <label className="profile-label">Confirm New Password</label>
          <input
            className={`profile-input ${errors.confirmPassword ? 'profile-input-error' : ''}`}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="profile-field-error">{errors.confirmPassword}</p>}
        </div>

        <button className="profile-save-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

      </div>
    </div>
  )
}

export default Profile