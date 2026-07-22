import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Briefcase, Upload, Users, BarChart2, Settings, LogOut } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard', group: 'MAIN' },
  { icon: Briefcase, label: 'Job Postings', to: '/jobs', group: 'MAIN' },
  { icon: Upload, label: 'Upload Resumes', to: '/upload', group: 'MAIN' },
  { icon: Users, label: 'Candidates', to: '/ranking', group: 'MAIN' },
  { icon: BarChart2, label: 'Analytics', to: '/analytics', group: 'REPORTS' },
  { icon: Settings, label: 'Settings', to: '/settings', group: 'REPORTS' },
]

export default function Sidebar() {
  const { settings } = useSettings()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const name = user?.full_name || settings?.recruiter_name || 'Recruiter'
  const role = settings?.recruiter_role || 'Recruiter'

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="w-50 h-screen bg-bg-surface border-r border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border flex items-center gap-2">
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

      <nav className="flex flex-col flex-1">
        {['MAIN', 'REPORTS'].map((group, i) => (
          <div key={group}>
            <p className={`px-4 pb-1 text-[10px] font-medium uppercase tracking-[0.07em] text-text-hint ${i === 0 ? 'pt-4' : 'pt-3'}`}>
              {group}
            </p>
            {navItems.filter(item => item.group === group).map(({ icon: Icon, label, to }) => (
              <NavLink
                key={to}
                to={to}
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
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-avatar-bg flex items-center justify-center text-[11px] font-medium text-avatar-text shrink-0">
            {name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium text-text-primary leading-tight truncate">{name}</span>
            <span className="text-[11px] text-text-muted leading-tight truncate">{role}</span>
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
  )
}
