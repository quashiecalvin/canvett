import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { googleAuth } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const GIS_SRC = 'https://accounts.google.com/gsi/client'
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Load the Google Identity Services script once and share the promise.
let gisPromise = null
function loadGis() {
  if (gisPromise) return gisPromise
  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const s = document.createElement('script')
    s.src = GIS_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Could not load Google sign-in.'))
    document.head.appendChild(s)
  })
  return gisPromise
}

// "Continue with Google" for the auth pages. On a first-time user Google verifies
// them, then we ask whether they are hiring or job-seeking (recruiters add a
// company) before the account is created. Returning users are signed straight in.
//
// When VITE_GOOGLE_CLIENT_ID is not set the component renders nothing, so the
// pages look normal until the Client ID is configured.
export default function GoogleSignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const buttonRef = useRef(null)

  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  // Set once Google has verified a brand-new person who still needs a role.
  const [pending, setPending] = useState(null) // { credential, email, full_name }
  const [role, setRole] = useState('seeker')
  const [company, setCompany] = useState('')

  function finish(data) {
    login(data.access_token, data.user)
    navigate(data.user.role === 'recruiter' ? '/dashboard' : '/seeker/jobs', { replace: true })
  }

  async function handleCredential(response) {
    setError(null)
    setBusy(true)
    try {
      const data = await googleAuth(response.credential)
      if (data.needs_role) {
        // First-time user: keep the verified token and ask for a role.
        setPending({ credential: response.credential, email: data.email, full_name: data.full_name })
      } else {
        finish(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function submitRole(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const data = await googleAuth(pending.credential, role, role === 'recruiter' ? company : null)
      finish(data)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!CLIENT_ID) return
    let cancelled = false
    loadGis()
      .then(() => {
        if (cancelled || !buttonRef.current) return
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredential,
        })
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'center',
          width: buttonRef.current.offsetWidth || 340,
        })
      })
      .catch((err) => setError(err.message))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!CLIENT_ID) return null

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-5">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[12px] text-white/40">or</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      {/* Google's own rendered button - kept centred within the card. */}
      <div className="flex justify-center [color-scheme:light]">
        <div ref={buttonRef} className="w-full flex justify-center" />
      </div>

      {error && !pending && (
        <div className="mt-4 flex items-start gap-2.5 rounded-btn bg-danger/15 border border-danger/25 px-4 py-3">
          <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
          <p className="text-[13px] text-red-200">{error}</p>
        </div>
      )}

      {/* Role step for a first-time Google user. */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5 py-10"
             style={{ background: 'rgba(4, 8, 16, 0.75)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
          <form
            onSubmit={submitRole}
            className="w-full max-w-[400px] rounded-modal p-7 border shadow-2xl shadow-black/50"
            style={{
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <h2 className="font-outfit text-[20px] font-semibold text-white tracking-[-0.3px]">
              Welcome, {pending.full_name?.split(' ')[0] || 'there'}
            </h2>
            <p className="text-[13.5px] text-white/50 mt-1.5">
              One quick thing: how will you use Canvett?
            </p>

            <div className="grid grid-cols-2 gap-2.5 mt-6">
              {[
                { value: 'seeker', label: 'Find a job' },
                { value: 'recruiter', label: 'Hire talent' },
              ].map(({ value, label }) => {
                const active = role === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
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

            {role === 'recruiter' && (
              <div className="mt-4">
                <label className="block text-[12.5px] font-medium text-white/70 mb-2">Company name</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    autoComplete="organization"
                    placeholder="Your organisation"
                    className="w-full h-12 pl-11 pr-4 rounded-btn text-[14px] text-white placeholder:text-white/30 bg-white/[0.06] border border-white/10 focus:outline-none focus:border-accent-light/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-accent/15 transition-all"
                  />
                </div>
                <p className="text-[12px] text-white/40 mt-2">Shown to job seekers on every role you post.</p>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-btn bg-danger/15 border border-danger/25 px-4 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                <p className="text-[13px] text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full h-12 mt-6 rounded-btn bg-white text-bg-base text-[14px] font-semibold hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {busy ? 'Setting up…' : 'Continue'}
            </button>
            <button
              type="button"
              onClick={() => { setPending(null); setError(null); setCompany('') }}
              className="w-full h-10 mt-2 text-[13px] text-white/50 hover:text-white/80 transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
