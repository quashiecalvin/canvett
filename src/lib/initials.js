export function initialsFromName(name) {
  const cleaned = (name || '').replace(/[_-]/g, ' ').trim()
  if (!cleaned) return '?'

  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
