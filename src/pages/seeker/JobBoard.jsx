import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  Search, Briefcase, MapPin, Clock, Bookmark, ArrowRight, PieChart, ChevronDown,
} from 'lucide-react'
import {
  getPublicJobs, getSavedJobs, saveJob, unsaveJob, getMyApplications,
} from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { daysAgo } from '../../lib/time'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const STATUS_META = [
  { key: 'Under review', label: 'In review', color: 'var(--color-accent)' },
  { key: 'Shortlisted', label: 'Shortlisted', color: 'var(--color-success)' },
]

const COMPANY_COLORS = ['#2F6FB0', '#5A8F3C', '#C77D2E', '#B0505A', '#6E5AAE', '#2A9AA0', '#B85C9E']
function companyColor(name) {
  let h = 0
  for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return COMPANY_COLORS[h % COMPANY_COLORS.length]
}
function monogram(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  const m = parts.slice(0, 2).map((w) => w[0]).join('')
  return (m || '?').toUpperCase()
}

/* ---------- Generic donut ---------- */
function Donut({ segments, total }) {
  const size = 132
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let acc = 0
  const arcs = segments.map((s) => {
    const frac = total ? s.value / total : 0
    const arc = { ...s, dash: frac * c, gap: c - frac * c, rot: acc }
    acc += frac * c
    return arc
  })
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--color-bg-subtle)" strokeWidth={stroke} />
        {total > 0 && arcs.map((s) => (
          s.value > 0 && (
            <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.rot} />
          )
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[26px] font-semibold text-text-primary leading-none">{total}</span>
        <span className="text-[10.5px] text-text-muted mt-1">applications</span>
      </div>
    </div>
  )
}

/* ---------- Profile completion (fields filled / total) ---------- */
function useProfilePct(user) {
  return useMemo(() => {
    const fields = [
      user?.full_name, user?.headline, user?.location,
      user?.phone, user?.skills, user?.bio,
    ]
    const done = fields.filter((v) => !!(v || '').trim()).length
    return Math.round((done / fields.length) * 100)
  }, [user])
}

