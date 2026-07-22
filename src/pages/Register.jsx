import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import { register as registerRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import AuthShell from './auth/AuthShell'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'seeker' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const data = await registerRequest(form)
      login(data.access_token, data.user)
      navigate(data.user.role === 'recruiter' ? '/dashboard' : '/jobs', { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const inputClass = "w-full h-12 pl-11 pr-4 rounded-btn text-[14px] text-white placeholder:text-white/30 bg-white/[0.06] border border-white/10 focus:outline-none focus:border-accent-light/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-accent/15 transition-all"

  return (
    <AuthShell>
      <div className="mb-7">
        <h1 className="font-outfit text-[26px] leading-[1.15] font-semibold text-white tracking-[-0.4px]">
          Create your account
        </h1>
        <p className="text-[14px] text-white/50 mt-2">
          Join Canvett to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[12.5px] font-medium text-white/70 mb-2">I'm here to</label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { value: 'seeker', label: 'Find a job' },
              { value: 'recruiter', label: 'Hire talent' },
            ].map(({ value, label }) => {
              const active = form.role === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => update('role', value)}
                  className={`h-11 rounded-btn border text-[13px] font-medium transition-all active:scale-[0.99]
                    ${active
                      ? 'border-accent-light/60 bg-accent/25 text-white ring-2 ring-accent/20'
                      : 'border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'
                    }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-[12.5px] font-medium text-white/70 mb-2">Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)}
              required autoComplete="name" placeholder="Your full name" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-[12.5px] font-medium text-white/70 mb-2">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
              required autoComplete="email" placeholder="you@example.com" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-[12.5px] font-medium text-white/70 mb-2">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
              required autoComplete="new-password" placeholder="At least 8 characters" className={inputClass} />
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
          className="h-12 mt-1 rounded-btn bg-white text-bg-base text-[14px] font-semibold hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-[13.5px] text-white/50 text-center mt-7">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-light font-medium hover:underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
