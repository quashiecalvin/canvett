import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Briefcase, FileText, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { icon: Briefcase, label: 'Browse Jobs', to: '/seeker/jobs' },
  { icon: FileText, label: 'My Applications', to: '/seeker/applications' },
]

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

export default function SeekerLayout({ children }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const name = user?.full_name || 'Job Seeker'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-bg-page overflow-hidden">
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-bg-base/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-50 bg-bg-surface border-r border-border flex flex-col shrink-0 transition-transform duration-200 md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            className="text-text-muted hover:text-text-body md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col flex-1">
          <p className="px-4 pt-4 pb-1 text-[10px] font-medium uppercase tracking-[0.07em] text-text-hint">
            MAIN
          </p>
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 text-[15px] w-full text-left border-r-2 transition-colors
                ${isActive
                  ? 'bg-accent-tint text-accent border-accent font-medium'
                  : 'text-text-body border-transparent hover:bg-bg-subtle font-normal'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={isActive ? 2 : 1.75} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-avatar-bg flex items-center justify-center text-[11px] font-medium text-avatar-text shrink-0">
              {name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-text-primary leading-tight truncate">{name}</span>
              <span className="text-[11px] text-text-muted leading-tight truncate">Job Seeker</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-btn text-[12px] text-text-muted hover:bg-bg-subtle hover:text-text-body transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-border bg-bg-surface px-4 py-3 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="text-text-body"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <Logo />
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
