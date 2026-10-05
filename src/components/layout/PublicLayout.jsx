import '../../styles/PublicTheme.css'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import Footer from './Footer'
import { setThemeColor, THEME_COLORS } from '../../lib/themeColor'

const CONTACT_EMAIL = 'quashiecalvin13@gmail.com'

function Logo() {
  return (
    <div className="canvett-logo flex items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-accent">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="8" y="8" width="5" height="7" rx="1.5" fill="white" fillOpacity="0.9" />
          <rect x="15" y="8" width="5" height="4" rx="1.5" fill="white" fillOpacity="0.6" />
          <rect x="15" y="14" width="5" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
          <rect x="8" y="17" width="5" height="3" rx="1.5" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
      <span className="font-outfit text-[18px] font-semibold tracking-[-0.2px]">
        <span className="text-text-primary">Can</span><span className="text-accent">vett</span>
      </span>
    </div>
  )
}

// Slim header for logged-out visitors on the About / Privacy pages. Theme-aware,
// with a Home link back to the landing page and a light/dark toggle. (Signed-in
// viewers of these pages get the full app shell instead - see PublicPage.)
export default function PublicLayout({ children }) {
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

  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="canvett-public-theme public-info flex min-h-screen flex-col bg-bg-page">
      <header className="border-b border-border bg-bg-surface px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between">
          <Link to="/" aria-label="Canvett home"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-[14px] text-text-muted md:flex">
            <Link to="/" className="transition-colors hover:text-text-primary">Home</Link>
            <Link to="/about" className="transition-colors hover:text-text-primary">About</Link>
            <Link to="/privacy" className="transition-colors hover:text-text-primary">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-text-primary">Terms</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-text-primary">Contact</a>
          </nav>
          <div className="flex items-center gap-2 md:gap-2.5">
            <button
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              className="flex h-10 w-10 items-center justify-center rounded-btn border border-border text-text-muted transition-colors hover:bg-bg-subtle"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to="/login" className="inline-flex h-10 items-center rounded-btn border border-border-strong px-4 text-[13.5px] font-medium text-text-body transition-colors hover:bg-bg-subtle">Log in</Link>
            <Link to="/register" className="hidden sm:inline-flex h-10 items-center rounded-btn bg-accent-2 px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-accent-hover">Sign up</Link>
          </div>
        </div>
      </header>

      <main className="anim-page flex-1">{children}</main>

      <Footer />
    </div>
  )
}
