import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Home, Bookmark, FileText, LogOut, Menu, X, Sun, Moon, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import OnboardingModal from '../seeker/OnboardingModal'

const navItems = [
  { icon: Home, label: 'Home', to: '/seeker/jobs', end: true },
  { icon: Bookmark, label: 'Saved Jobs', to: '/seeker/saved' },
  { icon: FileText, label: 'My Applications', to: '/seeker/applications' },
]

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center shrink-0">
        <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
          <rect x="8" y="8" width="5" height="7" rx="1.5" fill="white" fillOpacity="0.9"/>
          <rect x="15" y="8" width="5" height="4" rx="1.5" fill="white" fillOpacity="0.6"/>
          <rect x="15" y="14" width="5" height="6" rx="1.5" fill="white" fillOpacity="0.9"/>
          <rect x="8" y="17" width="5" height="3" rx="1.5" fill="white" fillOpacity="0.6"/>
        </svg>
      </div>
      <span className="font-outfit text-[18px] font-semibold tracking-[-0.2px]">
        <span className="text-text-primary">Can</span>
        <span className="text-accent">vett</span>
      </span>
    </div>
  )
}

export default function SeekerLayout({ children }) {
  const [open, setOpen] = useState(false)
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)

  const name = user?.full_name || 'Job Seeker'
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  const [dark, setDark] = useState(false)
  useEffect(() => {
    try {
      const isDark = localStorage.getItem('canvett_theme') === 'dark'
      setDark(isDark)
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    } catch { /* ignore */ }
  }, [])
  function toggleTheme() {
    setDark((d) => {
      const nd = !d
      document.documentElement.setAttribute('data-theme', nd ? 'dark' : 'light')
      try { localStorage.setItem('canvett_theme', nd ? 'dark' : 'light') } catch { /* ignore */ }
      return nd
    })
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/seeker/jobs?q=${encodeURIComponent(q)}` : '/seeker/jobs')
  }

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-screen bg-bg-page overflow-hidden">
      {user && user.role === 'seeker' && !user.onboarded && (
        <OnboardingModal user={user} onDone={(u) => updateUser(u)} />
      )}
      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-bg-base/40 md:hidden" />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-bg-surface border-r border-border flex flex-col shrink-0 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 flex items-center justify-between gap-2">
          <Logo />
          <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-body md:hidden" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col flex-1 px-3">
          <p className="px-3 pt-2 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-hint">Main</p>
          {navItems.map(({ icon: Icon, label, to, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-btn text-[13.5px] w-full text-left transition-colors ${
                  isActive
                    ? 'bg-accent text-white font-medium shadow-[0_6px_16px_rgba(24,95,165,0.28)]'
                    : 'text-text-body hover:bg-bg-subtle font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} strokeWidth={2} className={isActive ? 'opacity-100' : 'opacity-70'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 mt-auto">
          <button
            onClick={() => { setOpen(false); navigate('/seeker/profile') }}
            className="flex items-center gap-2.5 w-full text-left rounded-btn p-2.5 bg-bg-subtle hover:bg-disabled-bg transition-colors"
          >
            {user?.photo
              ? <img src={user.photo} alt={name} className="w-9 h-9 rounded-full object-cover bg-white shrink-0" />
              : <div className="w-9 h-9 rounded-full bg-avatar-bg flex items-center justify-center text-[11px] font-medium text-avatar-text shrink-0">{initials}</div>}
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-text-primary leading-tight truncate">{name}</span>
              <span className="text-[11.5px] text-text-muted leading-tight truncate">Job Seeker</span>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full mt-1 px-3 py-2 rounded-btn text-[12.5px] text-text-muted hover:bg-bg-subtle hover:text-text-body transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-border bg-bg-surface px-4 py-3 md:px-6">
          <button onClick={() => setOpen(true)} className="text-text-body md:hidden" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="md:hidden"><Logo /></div>

          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-hint" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs, companies or skills..."
                className="w-full h-10 pl-10 pr-16 rounded-btn bg-bg-subtle border border-transparent text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:bg-bg-surface focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center text-[11px] font-medium text-text-hint bg-bg-surface border border-border rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <button onClick={toggleTheme} aria-label="Toggle theme"
              className="w-10 h-10 rounded-btn border border-border bg-bg-surface flex items-center justify-center text-text-muted hover:bg-bg-subtle transition-colors">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button onClick={() => navigate('/seeker/profile')} aria-label="Your profile"
              className="w-10 h-10 rounded-full overflow-hidden bg-avatar-bg flex items-center justify-center text-[12px] font-medium text-avatar-text shrink-0 hover:opacity-90 transition-opacity">
              {user?.photo
                ? <img src={user.photo} alt={name} className="w-full h-full object-cover" />
                : initials}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div key={location.pathname} className="anim-page">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
