import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { login as loginRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import AuthShell from './auth/AuthShell'
import GoogleSignIn from './auth/GoogleSignIn'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [params] = useSearchParams()
  const expired = params.get('expired') === '1'
  const nextPath = params.get('next')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const emailErr = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address.' : null

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const data = await loginRequest(email, password)
      login(data.access_token, data.user)
      const roleHome = data.user.role === 'recruiter' ? '/dashboard' : '/seeker/jobs'
      const dest = nextPath && nextPath.startsWith('/') && !nextPath.startsWith('/login') ? nextPath : roleHome
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const inputBase = "w-full h-12 pl-11 rounded-btn text-[14px] text-text-primary placeholder:text-text-hint bg-bg-subtle border focus-visible:outline-none focus-visible:border-accent focus-visible:bg-bg-subtle focus-visible:ring-4 focus-visible:ring-accent/20 transition-all"

  return (
    <AuthShell>
      <div className="mb-7">
        <h1 className="font-outfit text-[26px] leading-[1.15] font-semibold text-text-primary tracking-[-0.4px]">
          Welcome back
        </h1>
        <p className="text-[14px] text-text-muted mt-2">
          Sign in to continue to Canvett.
        </p>
      </div>

      {expired && (
        <div role="status" className="mb-5 flex items-start gap-2.5 rounded-btn bg-warning-tint border border-warning-text/25 px-4 py-3">
          <span className="w-1.5 h-1.5 rounded-full bg-warning-text mt-1.5 shrink-0" />
          <p className="text-[13px] text-warning-text">Your session expired. Please sign in again to continue.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="block text-[13px] font-medium text-text-body mb-2">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-hint" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              required
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!emailErr}
              aria-describedby={emailErr ? 'login-email-err' : undefined}
              className={`${inputBase} pr-4 ${emailErr ? 'border-danger/60' : 'border-border'}`}
            />
          </div>
          {emailErr && <p id="login-email-err" role="alert" className="mt-1.5 text-[12px] text-danger-text">{emailErr}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="login-password" className="block text-[13px] font-medium text-text-body">Password</label>
            <Link to="/forgot-password" className="text-[12px] text-accent hover:underline underline-offset-2 focus-visible:outline-none focus-visible:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-hint" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`${inputBase} pr-11 border-border`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-text-hint hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-btn transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-btn bg-danger-tint border border-danger/25 px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
            <p className="text-[13px] text-danger-text">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group h-12 mt-1 rounded-btn bg-accent-2 text-white text-[14px] font-semibold hover:bg-accent-hover active:scale-[0.99] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
          {!submitting && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
        </button>
      </form>

      <GoogleSignIn />

      <p className="text-[13.5px] text-text-muted text-center mt-7">
        New to Canvett?{' '}
        <Link to="/register" className="text-accent font-medium hover:underline underline-offset-2 focus-visible:outline-none focus-visible:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
