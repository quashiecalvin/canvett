import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Users, Trash2 } from 'lucide-react'

export default function JobActionsMenu({ onViewCandidates, onDelete }) {
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
        className="text-text-hint hover:text-text-body transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-bg-surface border border-border rounded-card shadow-lg py-1 z-20">
          <button
            onClick={() => { onViewCandidates(); setOpen(false) }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-[13px] text-text-body hover:bg-bg-subtle transition-colors"
          >
            <Users size={14} />
            View candidates
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false) }}
            className="flex items-center gap-2 w-full text-left px-4 py-2 text-[13px] text-danger-text hover:bg-danger-tint transition-colors"
          >
            <Trash2 size={14} />
            Delete posting
          </button>
        </div>
      )}
    </div>
  )
}
