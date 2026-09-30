import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

// Slim header for logged-out visitors. The entire logged-out experience
// (marketing + auth) is a fixed dark brand zone, so there is no theme toggle
// here - the light/dark choice lives inside the app, for signed-in users.
// (Signed-in viewers of these pages get the full app shell instead, and keep
// their own theme - see PublicPage.)
export default function PublicLayout({ children }) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    setThemeColor(THEME_COLORS.dark)
  }, [])

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
            <Link
              to="/login"
              className="inline-flex h-10 items-center rounded-btn bg-accent-2 px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
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
