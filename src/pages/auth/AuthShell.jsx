import { useEffect, useState } from 'react'

export default function AuthShell({ children }) {
  const [lit, setLit] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLit(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden px-5 py-10"
         style={{ background: '#070d18' }}>

      {/* colourful flowing background — gives the glass something to refract */}
      <div
        className="absolute w-[65%] h-[75%] max-w-[720px] rounded-full blur-[110px] pointer-events-none auth-glow-a motion-reduce:animate-none"
        style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', opacity: 0.55 }}
      />
      <div
        className="absolute right-0 bottom-0 w-[55%] h-[60%] max-w-[600px] rounded-full blur-[120px] pointer-events-none auth-glow-b motion-reduce:animate-none"
        style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)', opacity: 0.4 }}
      />
      <div
        className="absolute left-0 top-1/4 w-[40%] h-[45%] max-w-[420px] rounded-full blur-[120px] pointer-events-none auth-glow-c motion-reduce:animate-none"
        style={{ background: 'radial-gradient(circle, var(--color-accent-light) 0%, transparent 70%)', opacity: 0.25 }}
      />

      {/* the card */}
      <div
        className="relative w-full max-w-[420px]"
        style={{
          opacity: lit ? 1 : 0,
          transform: lit ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-6">
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
