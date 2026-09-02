import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Search, Bell, X, Sun, Moon } from 'lucide-react'
import Sidebar from './Sidebar'
import ScorePill from '../ui/ScorePill'
import StatusBadge from '../ui/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getActivity, searchAll } from '../../lib/api'
import { timeAgo } from '../../lib/time'

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-[7px] bg-accent flex items-center justify-center shrink-0">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
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

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

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

  const name = user?.full_name || 'Recruiter'
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  // ── search ──
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (!q) { setResults(null); return }
    const t = setTimeout(() => {
      searchAll(q).then(setResults).catch(() => setResults(null))
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const hasResults =
    results && (results.postings?.length > 0 || results.candidates?.length > 0)

  function go(path) {
    setSearchOpen(false)
    setQuery('')
    setResults(null)
    navigate(path)
  }

  // ── notifications (reuses the activity feed) ──
  const [notifs, setNotifs] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    getActivity().then(setNotifs).catch(() => setNotifs([]))
  }, [])

  const unread = notifs.length > 0 && !seen

  function toggleNotifs() {
    setNotifOpen((o) => !o)
    setSeen(true)
  }

  return (
    <div className="flex h-screen bg-bg-page overflow-hidden">
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-bg-base/40 md:hidden"
        />
      )}

      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="relative flex items-center gap-3 border-b border-border bg-bg-surface px-4 py-3 md:px-6">
          {/* mobile: hamburger + logo */}
          <button
            onClick={() => setOpen(true)}
            className="text-text-body md:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="md:hidden">
            <Logo />
          </div>

          {/* desktop: search */}
          <div className="hidden md:block relative z-50 flex-1 max-w-[420px]">
            <div className="flex items-center gap-2.5 w-full rounded-btn border border-border bg-bg-subtle px-3.5 py-2.5">
              <Search size={16} className="text-text-hint shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search candidates or postings…"
                className="w-full bg-transparent text-[13px] text-text-body placeholder:text-text-hint focus:outline-none"
              />
              {query && (
                <button onClick={() => { setQuery(''); setResults(null) }} aria-label="Clear search">
                  <X size={15} className="text-text-hint hover:text-text-body" />
                </button>
              )}
            </div>

            {searchOpen && query.trim() && (
              <div className="anim-pop absolute left-0 right-0 top-full mt-2 z-50 rounded-card border border-border bg-bg-surface shadow-lg shadow-black/5 overflow-hidden">
                {!hasResults ? (
                  <p className="px-4 py-4 text-[13px] text-text-muted">
                    {results ? 'No matches found.' : 'Searching…'}
                  </p>
                ) : (
                  <div className="max-h-[360px] overflow-y-auto py-1.5">
                    {results.postings?.length > 0 && (
                      <div>
                        <p className="px-4 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-text-hint">Job postings</p>
                        {results.postings.map((p) => (
                          <button
                            key={`j${p.id}`}
                            onClick={() => go(`/jobs?highlight=${p.id}`)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-bg-subtle transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-text-primary truncate">{p.title}</p>
                              <p className="text-[11.5px] text-text-muted">{p.department}</p>
                            </div>
                            <StatusBadge status={p.status} />
                          </button>
                        ))}
                      </div>
                    )}
                    {results.candidates?.length > 0 && (
                      <div>
                        <p className="px-4 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-text-hint">Candidates</p>
                        {results.candidates.map((c) => (
                          <button
                            key={`c${c.candidate_id}`}
                            onClick={() => go(`/ranking?job=${c.job_id}&candidate=${c.candidate_id}`)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-bg-subtle transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-text-primary truncate">{c.name}</p>
                              <p className="text-[11.5px] text-text-muted truncate">{c.job_title}</p>
                            </div>
                            {c.score != null && <ScorePill score={c.score} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* right: bell + avatar */}
          <div className="ml-auto flex items-center gap-2 md:gap-3 relative z-50">
            <button onClick={toggleTheme} aria-label="Toggle theme"
              className="w-10 h-10 rounded-btn border border-border bg-bg-surface flex items-center justify-center text-text-muted hover:bg-bg-subtle transition-colors">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div className="relative">
              <button
                onClick={toggleNotifs}
                className="relative w-10 h-10 rounded-btn border border-border bg-bg-surface flex items-center justify-center text-text-muted hover:bg-bg-subtle transition-colors"
                aria-label="Notifications"
              >
                <Bell size={17} />
                {unread && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />}
              </button>

              {notifOpen && (
                <div className="anim-pop absolute right-0 top-full mt-2 z-50 w-[320px] rounded-card border border-border bg-bg-surface shadow-lg shadow-black/5 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-[13px] font-semibold text-text-primary">Notifications</p>
                    <button onClick={() => setNotifOpen(false)} aria-label="Close">
                      <X size={15} className="text-text-hint hover:text-text-body" />
                    </button>
                  </div>
                  {notifs.length === 0 ? (
                    <p className="px-4 py-5 text-[13px] text-text-muted">You're all caught up.</p>
                  ) : (
                    <div className="max-h-[320px] overflow-y-auto py-1">
                      {notifs.map((a) => (
                        <div key={a.id} className="flex gap-2.5 px-4 py-2.5 hover:bg-bg-subtle transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[12.5px] text-text-body leading-[1.4]">{a.description}</p>
                            <p className="text-[11px] text-text-muted mt-0.5">{timeAgo(a.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full overflow-hidden bg-avatar-bg flex items-center justify-center text-[12px] font-medium text-avatar-text shrink-0 hover:opacity-90 transition-opacity"
              aria-label="Your profile"
            >
              {user?.company_logo
                ? <img src={user.company_logo} alt={name} className="w-full h-full object-contain bg-white" />
                : initials}
            </button>
          </div>

          {/* click-away layer */}
          {(searchOpen || notifOpen) && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => { setSearchOpen(false); setNotifOpen(false) }}
            />
          )}
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
