import { scoreToneClass } from '../../lib/scoreColor'

export default function ScorePill({ score }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-pill text-[11px] font-medium ${scoreToneClass(score)}`}>
      {score}%
    </span>
  )
}
