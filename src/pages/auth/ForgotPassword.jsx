import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { forgotPassword } from '../../lib/api'
import AuthShell from './AuthShell'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      {sent ? (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} className="text-accent-light" />
          </div>
          <h1 className="font-outfit text-[22px] leading-[1.2] font-semibold text-white tracking-[-0.4px] mt-4">
            Check your email
          </h1>
          <p className="text-[14px] text-white/60 mt-2 leading-relaxed">
            If an account exists for <span className="text-white/80">{email}</span>, we've sent a link to reset your password. It expires in one hour — check your spam folder if it doesn't arrive.
          </p>
          <Link to="/login" className="inline-flex items-center gap-1.5 mt-7 text-[13.5px] font-medium text-accent-light hover:underline underline-offset-2">
            <ArrowLeft size={15} /> Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-7">
            <h1 className="font-outfit text-[26px] leading-[1.15] font-semibold text-white tracking-[-0.4px]">
              Forgot your password?
            </h1>
            <p className="text-[14px] text-white/50 mt-2">
              Enter your email and we'll send you a link to reset it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="fp-email" className="block text-[13px] font-medium text-white/75 mb-2">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="fp-email"
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

            {error && (
              <div className="flex items-start gap-2.5 rounded-btn bg-danger/15 border border-danger/25 px-4 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                <p className="text-[13px] text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group h-12 mt-1 rounded-btn bg-accent-2 text-white text-[14px] font-semibold hover:bg-accent-hover active:scale-[0.99] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {submitting ? 'Sending…' : 'Send reset link'}
              {!submitting && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="text-[13.5px] text-white/50 text-center mt-7">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-accent-light font-medium hover:underline underline-offset-2">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}
