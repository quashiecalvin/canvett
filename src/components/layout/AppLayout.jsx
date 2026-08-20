import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

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
