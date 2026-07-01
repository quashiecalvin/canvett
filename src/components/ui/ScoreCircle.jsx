function getScoreStyle(score) {
  if (score >= 75) return 'bg-success-tint text-success-text'
  if (score >= 50) return 'bg-warning-tint text-warning-text'
  return 'bg-danger-tint text-danger-text'
}

export default function ScoreCircle({ score }) {
  return (
    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getScoreStyle(score)}`}>
      <span className="text-[15px] font-medium">{score}%</span>
    </div>
  )
}