import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FilterDropdown({ icon: Icon, label, value, options, onChange, buttonClass = "", compact = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
                className={`flex items-center rounded-btn border transition-colors whitespace-nowrap ${compact ? "h-9 px-3 text-[12.5px] gap-1.5" : "h-10 px-4 text-[13px] gap-2"} ${buttonClass || "border-border-strong text-text-body hover:bg-bg-subtle"}`}
      >
        {Icon && <Icon size={14} />}
        {label}: {value}
        <ChevronDown size={14} className="text-text-hint" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-bg-surface border border-border rounded-card shadow-lg py-1 z-20">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-[13px] hover:bg-bg-subtle transition-colors
                ${value === option ? 'text-accent font-medium' : 'text-text-body'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
