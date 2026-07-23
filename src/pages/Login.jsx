import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Mail, Lock } from 'lucide-react'
import { login as loginRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import AuthShell from './auth/AuthShell'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const data = await loginRequest(email, password)
      login(data.access_token, data.user)
      navigate(data.user.role === 'recruiter' ? '/dashboard' : '/seeker/jobs', { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <div className="mb-7">
        <h1 className="font-outfit text-[26px] leading-[1.15] font-semibold text-white tracking-[-0.4px]">
          Welcome back
        </h1>
        <p className="text-[14px] text-white/50 mt-2">
          Sign in to continue to your workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[12.5px] font-medium text-white/70 mb-2">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full h-12 pl-11 pr-4 rounded-btn text-[14px] text-white placeholder:text-white/30 bg-white/[0.06] border border-white/10 focus:outline-none focus:border-accent-light/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-accent/15 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[12.5px] font-medium text-white/70 mb-2">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full h-12 pl-11 pr-4 rounded-btn text-[14px] text-white placeholder:text-white/30 bg-white/[0.06] border border-white/10 focus:outline-none focus:border-accent-light/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-accent/15 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-btn bg-danger/15 border border-danger/25 px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
            <p className="text-[13px] text-red-200">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group h-12 mt-1 rounded-btn bg-white text-bg-base text-[14px] font-semibold hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
          {!submitting && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
        </button>
      </form>

      <p className="text-[13.5px] text-white/50 text-center mt-7">
        New to Canvett?{' '}
        <Link to="/register" className="text-accent-light font-medium hover:underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
