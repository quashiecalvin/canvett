// Location suggestions for job creation, in "City, Country" format. These power a
// datalist, so they are only suggestions — a recruiter can type any location
// (e.g. "Nairobi, Kenya" or a city not listed) and it is saved as typed. The
// list leads with Ghana (the primary market) and then covers major African and
// global hubs so most postings can be picked rather than typed.
const GHANA_CITIES = [
  'Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Sekondi-Takoradi', 'Cape Coast',
  'Tema', 'Sunyani', 'Koforidua', 'Ho', 'Wa', 'Bolgatanga', 'Techiman',
  'Obuasi', 'Ashaiman', 'Madina', 'Kasoa', 'Winneba', 'Nsawam',
]

const INTERNATIONAL_LOCATIONS = [
  // Africa
  'Lagos, Nigeria', 'Abuja, Nigeria', 'Nairobi, Kenya', 'Mombasa, Kenya',
  'Johannesburg, South Africa', 'Cape Town, South Africa', 'Cairo, Egypt',
  'Kigali, Rwanda', 'Dar es Salaam, Tanzania', 'Kampala, Uganda',
  'Addis Ababa, Ethiopia', 'Dakar, Senegal', 'Abidjan, Côte d’Ivoire',
  'Casablanca, Morocco', 'Lomé, Togo', 'Cotonou, Benin',
  // Global hubs
  'London, United Kingdom', 'Berlin, Germany', 'Dubai, United Arab Emirates',
  'New York, United States', 'Toronto, Canada',
]

export const LOCATIONS = [
  'Remote',
  ...GHANA_CITIES.map((c) => `${c}, Ghana`),
  ...INTERNATIONAL_LOCATIONS,
]

const _CITY_LOOKUP = new Map(GHANA_CITIES.map((c) => [c.toLowerCase(), c]))

// Normalise a location for de-duplication and display. Known Ghanaian cities are
// canonicalised to "City, Ghana" (so "Accra" and "Accra, Ghana" collapse to the
// same option), "remote" to "Remote", and anything else (e.g. "Nairobi, Kenya"
// or another country's city) is passed through exactly as entered.
export function normalizeLocation(value) {
  if (!value) return ''
  const v = value.trim().replace(/\s+/g, ' ')
  const base = v.replace(/,\s*ghana$/i, '').trim()
  if (base.toLowerCase() === 'remote') return 'Remote'
  const canon = _CITY_LOOKUP.get(base.toLowerCase())
  if (canon) return `${canon}, Ghana`
  return v
}
