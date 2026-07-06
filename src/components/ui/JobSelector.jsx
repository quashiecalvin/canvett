import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useJob } from '../../context/JobContext'

export default function JobSelector() {
  const { jobs, selectedJob, setSelectedJobId } = useJob()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-10 px-4 rounded-btn border border-border-strong text-[13px] text-text-body hover:bg-bg-subtle transition-colors"
      >
        {selectedJob ? selectedJob.title : 'Select a job'}
        <ChevronDown size={14} className="text-text-hint" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-64 bg-bg-surface border border-border rounded-card shadow-lg py-1 z-20">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => {
                setSelectedJobId(job.id)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-[13px] hover:bg-bg-subtle transition-colors
                ${selectedJob?.id === job.id ? 'text-accent font-medium' : 'text-text-body'}`}
            >
              {job.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
