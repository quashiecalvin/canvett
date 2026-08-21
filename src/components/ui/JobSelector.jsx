import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useJob } from '../../context/JobContext'

export default function JobSelector() {
  const { jobs, selectedJob, setSelectedJobId, jobsError } = useJob()
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
        className="flex w-full items-center justify-between gap-2 h-10 px-4 rounded-btn border border-border-strong text-[13px] text-text-body whitespace-nowrap hover:bg-bg-subtle transition-colors sm:w-auto sm:justify-start"
      >
        {selectedJob ? selectedJob.title : 'Select a job'}
        <ChevronDown size={14} className="text-text-hint shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-64 bg-bg-surface border border-border rounded-card shadow-lg py-1 z-20">
          {jobsError && (
            <p className="px-4 py-2 text-[12px] text-danger-text">{jobsError}</p>
          )}
          {!jobsError && jobs.length === 0 && (
            <p className="px-4 py-2 text-[12px] text-text-muted">No job postings yet.</p>
          )}
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
