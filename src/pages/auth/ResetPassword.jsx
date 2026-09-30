import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { resetPassword } from '../../lib/api'
import AuthShell from './AuthShell'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()

  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError('This reset link is missing its token. Please use the link from your email.')
      return
    }
    if (pw.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (pw !== confirm) {
      setError('The passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await resetPassword(token, pw)
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 1800)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const inputCls = "w-full h-12 pl-11 pr-4 rounded-btn text-[14px] text-white placeholder:text-white/30 bg-white/[0.06] border border-white/10 focus:outline-none focus:border-accent-light/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-accent/15 transition-all"

  return (
    <AuthShell>
      {done ? (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} className="text-accent-light" />
          </div>
          <h1 className="font-outfit text-[22px] leading-[1.2] font-semibold text-white tracking-[-0.4px] mt-4">
            Password reset
          </h1>
          <p className="text-[14px] text-white/60 mt-2 leading-relaxed">
            Your password has been updated. Taking you to sign in…
          </p>
          <Link to="/login" className="inline-flex items-center gap-1.5 mt-7 text-[13.5px] font-medium text-accent-light hover:underline underline-offset-2">
            Go to sign in <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-7">
            <h1 className="font-outfit text-[26px] leading-[1.15] font-semibold text-white tracking-[-0.4px]">
              Set a new password
            </h1>
            <p className="text-[14px] text-white/50 mt-2">
              Choose a new password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="rp-new" className="block text-[13px] font-medium text-white/75 mb-2">New password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="rp-new"
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="rp-confirm" className="block text-[13px] font-medium text-white/75 mb-2">Confirm new password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="rp-confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  className={inputCls}
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
              {submitting ? 'Resetting…' : 'Reset password'}
              {!submitting && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          <p className="text-[13.5px] text-white/50 text-center mt-7">
            <Link to="/login" className="text-accent-light font-medium hover:underline underline-offset-2">Back to sign in</Link>
          </p>
        </>
      )}
    </AuthShell>
  )
}
