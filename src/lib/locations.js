// Canonical location options for job creation. Offering a consistent list (via a
// datalist, so recruiters can still type a value not shown) keeps the job-board
// location filter clean instead of accumulating variants like "Accra" and
// "Accra, Ghana". "Remote" is included for location-independent roles.
export const LOCATIONS = [
  'Remote',
  'Accra',
  'Kumasi',
  'Tamale',
  'Takoradi',
  'Sekondi-Takoradi',
  'Cape Coast',
  'Tema',
  'Sunyani',
  'Koforidua',
  'Ho',
  'Wa',
  'Bolgatanga',
  'Techiman',
  'Obuasi',
  'Ashaiman',
  'Madina',
  'Kasoa',
  'Winneba',
  'Nsawam',
]

// Normalise a location string for de-duplication and matching: trim, collapse
// inner whitespace, and drop a trailing ", Ghana" so "Accra" and "Accra, Ghana"
// are treated as the same place. Returns a display-cased value.
export function normalizeLocation(value) {
  if (!value) return ''
  let v = value.trim().replace(/\s+/g, ' ')
  v = v.replace(/,\s*ghana$/i, '')
  return v.trim()
}
