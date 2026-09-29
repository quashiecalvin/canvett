import { useEffect, useState } from 'react'
import { setThemeColor, THEME_COLORS } from '../../lib/themeColor'

export default function AuthShell({ children }) {
  const [lit, setLit] = useState(false)
  useEffect(() => {
    setThemeColor(THEME_COLORS.auth)
    const t = setTimeout(() => setLit(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="auth-scope min-h-screen w-full relative flex items-center justify-center overflow-hidden px-5 py-6 sm:py-10"
         style={{ minHeight: '100dvh', background: "#070d18 url('/auth-bg.jpg') center / cover no-repeat" }}>


      {/* the card */}
      <div
        className="relative w-full max-w-[420px]"
        style={{
          opacity: lit ? 1 : 0,
          transform: lit ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-[8px] bg-accent flex items-center justify-center shrink-0">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="9" y="9" width="6" height="8" rx="1.75" fill="white" fillOpacity="0.9"/>
              <rect x="17" y="9" width="6" height="5" rx="1.75" fill="white" fillOpacity="0.6"/>
              <rect x="17" y="16" width="6" height="7" rx="1.75" fill="white" fillOpacity="0.9"/>
              <rect x="9" y="19" width="6" height="4" rx="1.75" fill="white" fillOpacity="0.6"/>
            </svg>
          </div>
          <span className="font-outfit text-[20px] font-semibold tracking-[-0.2px]">
            <span className="text-white">Can</span><span className="text-accent-light">vett</span>
          </span>
        </div>
        <p className="text-center text-[13px] text-white/45 mt-2 mb-7">Smarter hiring. Better teams.</p>

        <div
          className="rounded-modal p-7 sm:p-8 border shadow-2xl shadow-black/50"
          style={{
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: 'rgba(255,255,255,0.12)',
          }}
        >
          {children}
        </div>

        <p className="text-center text-[12px] text-white/30 mt-6">
          Intelligent hiring, made clear for everyone involved.
        </p>
      </div>
    </div>
  )
}