export default function JobBoard() {
  const [searchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [locationFilter, setLocationFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [savedIds, setSavedIds] = useState(new Set())
  const [apps, setApps] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [showAllCompanies, setShowAllCompanies] = useState(false)
  const navigate = useNavigate()
  const resultsRef = useRef(null)
  const { user } = useAuth()

  const firstName = (user?.full_name || '').trim().split(' ')[0]
  const profilePct = useProfilePct(user)

  useEffect(() => {
    getPublicJobs()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    getSavedJobs()
      .then((list) => setSavedIds(new Set(list.map((j) => j.job_id))))
      .catch(() => {})
    getMyApplications()
      .then(setApps)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null) setSearch(q)
  }, [searchParams])

  const appCounts = useMemo(() => {
    const c = {}
    apps.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1 })
    return c
  }, [apps])

  const statusSegments = STATUS_META.map((s) => ({
    label: s.label, value: appCounts[s.key] || 0, color: s.color,
  }))

  const companies = useMemo(
    () => new Set(apps.map((a) => a.company).filter(Boolean)).size, [apps],
  )
  const thisMonth = useMemo(
    () => apps.filter((a) => a.applied_on && Date.now() - new Date(a.applied_on) < 30 * 86400000).length,
    [apps],
  )
  const shortlistRate = apps.length
    ? Math.round(((appCounts['Shortlisted'] || 0) / apps.length) * 100)
    : null

  async function toggleSave(job, e) {
    e.stopPropagation()
    const isSaved = savedIds.has(job.id)
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (isSaved) next.delete(job.id); else next.add(job.id)
      return next
    })
    try {
      if (isSaved) await unsaveJob(job.id); else await saveJob(job.id)
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (isSaved) next.add(job.id); else next.delete(job.id)
        return next
      })
    }
  }

  const locations = [...new Set(jobs.map((j) => j.location).filter(Boolean))].sort()
  const types = [...new Set(jobs.map((j) => j.employment_type).filter(Boolean))].sort()
  const popular = [...new Set(jobs.map((j) => j.department).filter(Boolean))].slice(0, 5)
  const term = search.trim().toLowerCase()
  const filtered = jobs.filter((job) => {
    if (locationFilter !== 'All' && job.location !== locationFilter) return false
    if (typeFilter !== 'All' && job.employment_type !== typeFilter) return false
    if (!term) return true
    return [job.title, job.company, job.location, job.department]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(term))
  })
  const hasFilters = !!term || locationFilter !== 'All' || typeFilter !== 'All'

  function clearFilters() {
    setSearch(''); setLocationFilter('All'); setTypeFilter('All'); setShowAll(false)
  }
  function runSearch() {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ---- curated sections ----
  const userSkills = (user?.skills || '').toLowerCase().split(/[,;]/).map((s) => s.trim()).filter(Boolean)
  const appliedDepts = new Set(apps.map((a) => a.department).filter(Boolean))
  const prefField = user?.pref_field || ''
  const prefType = user?.pref_job_type || ''
  const prefLoc = (user?.pref_location || '').toLowerCase()
  function relevance(job) {
    let s = 0
    const js = (job.required_skills || []).map((x) => x.toLowerCase())
    userSkills.forEach((u) => { if (js.some((j) => j.includes(u) || u.includes(j))) s += 2 })
    if (prefField && job.department === prefField) s += 3
    if (appliedDepts.has(job.department)) s += 1
    if (prefType && job.employment_type === prefType) s += 2
    if (prefLoc && (job.location || '').toLowerCase().includes(prefLoc)) s += 1
    return s
  }
  const byNewest = [...jobs].sort((a, b) => new Date(b.posted_date) - new Date(a.posted_date))
  const recommended = [...jobs]
    .map((j) => ({ j, s: relevance(j) }))
    .sort((a, b) => b.s - a.s || new Date(b.j.posted_date) - new Date(a.j.posted_date))
    .slice(0, 4)
    .map((x) => x.j)
  const latest = byNewest.slice(0, 5)
  const allCompanies = Object.entries(
    jobs.reduce((m, j) => { const c = j.company || '—'; m[c] = (m[c] || 0) + 1; return m }, {}),
  ).sort((a, b) => b[1] - a[1])
  const topCompanies = allCompanies.slice(0, 6)
  const companyLogos = {}
  jobs.forEach((j) => { if (j.company && j.company_logo && !companyLogos[j.company]) companyLogos[j.company] = j.company_logo })

  const companyMark = (name, logo, boxClass, textClass) => (
    logo
      ? <img src={logo} alt={name} className={`${boxClass} rounded-btn object-contain bg-white border border-border shrink-0`} />
      : <div className={`${boxClass} ${textClass} rounded-btn flex items-center justify-center text-white font-semibold shrink-0`} style={{ background: companyColor(name) }}>{monogram(name)}</div>
  )

  const rowFull = (job) => {
    const isSaved = savedIds.has(job.id)
    return (
      <div
        key={job.id}
        onClick={() => navigate(`/seeker/jobs/${job.id}`)}
        className="group flex items-start gap-3.5 p-3.5 rounded-btn cursor-pointer hover:bg-bg-subtle transition-colors"
      >
        {companyMark(job.company, job.company_logo, 'w-11 h-11', 'text-[13px]')}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[14px] font-medium text-text-primary truncate group-hover:text-accent transition-colors">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5 text-[12px] text-text-muted">
                <span className="truncate">{job.company}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                <span className="inline-flex items-center gap-1"><Briefcase size={11} />{job.employment_type}</span>
              </div>
            </div>
            <button
              onClick={(e) => toggleSave(job, e)}
              aria-label={isSaved ? 'Remove from saved' : 'Save job'}
              className={`w-8 h-8 rounded-btn flex items-center justify-center shrink-0 transition-colors ${
                isSaved ? 'bg-accent-tint text-accent' : 'text-text-hint hover:bg-bg-surface hover:text-text-body'
              }`}
            >
              <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {(job.required_skills || []).slice(0, 3).map((skill) => (
              <span key={skill} className="bg-accent-tint text-accent text-[11px] font-medium px-2 py-0.5 rounded-btn">{skill}</span>
            ))}
            {(job.required_skills || []).length > 3 && (
              <span className="bg-bg-subtle text-text-muted text-[11px] font-medium px-2 py-0.5 rounded-btn">+{job.required_skills.length - 3}</span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-text-hint ml-auto"><Clock size={11} />{daysAgo(job.posted_date)}</span>
          </div>
        </div>
      </div>
    )
  }

  const rowCompact = (job) => {
    const isSaved = savedIds.has(job.id)
    return (
      <div
        key={job.id}
        onClick={() => navigate(`/seeker/jobs/${job.id}`)}
        className="group flex items-center gap-3 p-2.5 rounded-btn cursor-pointer hover:bg-bg-subtle transition-colors"
      >
        {companyMark(job.company, job.company_logo, 'w-9 h-9', 'text-[12px]')}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-text-primary truncate group-hover:text-accent transition-colors">{job.title}</p>
          <p className="text-[11.5px] text-text-muted truncate mt-0.5">{job.company} · {job.location}</p>
        </div>
        <button
          onClick={(e) => toggleSave(job, e)}
          aria-label={isSaved ? 'Remove from saved' : 'Save job'}
          className={`w-8 h-8 rounded-btn flex items-center justify-center shrink-0 transition-colors ${
            isSaved ? 'text-accent' : 'text-text-hint hover:text-text-body'
          }`}
        >
          <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Two-column: jobs + right rail */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
        {/* Main column */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Hero band */}
          <div className="rounded-card overflow-hidden border border-border">
            <div className="relative px-6 py-7 sm:px-8 sm:py-8 bg-bg-surface overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(120deg, color-mix(in srgb, var(--color-accent) 34%, var(--color-bg-surface)) 0%, color-mix(in srgb, var(--color-accent) 24%, var(--color-bg-surface)) 100%)' }}
              />
              <div className="relative flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1 max-w-2xl">
                  <p className="text-[13px] font-medium text-text-body">
                    {firstName ? `${greeting()}, ${firstName}! \ud83d\udc4b` : `${greeting()}! \ud83d\udc4b`}
                  </p>
                  <h1 className="font-outfit text-[27px] sm:text-[30px] font-semibold text-text-primary leading-[1.15] tracking-[-0.4px] mt-1.5">
                    Find your next opportunity
                  </h1>
                  <p className="text-[13px] text-text-muted mt-2 max-w-md leading-relaxed">
                    Discover jobs from top companies that match your skills and experience.
                  </p>

                  {/* Filters + search */}
                  <div className="flex flex-wrap gap-2.5 mt-5">
                    <div className="relative w-full sm:w-44">
                      <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full h-11 pl-9 pr-8 rounded-btn bg-bg-surface border border-border text-[13px] text-text-body appearance-none cursor-pointer focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors"
                      >
                        <option value="All">Location</option>
                        {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
                    </div>

                    <div className="relative w-full sm:w-44">
                      <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full h-11 pl-9 pr-8 rounded-btn bg-bg-surface border border-border text-[13px] text-text-body appearance-none cursor-pointer focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors"
                      >
                        <option value="All">Job type</option>
                        {types.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
                    </div>

                    <button
                      onClick={runSearch}
                      className="h-11 px-5 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent-2 transition-colors shrink-0 whitespace-nowrap"
                    >
                      Search Jobs
                    </button>
                  </div>

                  {/* Popular searches */}
                  {popular.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <span className="text-[12px] text-text-muted">Popular searches:</span>
                      {popular.map((p) => (
                        <button
                          key={p}
                          onClick={() => { setSearch(p); runSearch() }}
                          className="text-[12px] font-medium text-text-body bg-bg-subtle border border-border rounded-full px-3 py-1 hover:border-accent hover:text-accent transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Illustration */}
                <div className="hidden lg:flex relative w-[190px] h-[170px] shrink-0 items-center justify-center">
                  <div className="absolute w-36 h-36 rounded-full bg-accent/10" />
                  <div className="relative w-24 h-24 rounded-[26px] bg-accent/15 flex items-center justify-center">
                    <Briefcase size={48} className="text-accent" strokeWidth={1.75} />
                  </div>
                  <div className="absolute bottom-3 right-5 w-12 h-12 rounded-full bg-bg-surface shadow-md flex items-center justify-center">
                    <Search size={22} className="text-accent" />
                  </div>
                  <span className="absolute top-3 left-4 w-2.5 h-2.5 rotate-45 rounded-[2px] bg-accent/30" />
                  <span className="absolute bottom-8 left-7 w-2 h-2 rotate-45 rounded-[2px] bg-accent/20" />
                  <span className="absolute top-10 right-3 w-2 h-2 rotate-45 rounded-[2px] bg-accent/25" />
                </div>
              </div>
            </div>
          </div>
          {loading && <p className="text-[13px] text-text-muted">Loading roles...</p>}

          {error && (
            <div className="bg-danger-tint border border-danger/25 rounded-card px-4 py-3">
              <p className="text-[13px] text-danger">{error}</p>
            </div>
          )}

          {/* Results view (search / filters / view-all) */}
          {!loading && !error && (hasFilters || showAll) && (
            <>
              <div ref={resultsRef} className="flex items-center justify-between scroll-mt-4">
                <p className="text-[13px] font-medium text-text-primary">
                  {filtered.length} {filtered.length === 1 ? 'role' : 'roles'} {hasFilters ? 'found' : 'open'}
                </p>
                <button onClick={clearFilters} className="text-[12.5px] font-medium text-accent hover:underline underline-offset-2">
                  {hasFilters ? 'Clear filters' : 'Back to home'}
                </button>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-bg-surface border border-border rounded-card px-4 py-14 text-center">
                  <div className="w-11 h-11 rounded-full bg-bg-subtle flex items-center justify-center mx-auto">
                    <Search size={20} className="text-text-hint" />
                  </div>
                  <p className="text-[14px] font-medium text-text-primary mt-4">No roles match your search</p>
                  <p className="text-[12.5px] text-text-muted mt-1">Try a different search term or clear the filters.</p>
                </div>
              ) : (
                <div className="bg-bg-surface border border-border rounded-card p-2 sm:p-3">
                  {filtered.map(rowFull)}
                </div>
              )}
            </>
          )}

          {/* Empty state (no jobs at all) */}
          {!loading && !error && !hasFilters && !showAll && jobs.length === 0 && (
            <div className="bg-bg-surface border border-border rounded-card px-4 py-14 text-center">
              <div className="w-11 h-11 rounded-full bg-bg-subtle flex items-center justify-center mx-auto">
                <Search size={20} className="text-text-hint" />
              </div>
              <p className="text-[14px] font-medium text-text-primary mt-4">No open roles right now</p>
              <p className="text-[12.5px] text-text-muted mt-1">Check back soon — new roles are posted regularly.</p>
            </div>
          )}

          {/* Curated home sections */}
          {!loading && !error && !hasFilters && !showAll && jobs.length > 0 && (
            <>
              {/* Recommended + Latest, side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
                {/* Recommended for you */}
                <div className="bg-bg-surface border border-border rounded-card p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2 px-1.5 pt-1 pb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <h2 className="text-[15px] font-medium text-text-primary whitespace-nowrap">Recommended for you</h2>
                      <span className="text-[10.5px] font-medium text-accent bg-accent-tint px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline">Based on your profile</span>
                    </div>
                    <button onClick={() => { setShowAll(true); runSearch() }} className="text-[12px] font-medium text-accent hover:underline underline-offset-2 shrink-0">View all</button>
                  </div>
                  <div className="flex flex-col">
                    {recommended.map(rowFull)}
                  </div>
                </div>

                {/* Latest job openings */}
                <div className="bg-bg-surface border border-border rounded-card p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2 px-1.5 pt-1 pb-1.5">
                    <h2 className="text-[15px] font-medium text-text-primary">Latest job openings</h2>
                    <button onClick={() => { setShowAll(true); runSearch() }} className="text-[12px] font-medium text-accent hover:underline underline-offset-2 shrink-0">View all</button>
                  </div>
                  <div className="flex flex-col">
                    {latest.map(rowCompact)}
                  </div>
                </div>
              </div>

              {/* Top companies hiring */}
              {topCompanies.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 px-0.5">
                    <h2 className="text-[15px] font-medium text-text-primary">Top companies hiring</h2>
                    {allCompanies.length > 6 && (
                      <button
                        onClick={() => setShowAllCompanies((v) => !v)}
                        className="text-[12px] font-medium text-accent hover:underline underline-offset-2"
                      >
                        {showAllCompanies ? 'Show fewer' : 'Explore all'}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(showAllCompanies ? allCompanies : topCompanies).map(([company, count]) => (
                      <button
                        key={company}
                        onClick={() => { setSearch(company); runSearch() }}
                        className="flex items-center gap-3 p-3.5 rounded-card border border-border bg-bg-surface hover:border-accent-light hover:shadow-sm transition-all text-left"
                      >
                        {companyMark(company, companyLogos[company], 'w-10 h-10', 'text-[13px]')}
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-text-primary truncate">{company}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">{count} open {count === 1 ? 'role' : 'roles'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right rail */}
        <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
          {/* 1 · Profile completion */}
          {profilePct < 100 && (
            <div className="bg-bg-surface border border-border rounded-card p-5">
              <h3 className="text-[13.5px] font-medium text-text-primary">Profile completion</h3>
              <p className="text-[12px] font-medium text-accent mt-1">{profilePct}% complete</p>
              <div className="h-2 rounded-full bg-bg-subtle mt-3 overflow-hidden">
                <div className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${profilePct}%` }} />
              </div>
              <p className="text-[12px] text-text-muted mt-3 leading-relaxed">
                Complete your profile to get better job matches.
              </p>
              <Link
                to="/seeker/profile"
                className="inline-flex items-center gap-1.5 mt-4 text-[12.5px] font-medium text-accent hover:gap-2 transition-all"
              >
                Complete now <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* 2 · Application status (donut) */}
          <div className="bg-bg-surface border border-border rounded-card p-5">
            <h3 className="text-[13.5px] font-medium text-text-primary">Application status</h3>
            {apps.length === 0 ? (
              <div className="flex flex-col items-center text-center py-5">
                <div className="w-10 h-10 rounded-full bg-bg-subtle flex items-center justify-center">
                  <PieChart size={18} className="text-text-hint" />
                </div>
                <p className="text-[12.5px] text-text-body font-medium mt-3">No applications yet</p>
                <p className="text-[11.5px] text-text-muted mt-0.5">Apply to a role to track its progress here.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 mt-4">
                <Donut segments={statusSegments} total={apps.length} />
                <div className="flex flex-col gap-2 w-full">
                  {statusSegments.map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-[12px] text-text-body flex-1 truncate">{s.label}</span>
                      <span className="font-mono text-[12px] font-medium text-text-primary">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3 · Application overview */}
          <div className="bg-bg-surface border border-border rounded-card p-5">
            <h3 className="text-[13.5px] font-medium text-text-primary">Application overview</h3>
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              {[
                { label: 'Companies', value: companies, dot: 'var(--color-accent)' },
                { label: 'Saved', value: savedIds.size, dot: 'var(--color-text-hint)' },
                { label: 'Shortlist rate', value: shortlistRate == null ? '—' : `${shortlistRate}%`, dot: 'var(--color-success)' },
                { label: 'This month', value: thisMonth, dot: 'var(--color-score-amber)' },
              ].map((t) => (
                <div key={t.label} className="rounded-btn border border-border bg-bg-subtle/40 px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.dot }} />
                    <span className="text-[11px] text-text-muted truncate">{t.label}</span>
                  </div>
                  <p className="font-mono text-[20px] font-semibold text-text-primary mt-1.5 leading-none">{t.value}</p>
                </div>
              ))}
            </div>
            <Link
              to="/seeker/applications"
              className="flex items-center justify-center gap-1.5 mt-3 h-9 rounded-btn border border-border text-[12.5px] font-medium text-text-body hover:bg-bg-subtle transition-colors"
            >
              View all applications <ArrowRight size={14} />
            </Link>
          </div>
        </aside>
      </div>

    </div>
  )
}
