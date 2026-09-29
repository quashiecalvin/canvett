import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import Footer from './Footer'
import { setThemeColor, THEME_COLORS } from '../../lib/themeColor'

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-accent">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="8" y="8" width="5" height="7" rx="1.5" fill="white" fillOpacity="0.9" />
          <rect x="15" y="8" width="5" height="4" rx="1.5" fill="white" fillOpacity="0.6" />
          <rect x="15" y="14" width="5" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
          <rect x="8" y="17" width="5" height="3" rx="1.5" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
      <span className="font-outfit text-[18px] font-semibold tracking-[-0.2px]">
        <span className="text-text-primary">Can</span>
        <span className="text-accent">vett</span>
      </span>
    </div>
  )
}

// Slim header for logged-out visitors: logo flush to the left, a theme toggle,
// and Sign in. (Signed-in users see the full app shell instead - see PublicPage.)
export default function PublicLayout({ children }) {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    try {
      const isDark = localStorage.getItem('canvett_theme') === 'dark'
      setDark(isDark)
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
      setThemeColor(isDark ? THEME_COLORS.dark : THEME_COLORS.light)
    } catch {
      /* ignore */
    }
  }, [])
  function toggleTheme() {
    setDark((d) => {
      const nd = !d
      document.documentElement.setAttribute('data-theme', nd ? 'dark' : 'light')
      setThemeColor(nd ? THEME_COLORS.dark : THEME_COLORS.light)
      try { localStorage.setItem('canvett_theme', nd ? 'dark' : 'light') } catch { /* ignore */ }
      return nd
    })
  }

  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-bg-page">
      <header className="border-b border-border bg-bg-surface px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label="Canvett home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-btn border border-border bg-bg-surface text-text-muted transition-colors hover:bg-bg-subtle"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link
              to="/login"
              className="inline-flex h-10 items-center rounded-btn bg-accent px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="anim-page flex-1">{children}</main>

      <Footer />
    </div>
  )
}
