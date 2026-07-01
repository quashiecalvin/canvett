import ScoreCircle from '../components/ui/ScoreCircle'
import { RefreshCw, Download, Eye, Bookmark } from 'lucide-react'

export default function CandidateRanking() {
  const candidates = [
    { initials: 'EN', name: 'Eric Ntow', role: 'Senior Backend Engineer', experience: '6 years', score: 92, skillsScore: 95, experienceScore: 90, educationScore: 88, matched: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'], unmatched: ['AWS', 'Redis'] },
    { initials: 'KN', name: 'Kelly Nartey', role: 'Backend Engineer', experience: '4 years', score: 88, skillsScore: 85, experienceScore: 82, educationScore: 90, matched: ['Python', 'Django', 'PostgreSQL'], unmatched: ['GCP', 'Kafka'] },
    { initials: 'LM', name: 'Lawrence Mensah', role: 'Software Engineer', experience: '3 years', score: 74, skillsScore: 72, experienceScore: 70, educationScore: 80, matched: ['Python', 'Flask', 'MongoDB'], unmatched: ['React'] },
  ]

  return (
    <div className="p-6">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Candidate ranking</h1>
          <p className="text-[13px] text-text-muted mt-1">Software Engineer - Backend • 42 candidates ranked</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 rounded-btn border border-border-strong text-[13px] text-text-body hover:bg-bg-subtle transition-colors">
            <RefreshCw size={14} />
            Re-rank
          </button>
          <button className="flex items-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors">
            <Download size={14} />
            Export
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {candidates.map((c, i) => (
          <div
            key={c.name}
            className={`bg-bg-surface rounded-card p-4 flex items-start gap-4
              ${i === 0 ? 'border-[1.5px] border-accent' : 'border-[0.5px] border-border'}`}
          >
            <div className="text-[15px] font-medium text-text-muted w-6 text-center shrink-0 pt-1">
              {i + 1}
            </div>

            <div className="w-11 h-11 rounded-full bg-purple-tint flex items-center justify-center text-[13px] font-medium text-purple-text shrink-0">
              {c.initials}
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
              <p className="text-[12px] text-text-muted mt-0.5">{c.role} • {c.experience} experience</p>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {c.matched.map(skill => (
                  <span key={skill} className="text-[11px] font-medium text-success-text bg-success-tint px-2 py-0.5 rounded-subtle">
                    {skill}
                  </span>
                ))}
                {c.unmatched.map(skill => (
                  <span key={skill} className="text-[11px] text-text-muted bg-bg-subtle px-2 py-0.5 rounded-subtle">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6 mt-3">
                {[
                  { label: 'Skills match', value: c.skillsScore },
                  { label: 'Experience', value: c.experienceScore },
                  { label: 'Education', value: c.educationScore },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-text-muted">{label}</span>
                      <span className="text-[11px] font-medium text-text-body">{value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-subtle overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.score >= 75 ? 'bg-accent' : 'bg-score-amber'}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="flex flex-col items-center">
                <ScoreCircle score={c.score} />
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
