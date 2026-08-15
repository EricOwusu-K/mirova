import { useState, useRef, useEffect } from 'react'
import './Register.css'
import { forgotPassword, resetPassword } from '../api'
import { MdErrorOutline } from 'react-icons/md'

function ForgotPassword() {
  const [step, setStep] = useState('email')  // 'email' | 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef([])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // ── Step 1: request reset code ──
  const handleSendCode = async () => {
    setError('')
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email')
      return
    }
    try {
      setLoading(true)
      await forgotPassword({ email })
      setStep('reset')
      setResendCooldown(60)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reset code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError('')
    try {
      await forgotPassword({ email })
      setSuccessMsg('A new reset code has been sent.')
      setResendCooldown(60)
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code.')
    }
  }

  // ── OTP box handling ──
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
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
      setOtp(pasted.split('').concat(Array(6).fill('')).slice(0, 6))
      otpRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  // ── Step 2: reset password ──
  const handleReset = async () => {
    setError('')
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      setLoading(true)
      await resetPassword({ email, otp: code, newPassword })
      setSuccessMsg('Password reset successfully! Redirecting to login...')
      setTimeout(() => { window.location.href = '/login' }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password. Please try again.')
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

        {/* ══ STEP 1: EMAIL ══ */}
        {step === 'email' && (
          <>
            <p className="register-title">Forgot Password</p>
            <p className="register-sub">Enter your email and we'll send you a reset code</p>

            {error && (
              <div className="register-error-box">
                <MdErrorOutline className="register-error-icon" />
                <p className="register-error-text">{error}</p>
              </div>
            )}

            <div className="field">
              <label className="field-label">Email Address</label>
              <input
                className="field-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
              />
            </div>

            <button className="register-btn" onClick={handleSendCode} disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </button>

            <p className="signin-link">
              Remember your password? <a href="/login">Sign in</a>
            </p>
          </>
        )}

        {/* ══ STEP 2: CODE + NEW PASSWORD ══ */}
        {step === 'reset' && (
          <>
            <p className="register-title">Reset Password</p>
            <p className="register-sub">
              Enter the code sent to <strong>{email}</strong> and your new password
            </p>

            {error && (
              <div className="register-error-box">
                <MdErrorOutline className="register-error-icon" />
                <p className="register-error-text">{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="otp-success-box">
                <p>{successMsg}</p>
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

            <div className="field">
              <label className="field-label">New Password</label>
              <input
                className="field-input"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError('') }}
              />
            </div>

            <div className="field">
              <label className="field-label">Confirm New Password</label>
              <input
                className="field-input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError('') }}
              />
            </div>

            <button className="register-btn" onClick={handleReset} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
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
              <a onClick={() => setStep('email')} style={{ cursor: 'pointer' }}>← Use a different email</a>
            </p>
          </>
        )}

      </div>
    </div>
  )
}

export default ForgotPassword