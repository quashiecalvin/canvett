import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { googleAuth } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const GIS_SRC = 'https://accounts.google.com/gsi/client'
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

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

export default function GoogleSignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const buttonRef = useRef(null)

  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState(null) // { credential, email, full_name }
  const [role, setRole] = useState('seeker')
  const [company, setCompany] = useState('')
  const [ready, setReady] = useState(false)

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
    let ro = null
    // Only re-render when the container WIDTH actually changes. Rendering the
    // button changes the element's height, which would otherwise re-trigger the
    // ResizeObserver and cause an endless render loop (the flicker).
    let lastWidth = -1

    const renderBtn = () => {
      const el = buttonRef.current
      if (cancelled || !el || !window.google?.accounts?.id) return
      const measured = Math.round(el.offsetWidth || 0)
      const width = Math.max(200, Math.min(400, measured || 320))
      if (width === lastWidth) return
      lastWidth = width
      el.innerHTML = ''
      window.google.accounts.id.renderButton(el, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'center',
        width,
      })
    }

    // The Google button is a cross-origin iframe, so we cannot watch it paint
    // internally - DOM "settling" misses that and reveals mid-paint (the flicker).
    // Keep a look-alike placeholder visible until the iframe has actually loaded,
    // then show the real button. Because the placeholder matches the finished
    // button, the swap is invisible even if the timing is not perfect.
    let capTimer = null
    let pollTimer = null
    let bufferTimer = null
    const reveal = () => { if (!cancelled) setReady(true) }

    const waitForIframe = () => {
      if (cancelled) return
      const iframe = buttonRef.current && buttonRef.current.querySelector('iframe')
      if (iframe) {
        iframe.addEventListener('load', () => { bufferTimer = setTimeout(reveal, 200) }, { once: true })
        bufferTimer = setTimeout(reveal, 900) // in case load already fired
      } else {
        pollTimer = setTimeout(waitForIframe, 50)
      }
    }

    loadGis()
      .then(() => {
        if (cancelled || !buttonRef.current) return
        window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: handleCredential })
        requestAnimationFrame(renderBtn)
        ro = new ResizeObserver(() => renderBtn())
        ro.observe(buttonRef.current)
        waitForIframe()
        capTimer = setTimeout(reveal, 2500) // always reveal eventually
      })
      .catch((err) => { setError(err.message); reveal() })

    return () => {
      cancelled = true
      if (ro) ro.disconnect()
      clearTimeout(capTimer)
      clearTimeout(pollTimer)
      clearTimeout(bufferTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!CLIENT_ID) return null

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-5">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-[12px] text-white/50">or</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      {/* Google's own rendered button - full width of the card, re-rendered on resize. */}
      <div className="relative w-full h-[44px] [color-scheme:light]">
        {/* An empty white pill that matches the real button's shape/border/size
            exactly. It holds the space (and hides Google's multi-pass render)
            while the button loads, then cross-fades out as the real button
            fades in - so only Google's real content ever appears, no morph. */}
        <div
          className="absolute inset-0 rounded-full bg-white border border-[#dadce0] transition-opacity duration-200 pointer-events-none"
          aria-hidden="true"
          style={{ opacity: ready ? 0 : 1 }}
        />
        <div
          ref={buttonRef}
          className="relative w-full h-[44px] flex items-center justify-center transition-opacity duration-200"
          style={{ opacity: ready ? 1 : 0 }}
        />
      </div>

      {error && !pending && (
        <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-btn bg-danger/15 border border-danger/25 px-4 py-3">
          <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
          <p className="text-[13px] text-red-200">{error}</p>
        </div>
      )}

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
            <p className="text-[13.5px] text-white/60 mt-1.5">
              One quick thing: how will you use Canvett?
            </p>

            <div role="radiogroup" aria-label="How will you use Canvett" className="grid grid-cols-2 gap-2.5 mt-6">
              {[
                { value: 'seeker', label: 'Find a job' },
                { value: 'recruiter', label: 'Hire talent' },
              ].map(({ value, label }) => {
                const active = role === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setRole(value)}
                    className={`h-11 rounded-btn border text-[13px] font-medium transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25
                      ${active
                        ? 'border-accent-light/60 bg-accent/25 text-white ring-2 ring-accent/20'
                        : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]'
                      }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {role === 'recruiter' && (
              <div className="mt-4">
                <label htmlFor="g-company" className="block text-[13px] font-medium text-white/75 mb-2">Company name</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                  <input
                    id="g-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    autoComplete="organization"
                    placeholder="Your organisation"
                    className="w-full h-12 pl-11 pr-4 rounded-btn text-[14px] text-white placeholder:text-white/35 bg-white/[0.06] border border-white/10 focus-visible:outline-none focus-visible:border-accent-light/60 focus-visible:bg-white/[0.09] focus-visible:ring-4 focus-visible:ring-accent/20 transition-all"
                  />
                </div>
                <p className="text-[12px] text-white/45 mt-2">Shown to job seekers on every role you post.</p>
              </div>
            )}

            {error && (
              <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-btn bg-danger/15 border border-danger/25 px-4 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                <p className="text-[13px] text-red-200">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full h-12 mt-6 rounded-btn bg-accent-2 text-white text-[14px] font-semibold hover:bg-accent-hover active:scale-[0.99] transition-all disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
            >
              {busy ? 'Setting up…' : 'Continue'}
            </button>
            <button
              type="button"
              onClick={() => { setPending(null); setError(null); setCompany('') }}
              className="w-full h-11 mt-2 text-[13px] text-white/60 hover:text-white/90 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
