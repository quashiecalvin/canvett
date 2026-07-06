import { useState, useEffect } from 'react'
import ScoreCircle from '../components/ui/ScoreCircle'
import { scoreBarColor } from '../lib/scoreColor'
import { getRanking } from '../lib/api'
import { useJob } from '../context/JobContext'
import { exportToCsv } from '../lib/csv'
import { RefreshCw, Download, Eye, Bookmark } from 'lucide-react'

function initialsFromName(name) {
  const cleaned = name.replace(/[_-]/g, ' ').trim()
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function CandidateRanking() {
  const { selectedJobId, selectedJob } = useJob()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function loadRanking() {
    if (!selectedJobId) return
    setLoading(true)
    getRanking(selectedJobId)
      .then((data) => {
        setCandidates(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadRanking()
  }, [selectedJobId])

  function handleExport() {
    const rows = candidates.map((c, i) => ({
      rank: i + 1,
      name: c.name,
      filename: c.filename,
      overall_score: c.overall_score,
      skills_score: c.skills_score,
      experience_score: c.experience_score,
      education_score: c.education_score,
      matched_skills: c.matched_skills.join('; '),
      unmatched_skills: c.unmatched_skills.join('; '),
    }))
    const jobName = selectedJob ? selectedJob.title.replace(/\s+/g, '_') : 'ranking'
    exportToCsv(`${jobName}_ranking.csv`, rows)
  }

  return (
    <div className="p-6">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Candidate ranking</h1>
          <p className="text-[13px] text-text-muted mt-1">{selectedJob ? selectedJob.title : 'No job selected'} • {candidates.length} candidates ranked</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadRanking}
            className="flex items-center gap-2 h-10 px-4 rounded-btn border border-border-strong text-[13px] text-text-body hover:bg-bg-subtle transition-colors"
          >
            <RefreshCw size={14} />
            Re-rank
          </button>
          <button
            onClick={handleExport}
            disabled={candidates.length === 0}
            className="flex items-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </header>

      {loading && <p className="text-[13px] text-text-muted">Loading candidates...</p>}
      {error && <p className="text-[13px] text-danger-text">Error: {error}</p>}
      {!loading && !error && candidates.length === 0 && (
        <p className="text-[13px] text-text-muted">No candidates ranked yet. Upload some resumes to get started.</p>
      )}

      <div className="flex flex-col gap-3">
        {candidates.map((c, i) => (
          <div
            key={c.candidate_id}
            className={`bg-bg-surface rounded-card p-4 flex items-start gap-4
              ${i === 0 ? 'border-[1.5px] border-accent' : 'border-[0.5px] border-border'}`}
          >
            <div className="text-[15px] font-medium text-text-muted w-6 text-center shrink-0 pt-1">
              {i + 1}
            </div>

            <div className="w-11 h-11 rounded-full bg-purple-tint flex items-center justify-center text-[13px] font-medium text-purple-text shrink-0">
              {initialsFromName(c.name)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-medium text-text-primary leading-[1.4]">{c.name}</h3>
                {i === 0 && (
                  <span className="text-[10px] font-medium text-accent bg-accent-tint px-2 py-0.5 rounded-pill">
                    Top match
                  </span>
                )}
              </div>
              <p className="text-[12px] text-text-muted mt-0.5">{c.filename}</p>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {c.matched_skills.map(skill => (
                  <span key={skill} className="text-[11px] font-medium text-success-text bg-success-tint px-2 py-0.5 rounded-subtle">
                    {skill}
                  </span>
                ))}
                {c.unmatched_skills.map(skill => (
                  <span key={skill} className="text-[11px] text-text-muted bg-bg-subtle px-2 py-0.5 rounded-subtle">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6 mt-3">
                {[
                  { label: 'Skills match', value: c.skills_score },
                  { label: 'Experience', value: c.experience_score },
                  { label: 'Education', value: c.education_score },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-text-muted">{label}</span>
                      <span className="text-[11px] font-medium text-text-body">{Math.round(value)}%</span>
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
            </div>

            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="flex flex-col items-center">
                <ScoreCircle score={Math.round(c.overall_score)} />
                <span className="text-[10px] text-text-muted mt-1">match score</span>
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-btn border border-border flex items-center justify-center text-text-muted hover:bg-bg-subtle transition-colors">
                  <Eye size={16} />
                </button>
                <button className="w-8 h-8 rounded-btn border border-border flex items-center justify-center text-text-muted hover:bg-bg-subtle transition-colors">
                  <Bookmark size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}