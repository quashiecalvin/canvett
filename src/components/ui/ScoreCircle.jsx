import { scoreToneClass } from '../../lib/scoreColor'

export default function ScoreCircle({ score }) {
  return (
    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${scoreToneClass(score)}`}>
      <span className="text-[15px] font-medium">{score}%</span>
    </div>
  )
}
