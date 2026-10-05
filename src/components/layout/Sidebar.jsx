import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, Users, BarChart2, Settings, X } from 'lucide-react'

function JobPostingsIcon({ size = 17, strokeWidth = 2, className }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 4v5" />
    </svg>
  )
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard', group: 'MAIN' },
  { icon: JobPostingsIcon, label: 'Job Postings', to: '/jobs', group: 'MAIN' },
  { icon: Upload, label: 'Upload Resumes', to: '/upload', group: 'MAIN' },
  { icon: Users, label: 'Candidates', to: '/ranking', group: 'MAIN' },
  { icon: BarChart2, label: 'Analytics', to: '/analytics', group: 'REPORTS' },
  { icon: Settings, label: 'Settings', to: '/settings', group: 'REPORTS' },
]

export default function Sidebar({ open = false, onClose = () => {} }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-60 bg-bg-surface border-r border-border flex flex-col shrink-0 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:self-start md:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="px-5 py-5 flex items-center justify-between gap-2">
        <div className="canvett-logo flex items-center gap-2 min-w-0">
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
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-body md:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex flex-col flex-1 px-3 pb-4">
        {['MAIN', 'REPORTS'].map((group, i) => (
          <div key={group}>
            <p className={`px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-hint ${i === 0 ? 'pt-2' : 'pt-4'}`}>
              {group}
            </p>
            {navItems.filter(item => item.group === group).map(({ icon: Icon, label, to }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-btn text-[13.5px] w-full text-left transition-colors
                  ${isActive
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
          </div>
        ))}
      </nav>
    </aside>
  )
}
