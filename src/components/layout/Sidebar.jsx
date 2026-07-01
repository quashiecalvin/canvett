import { LayoutDashboard, Briefcase, Upload, Users, BarChart2, Settings } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', group: 'MAIN' },
  { icon: Briefcase, label: 'Job Postings', id: 'jobs', group: 'MAIN' },
  { icon: Upload, label: 'Upload Resumes', id: 'upload', group: 'MAIN' },
  { icon: Users, label: 'Candidates', id: 'ranking', group: 'MAIN' },
  { icon: BarChart2, label: 'Analytics', id: 'analytics', group: 'REPORTS' },
  { icon: Settings, label: 'Settings', id: 'settings', group: 'REPORTS' },
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="w-[200px] h-screen bg-bg-surface border-r border-border flex flex-col shrink-0">
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
            {navItems.filter(item => item.group === group).map(({ icon: Icon, label, id }) => {
              const active = activePage === id
              return (
                <button
                  key={id}
                  onClick={() => onNavigate(id)}
                  className={`flex items-center gap-2 px-4 py-[9px] text-[15px] w-full text-left border-r-2 transition-colors
                    ${active
                      ? 'bg-accent-tint text-accent border-accent font-medium'
                      : 'text-text-body border-transparent hover:bg-bg-subtle font-normal'
                    }`}
                >
                  <Icon size={16} strokeWidth={active ? 2 : 1.75} />
                  {label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-avatar-bg flex items-center justify-center text-[11px] font-medium text-avatar-text shrink-0">
          CQ
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-text-primary leading-tight">Calvin Quashie</span>
          <span className="text-[11px] text-text-muted leading-tight">HR Manager</span>
        </div>
      </div>
    </aside>
  )
}