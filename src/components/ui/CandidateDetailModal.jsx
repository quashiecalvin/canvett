import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import ScoreCircle from './ScoreCircle'
import { scoreBarColor } from '../../lib/scoreColor'
import { getCandidateDetail } from '../../lib/api'

export default function CandidateDetailModal({ candidateId, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCandidateDetail(candidateId)
      .then((data) => {
        setDetail(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [candidateId])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-bg-surface rounded-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-bg-surface">
          <h2 className="text-[18px] font-medium text-text-primary">Candidate details</h2>
          <button onClick={onClose} className="text-text-hint hover:text-text-body transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading && <p className="px-6 py-8 text-[13px] text-text-muted">Loading...</p>}

        {!loading && !detail && (
          <p className="px-6 py-8 text-[13px] text-danger-text">Could not load candidate details.</p>
        )}

        {!loading && detail && (
          <div className="px-6 py-4 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-tint flex items-center justify-center text-[15px] font-medium text-purple-text shrink-0">
                {detail.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-[18px] font-medium text-text-primary">{detail.name}</h3>
                <p className="text-[12px] text-text-muted mt-0.5">{detail.filename}</p>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <ScoreCircle score={Math.round(detail.overall_score)} />
                <span className="text-[10px] text-text-muted mt-1">match score</span>
              </div>
            </div>

            <div>
              <h4 className="text-[13px] font-medium text-text-primary mb-3">Score breakdown</h4>
              <div className="flex flex-col gap-3">
                {[
                  { key: 'skills', label: 'Skills match', value: detail.skills_score },
                  { key: 'experience', label: 'Experience', value: detail.experience_score },
                  { key: 'education', label: 'Education', value: detail.education_score },
                ].map(({ key, label, value }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-text-muted flex items-center gap-1">
                        {label}
                        {key === 'experience' && !detail.duration_verified && (
                          <AlertTriangle size={12} className="text-warning-text" />
                        )}
                      </span>
                      <span className="text-[12px] font-medium text-text-body">{Math.round(value)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-subtle overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreBarColor(value)}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {!detail.duration_verified && (
                <p className="text-[11px] text-warning-text mt-3 flex items-start gap-1.5">
                  <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                  Experience duration could not be verified — this CV did not follow the standard template. The experience score reflects relevance only.
                </p>
              )}
            </div>

            <div>
              <h4 className="text-[13px] font-medium text-text-primary mb-2">Matched skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {detail.matched_skills.length === 0 && (
                  <span className="text-[12px] text-text-muted">None</span>
                )}
                {detail.matched_skills.map((s) => (
                  <span key={s} className="text-[11px] font-medium text-success-text bg-success-tint px-2 py-0.5 rounded-subtle">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[13px] font-medium text-text-primary mb-2">Missing skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {detail.unmatched_skills.length === 0 && (
                  <span className="text-[12px] text-text-muted">None</span>
                )}
                {detail.unmatched_skills.map((s) => (
                  <span key={s} className="text-[11px] text-text-muted bg-bg-subtle px-2 py-0.5 rounded-subtle">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[13px] font-medium text-text-primary mb-2">Parsed resume text</h4>
              <div className="bg-bg-subtle rounded-btn p-4 max-h-64 overflow-y-auto">
                <pre className="text-[11px] text-text-body whitespace-pre-wrap font-sans leading-relaxed">
                  {detail.resume_text}
                </pre>
              </div>
              <p className="text-[11px] text-text-hint mt-2">
                This is the text extracted from the uploaded file and used for scoring.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
