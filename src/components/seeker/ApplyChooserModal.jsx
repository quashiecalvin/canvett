import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, X, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ApplyChooserModal({ jobId, jobTitle, onClose }) {
  const navigate = useNavigate()
  const firstChoiceRef = useRef(null)

  useEffect(() => {
    const opener = document.activeElement
    firstChoiceRef.current?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      opener?.focus?.()
    }
  }, [onClose])

  function choose(method) {
    onClose()
    navigate(`/seeker/jobs/${jobId}/apply?method=${method}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-base/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-chooser-title"
        className="w-full max-w-2xl bg-bg-surface rounded-card shadow-xl border border-border overflow-hidden animate-[fadeIn_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-border">
          <div className="min-w-0">
            <h2 id="apply-chooser-title" className="text-[16px] font-medium text-text-primary leading-tight">
              How would you like to apply?
            </h2>
            {jobTitle && (
              <p className="text-[12.5px] text-text-muted mt-0.5 truncate">
                for {jobTitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-body transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Choices */}
        <div className="grid gap-4 sm:grid-cols-2 p-6">
          <button
            ref={firstChoiceRef}
            onClick={() => choose('upload')}
            className="group relative rounded-card border border-border bg-bg-surface p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-accent-light focus:outline-none focus:border-accent"
          >
            <div className="w-11 h-11 rounded-btn bg-bg-subtle flex items-center justify-center text-text-muted transition-colors duration-200 group-hover:bg-accent-tint group-hover:text-accent">
              <Upload size={20} />
            </div>
            <h3 className="mt-3.5 text-[15px] font-medium text-text-primary">Upload your CV</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-text-muted">
              Send a CV you already have, as PDF or Word.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-text-body transition-colors group-hover:text-accent">
              Continue
              <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </button>

          <button
            onClick={() => choose('form')}
            className="group relative rounded-card border-[1.5px] border-accent/40 bg-accent-tint/30 p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-accent focus:outline-none ring-1 ring-accent/10"
          >
            <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-0.5 text-[10.5px] font-medium text-success-text">
              <CheckCircle2 size={10} />
              Recommended
            </span>
            <div className="w-11 h-11 rounded-btn bg-accent flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <FileText size={20} />
            </div>
            <h3 className="mt-3.5 text-[15px] font-medium text-text-primary">Fill in a form</h3>
            <p className="mt-1 text-[12.5px] leading-relaxed text-text-muted">
              Enter your details in a guided form — nothing gets misread.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent">
              Continue
              <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
