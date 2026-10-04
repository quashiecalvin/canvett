import '../../styles/PublicTheme.css'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { setThemeColor, THEME_COLORS } from '../../lib/themeColor'

const CONTACT_EMAIL = 'quashiecalvin13@gmail.com'

export default function AuthShell({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('canvett_theme')
      return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch { return false }
  })
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    setThemeColor(dark ? THEME_COLORS.dark : THEME_COLORS.light)
  }, [dark])
  function toggleTheme() {
    const next = !dark
    setDark(next)
    try { localStorage.setItem('canvett_theme', next ? 'dark' : 'light') } catch { /* ignore */ }
  }

  return (
    <div className="canvett-public-theme auth-scope brand-bg relative flex min-h-screen w-full items-center justify-center overflow-hidden px-5 py-16 sm:py-12"
         style={{ minHeight: '100dvh' }}>

      {/* top bar: back to home + theme toggle */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:underline">
          <ArrowLeft size={16} /> Home
        </Link>
        <button
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          className="flex h-9 w-9 items-center justify-center rounded-btn border border-border bg-bg-surface/60 text-text-muted transition-colors hover:bg-bg-subtle"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* the card */}
      <div className="auth-content relative w-full max-w-[420px]">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-accent-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect x="9" y="9" width="6" height="8" rx="1.75" fill="white" fillOpacity="0.9"/>
              <rect x="17" y="9" width="6" height="5" rx="1.75" fill="white" fillOpacity="0.6"/>
              <rect x="17" y="16" width="6" height="7" rx="1.75" fill="white" fillOpacity="0.9"/>
              <rect x="9" y="19" width="6" height="4" rx="1.75" fill="white" fillOpacity="0.6"/>
            </svg>
          </div>
          <span className="font-outfit text-[20px] font-semibold tracking-[-0.2px]">
            <span className="text-text-primary">Can</span><span className="text-accent">vett</span>
          </span>
        </div>
        <p className="mb-7 mt-2 text-center text-[13px] text-text-muted">Smarter hiring. Better matches.</p>

        <div className="glass-card rounded-modal p-7 shadow-xl shadow-black/10 sm:p-8">
          {children}
        </div>

        <nav aria-label="Footer" className="mt-6 flex items-center justify-center gap-4 text-[12px] text-text-muted">
          <Link to="/about" className="transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:underline">About</Link>
          <span className="text-border" aria-hidden="true">·</span>
          <Link to="/privacy" className="transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:underline">Privacy</Link>
          <span className="text-border" aria-hidden="true">·</span>
          <Link to="/terms" className="transition-colors hover:text-text-primary">Terms</Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:underline">Contact</a>
        </nav>
      </div>
    </div>
  )
}
