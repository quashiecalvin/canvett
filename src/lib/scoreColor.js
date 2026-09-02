export function scoreBarColor(value) {
  if (value >= 75) return "bg-success"
  if (value >= 50) return "bg-accent"
  return "bg-danger"
}

export function scoreToneClass(score) {
  if (score >= 75) return "bg-success-tint text-success-text"
  if (score >= 50) return "bg-accent-tint text-accent"
  return "bg-danger-tint text-danger-text"
}
