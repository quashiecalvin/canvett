// Canonical location options for job creation, in "City, Country" format so the
// job board shows consistent, unambiguous places (offered via a datalist, so a
// recruiter can still type a value not listed). "Remote" is included for
// location-independent roles.
const GHANA_CITIES = [
  'Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Sekondi-Takoradi', 'Cape Coast',
  'Tema', 'Sunyani', 'Koforidua', 'Ho', 'Wa', 'Bolgatanga', 'Techiman',
  'Obuasi', 'Ashaiman', 'Madina', 'Kasoa', 'Winneba', 'Nsawam',
]

export const LOCATIONS = ['Remote', ...GHANA_CITIES.map((c) => `${c}, Ghana`)]

const _CITY_LOOKUP = new Map(GHANA_CITIES.map((c) => [c.toLowerCase(), c]))

// Normalise a location for de-duplication and display. Known Ghanaian cities are
// canonicalised to "City, Ghana" (so "Accra" and "Accra, Ghana" collapse to the
// same option), "remote" to "Remote", and anything else (e.g. a foreign city
// already written as "City, State, Country") is passed through as typed.
export function normalizeLocation(value) {
  if (!value) return ''
  const v = value.trim().replace(/\s+/g, ' ')
  const base = v.replace(/,\s*ghana$/i, '').trim()
  if (base.toLowerCase() === 'remote') return 'Remote'
  const canon = _CITY_LOOKUP.get(base.toLowerCase())
  if (canon) return `${canon}, Ghana`
  return v
}
