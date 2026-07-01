function getScoreStyle(score) {
  if (score >= 75) return 'bg-success-tint text-success-text'
  if (score >= 50) return 'bg-warning-tint text-warning-text'
  return 'bg-danger-tint text-danger-text'
}

export default function ScorePill({ score }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-pill text-[11px] font-medium ${getScoreStyle(score)}`}>
      {score}%
    </span>
  )
}
