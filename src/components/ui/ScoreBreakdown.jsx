import { AlertTriangle } from 'lucide-react'
import { scoreBarColor } from '../../lib/scoreColor'

const UNVERIFIED_HINT =
  'Experience duration could not be verified — CV did not follow the standard template'

/**
 * Skills / experience / education bars for a scored candidate.
 * `layout` is 'columns' on the ranking list and 'rows' inside the detail modal.
 */
export default function ScoreBreakdown({ scores, durationVerified, layout = 'rows' }) {
  const dimensions = [
    { key: 'skills', label: 'Skills match', value: scores.skills_score },
    { key: 'experience', label: 'Experience', value: scores.experience_score },
    { key: 'education', label: 'Education', value: scores.education_score },
  ]

  const columns = layout === 'columns'
  const textSize = columns ? 'text-[11px]' : 'text-[12px]'

  return (
    <div
      className={
        columns
          ? 'grid grid-cols-1 gap-2 mt-3 sm:grid-cols-3 sm:gap-6'
          : 'flex flex-col gap-3'
      }
    >
      {dimensions.map(({ key, label, value }) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`${textSize} text-text-muted flex items-center gap-1`}>
              {label}
              {key === 'experience' && !durationVerified && (
                <span title={UNVERIFIED_HINT}>
                  <AlertTriangle size={columns ? 11 : 12} className="text-warning-text" />
                </span>
              )}
            </span>
            <span className={`${textSize} font-medium text-text-body`}>{Math.round(value)}%</span>
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
  )
}
