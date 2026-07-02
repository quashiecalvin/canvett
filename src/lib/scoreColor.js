export function scoreBarColor(value) {
  if (value >= 75) return "bg-success"
  if (value >= 50) return "bg-score-amber"
  return "bg-danger"
}
