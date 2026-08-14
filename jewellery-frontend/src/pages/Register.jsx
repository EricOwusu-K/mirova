import { useState, useRef, useEffect } from 'react'
import './Register.css'
import { registerUser, verifyOtp, resendOtp } from '../api'
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

  // ── OTP state ──
  const [step, setStep] = useState('register')  // 'register' | 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef([])

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

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
      // Registration now returns needsVerification instead of logging in
      if (data.needsVerification) {
        setStep('otp')
        setResendCooldown(60)
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── OTP input handling ──
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return  // digits only
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)  // keep last digit
    setOtp(newOtp)
    setOtpError('')

    // Auto-focus next box
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').trim().slice(0, 6)
    if (/^\d+$/.test(pasted)) {
      const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
      setOtp(newOtp)
      otpRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) {
      setOtpError('Please enter the complete 6-digit code')
      return
    }
    try {
      setOtpLoading(true)
      const { data } = await verifyOtp({ email: formData.email, otp: code })
      login(data)  // logs the user in with the returned token
      window.location.href = '/'
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    try {
      setResendMsg('')
      await resendOtp({ email: formData.email })
      setResendMsg('A new code has been sent to your email.')
      setResendCooldown(60)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Could not resend code.')
    }
  }

  // ══ OTP VERIFICATION SCREEN ══
  if (step === 'otp') {
    return (
      <div className="register-page">
        <div className="register-container">

          <div className="register-logo">
            <p className="logo-name">Mirova</p>
            <p className="logo-sub">Jewellery</p>
          </div>

          <p className="register-title">Verify Your Email</p>
          <p className="register-sub">
            We sent a 6-digit code to <strong>{formData.email}</strong>
          </p>

          {otpError && (
            <div className="register-error-box">
              <MdErrorOutline className="register-error-icon" />
              <p className="register-error-text">{otpError}</p>
            </div>
          )}

          {resendMsg && (
            <div className="otp-success-box">
              <p>{resendMsg}</p>
            </div>
          )}

          <div className="otp-inputs" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => otpRefs.current[index] = el}
                className="otp-box"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(index, e)}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button className="register-btn" onClick={handleVerify} disabled={otpLoading}>
            {otpLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          <p className="signin-link">
            Didn't receive the code?{' '}
            {resendCooldown > 0 ? (
              <span className="resend-disabled">Resend in {resendCooldown}s</span>
            ) : (
              <a onClick={handleResend} style={{ cursor: 'pointer' }}>Resend code</a>
            )}
          </p>

          <p className="signin-link">
            <a onClick={() => setStep('register')} style={{ cursor: 'pointer' }}>← Back to registration</a>
          </p>

        </div>
      </div>
    )
  }

  // ══ REGISTRATION FORM SCREEN ══
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
          {loading ? 'Sending Code...' : 'Create Account'}
        </button>

        <p className="signin-link">
          Already have an account? <a href="/login">Sign in</a>
        </p>

      </div>
    </div>
  )
}

export default Register