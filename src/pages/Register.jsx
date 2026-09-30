import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Building2, Eye, EyeOff, Search, Briefcase, Check } from 'lucide-react'
import { register as registerRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import AuthShell from './auth/AuthShell'
import GoogleSignIn from './auth/GoogleSignIn'

const ROLES = [
  { value: 'seeker', label: 'Find a job', desc: 'Browse roles and apply directly.', Icon: Search },
  { value: 'recruiter', label: 'Hire talent', desc: 'Post roles and get ranked candidates.', Icon: Briefcase },
]

function validate(form) {
  const e = {}
  if (!form.role) e.role = 'Please choose an option.'
  if (!form.full_name.trim()) e.full_name = 'Enter your full name.'
  if (form.role === 'recruiter' && !form.company_name.trim()) e.company_name = 'Enter your company name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
  if (form.password.length < 8) e.password = 'Use at least 8 characters.'
  if (!form.agree) e.agree = 'Please accept the Terms and Privacy Policy to continue.'
  return e
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: '', company_name: '', agree: false })
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fieldErrors = validate(form)
  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }))
  const markTouched = (field) => setTouched((p) => ({ ...p, [field]: true }))
  const showErr = (field) => (touched[field] || touched._submit) && fieldErrors[field]

  const roleLabel = form.role === 'recruiter' ? 'recruiter' : form.role === 'seeker' ? 'job seeker' : ''
  const headline = form.role ? `Create your ${roleLabel} account` : 'Create your account'
  const buttonText = form.role ? `Create ${roleLabel} account` : 'Create account'

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched((p) => ({ ...p, _submit: true }))
    const errs = validate(form)
    if (Object.keys(errs).length) {
      const first = document.querySelector('[aria-invalid="true"]')
      if (first) first.focus()
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const { agree, ...rest } = form
      const payload = rest.role === 'recruiter' ? rest : { ...rest, company_name: null }
      const data = await registerRequest(payload)
      login(data.access_token, data.user)
      navigate(data.user.role === 'recruiter' ? '/dashboard' : '/seeker/jobs', { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const inputBase = "w-full h-12 pl-11 pr-4 rounded-btn text-[14px] text-white placeholder:text-white/35 bg-white/[0.06] border focus-visible:outline-none focus-visible:border-accent-light/60 focus-visible:bg-white/[0.09] focus-visible:ring-4 focus-visible:ring-accent/20 transition-all"
  const inputCls = (field) => `${inputBase} ${showErr(field) ? 'border-danger/60' : 'border-white/10'}`
  const labelCls = "block text-[13px] font-medium text-white/75 mb-2"
  const errCls = "mt-1.5 text-[12px] text-red-300"

  return (
    <AuthShell>
      <div className="mb-7">
        <h1 className="font-outfit text-[26px] leading-[1.15] font-semibold text-white tracking-[-0.4px]">
          {headline}
        </h1>
        <p className="text-[14px] text-white/55 mt-2">
          Join Canvett to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <span className="block text-[13px] font-medium text-white/75 mb-2">I'm here to</span>
          <div role="radiogroup" aria-label="I am here to" className="grid grid-cols-2 gap-2.5">
            {ROLES.map(({ value, label, desc, Icon }) => {
              const active = form.role === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => { update('role', value); markTouched('role') }}
                  className={`relative text-left p-3 rounded-btn border transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25
                    ${active
                      ? 'border-accent-light/60 bg-accent/25 text-white ring-2 ring-accent/20'
                      : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
                    }`}
                >
                  {active && <Check size={14} className="absolute top-2.5 right-2.5 text-accent-light" />}
                  <Icon size={18} className={active ? 'text-accent-light' : 'text-white/50'} />
                  <span className="block text-[13px] font-semibold mt-2">{label}</span>
                  <span className="block text-[11.5px] leading-snug text-white/50 mt-0.5">{desc}</span>
                </button>
              )
            })}
          </div>
          {showErr('role') && <p role="alert" className={errCls}>{fieldErrors.role}</p>}
        </div>

        <div>
          <label htmlFor="reg-name" className={labelCls}>Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
            <input id="reg-name" type="text" value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)} onBlur={() => markTouched('full_name')}
              autoComplete="name" placeholder="Your full name" className={inputCls('full_name')}
              aria-invalid={!!showErr('full_name')} aria-describedby={showErr('full_name') ? 'reg-name-err' : undefined} />
          </div>
          {showErr('full_name') && <p id="reg-name-err" role="alert" className={errCls}>{fieldErrors.full_name}</p>}
        </div>

        {form.role === 'recruiter' && (
          <div>
            <label htmlFor="reg-company" className={labelCls}>Company name</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
              <input id="reg-company" type="text" value={form.company_name}
                onChange={(e) => update('company_name', e.target.value)} onBlur={() => markTouched('company_name')}
                autoComplete="organization" placeholder="Your organisation" className={inputCls('company_name')}
                aria-invalid={!!showErr('company_name')} aria-describedby={showErr('company_name') ? 'reg-company-err' : 'reg-company-hint'} />
            </div>
            {showErr('company_name')
              ? <p id="reg-company-err" role="alert" className={errCls}>{fieldErrors.company_name}</p>
              : <p id="reg-company-hint" className="text-[12px] text-white/45 mt-2">Shown to job seekers on every role you post.</p>}
          </div>
        )}

        <div>
          <label htmlFor="reg-email" className={labelCls}>Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
            <input id="reg-email" type="email" value={form.email}
              onChange={(e) => update('email', e.target.value)} onBlur={() => markTouched('email')}
              autoComplete="email" placeholder="you@example.com" className={inputCls('email')}
              aria-invalid={!!showErr('email')} aria-describedby={showErr('email') ? 'reg-email-err' : undefined} />
          </div>
          {showErr('email') && <p id="reg-email-err" role="alert" className={errCls}>{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="reg-password" className={labelCls}>Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
            <input id="reg-password" type={showPassword ? 'text' : 'password'} value={form.password}
              onChange={(e) => update('password', e.target.value)} onBlur={() => markTouched('password')}
              autoComplete="new-password" minLength={8} placeholder="Create a password"
              className={`${inputCls('password')} pr-11`}
              aria-invalid={!!showErr('password')} aria-describedby={showErr('password') ? 'reg-password-err' : 'reg-password-hint'} />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-white/40 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-btn transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {showErr('password')
            ? <p id="reg-password-err" role="alert" className={errCls}>{fieldErrors.password}</p>
            : <p id="reg-password-hint" className="text-[12px] text-white/45 mt-2">Use at least 8 characters.</p>}
        </div>

        <div>
          <label htmlFor="reg-agree" className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              id="reg-agree"
              type="checkbox"
              checked={form.agree}
              onChange={(e) => { update('agree', e.target.checked); markTouched('agree') }}
              onBlur={() => markTouched('agree')}
              aria-invalid={!!showErr('agree')}
              aria-describedby={showErr('agree') ? 'reg-agree-err' : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/25 bg-white/[0.06] accent-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
            <span className="text-[12.5px] leading-snug text-white/65">
              I agree to Canvett's{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">Terms of Use</a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">Privacy Policy</a>.
            </span>
          </label>
          {showErr('agree') && <p id="reg-agree-err" role="alert" className="mt-1.5 text-[12px] text-red-300">{fieldErrors.agree}</p>}
        </div>

        {error && (
          <div role="alert" className="flex items-start gap-2.5 rounded-btn bg-danger/15 border border-danger/25 px-4 py-3">
            <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
            <p className="text-[13px] text-red-200">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-12 mt-1 rounded-btn bg-accent-2 text-white text-[14px] font-semibold hover:bg-accent-hover active:scale-[0.99] transition-all disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
        >
          {submitting ? 'Creating account…' : buttonText}
        </button>
      </form>

      <GoogleSignIn />

      <p className="text-[13.5px] text-white/55 text-center mt-7">
        Already have an account?{' '}
        <Link to="/login" className="text-accent-light font-medium hover:underline underline-offset-2 focus-visible:outline-none focus-visible:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
