import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, X, CheckCircle2, ArrowRight, FileCheck2, ExternalLink } from 'lucide-react'
import { getLastCv, reuseCv, getCvBlobUrl } from '../../lib/api'
import { formatLongDate } from '../../lib/time'

export default function ApplyChooserModal({ jobId, jobTitle, onClose }) {
  const navigate = useNavigate()
  const [lastCv, setLastCv] = useState(null)   // { found, filename, applied_on, job_title, can_view, application_id }
  const [reusing, setReusing] = useState(false)
  const [viewing, setViewing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getLastCv().then(setLastCv).catch(() => setLastCv({ found: false }))
  }, [])

  function choose(method) {
    onClose()
    navigate(`/seeker/jobs/${jobId}/apply?method=${method}`)
  }

  async function handleReuse() {
    setReusing(true)
    setError(null)
    try {
      await reuseCv(jobId)
      onClose()
      navigate('/seeker/applications')
    } catch (err) {
      setError(err.message)
      setReusing(false)
    }
  }

  async function handleView() {
    if (!lastCv?.application_id) return
    setViewing(true)
    try {
      const url = await getCvBlobUrl(lastCv.application_id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Could not open the file.')
    } finally {
      setViewing(false)
    }
  }

  const hasReuse = lastCv && lastCv.found

  return (
    <div className="anim-fade fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-base/50" onClick={onClose}>
      <div className="w-full max-w-2xl bg-bg-surface rounded-card shadow-xl border border-border overflow-hidden anim-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-border">
          <div className="min-w-0">
            <h2 className="text-[16px] font-medium text-text-primary leading-tight">
              {hasReuse ? 'Apply with your CV, or choose another way' : 'How would you like to apply?'}
            </h2>
            {jobTitle && <p className="text-[12.5px] text-text-muted mt-0.5 truncate">for {jobTitle}</p>}
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-body transition-colors shrink-0" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="p-6">
          {error && (
            <div role="alert" className="mb-4 rounded-btn bg-danger-tint border border-danger/25 px-4 py-3 text-[13px] text-danger-text">{error}</div>
          )}

          {/* Reuse last CV */}
          {hasReuse && (
            <>
              <div className="rounded-card border-[1.5px] border-accent bg-accent-tint/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-bg-surface border border-accent/20 flex items-center justify-center text-accent">
                    <FileCheck2 size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-text-primary truncate">{lastCv.filename}</p>
                    <p className="text-[11.5px] text-text-muted mt-0.5">
                      Uploaded {formatLongDate(lastCv.applied_on)}{lastCv.job_title ? ` · last used for ${lastCv.job_title}` : ''}
                    </p>
                  </div>
                  {lastCv.can_view && (
                    <button onClick={handleView} disabled={viewing}
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent hover:underline shrink-0 disabled:opacity-50">
                      <ExternalLink size={12} /> {viewing ? 'Opening…' : 'View'}
                    </button>
                  )}
                </div>
                <button onClick={handleReuse} disabled={reusing}
                  className="mt-3 w-full h-11 rounded-btn bg-accent-2 text-white text-[13.5px] font-semibold hover:bg-accent-hover active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">
                  {reusing ? 'Submitting…' : 'Use this CV'}
                  {!reusing && <ArrowRight size={15} />}
                </button>
              </div>

              <div className="flex items-center gap-3 my-5 text-[12px] text-text-hint">
                <span className="h-px flex-1 bg-border" /> or apply another way <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          {/* The two routes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <button onClick={() => choose('upload')}
              className="group relative rounded-card border border-border bg-bg-surface p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-accent-light focus-visible:outline-none focus-visible:border-accent">
              <div className="w-11 h-11 rounded-btn bg-bg-subtle flex items-center justify-center text-text-muted transition-colors duration-200 group-hover:bg-accent-tint group-hover:text-accent">
                <Upload size={20} />
              </div>
              <h3 className="mt-3.5 text-[15px] font-medium text-text-primary">{hasReuse ? 'Upload a different CV' : 'Upload your CV'}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-text-muted">Send a CV as PDF or Word, up to 5 MB.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-text-body transition-colors group-hover:text-accent">
                Continue <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </button>

            <button onClick={() => choose('form')}
              className="group relative rounded-card border-[1.5px] border-accent/40 bg-accent-tint/30 p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-accent focus-visible:outline-none ring-1 ring-accent/10">
              {!hasReuse && (
                <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-0.5 text-[10.5px] font-medium text-success-text">
                  <CheckCircle2 size={10} /> Recommended
                </span>
              )}
              <div className="w-11 h-11 rounded-btn bg-accent flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                <FileText size={20} />
              </div>
              <h3 className="mt-3.5 text-[15px] font-medium text-text-primary">Fill in a form</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-text-muted">Enter your details in a guided form — nothing gets misread.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent">
                Continue <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
