import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, ChevronRight, ChevronDown, FileSearch, Upload, FileText } from 'lucide-react'
import { getMyApplications } from '../../lib/api'
import { formatLongDate } from '../../lib/time'

const COMPANY_COLORS = ['#2F6FB0', '#5A8F3C', '#C77D2E', '#B0505A', '#6E5AAE', '#2A9AA0', '#B85C9E']
function companyColor(name) {
  let h = 0
  for (const c of (name || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return COMPANY_COLORS[h % COMPANY_COLORS.length]
}
function monogram(name) {
  const m = (name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('')
  return (m || '?').toUpperCase()
}
function companyMark(name, logo) {
  return logo
    ? <img src={logo} alt={name} className="w-12 h-12 rounded-xl object-contain bg-white border border-border shrink-0" />
    : <div className="w-12 h-12 text-[13px] rounded-xl flex items-center justify-center text-white font-semibold shrink-0" style={{ background: companyColor(name) }}>{monogram(name)}</div>
}

// Seeker-facing statuses (Rejected is intentionally not surfaced to seekers)
const GROUPS = [
  { status: 'Under review', label: 'In review', pill: 'bg-warning-tint text-warning-text' },
  { status: 'Shortlisted', label: 'Shortlisted', pill: 'bg-success-tint text-success-text' },
]
const STATUS_META = Object.fromEntries(GROUPS.map((g) => [g.status, g]))

export default function MyApplications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('all')
  const [sort, setSort] = useState('recent')
  const navigate = useNavigate()

  useEffect(() => {
    getMyApplications().then(setApps).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const c = {}
    apps.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1 })
    return c
  }, [apps])

  const sortedApps = useMemo(() => {
    const arr = [...apps]
    if (sort === 'oldest') arr.sort((a, b) => new Date(a.applied_on) - new Date(b.applied_on))
    else if (sort === 'company') arr.sort((a, b) => (a.company || '').localeCompare(b.company || ''))
    else arr.sort((a, b) => new Date(b.applied_on) - new Date(a.applied_on))
    return arr
  }, [apps, sort])

  const tabs = [
    { key: 'all', label: 'All Applications', count: apps.length },
    { key: 'Under review', label: 'In review', count: counts['Under review'] || 0 },
    { key: 'Shortlisted', label: 'Shortlisted', count: counts['Shortlisted'] || 0 },
  ]

  const groups = GROUPS
    .filter((g) => tab === 'all' || tab === g.status)
    .map((g) => ({ ...g, items: sortedApps.filter((a) => a.status === g.status) }))

  const Row = (a) => {
    const meta = STATUS_META[a.status] || { label: a.status, pill: 'bg-bg-subtle text-text-muted' }
    const MethodIcon = a.method === 'upload' ? Upload : FileText
    return (
      <div
        key={a.application_id}
        onClick={() => a.job_id && navigate(`/seeker/jobs/${a.job_id}`)}
        className="group flex items-center gap-4 p-4 cursor-pointer hover:bg-bg-subtle transition-colors"
      >
        {companyMark(a.company, a.company_logo)}
        <div className="min-w-0 flex-1">
          <h3 className="text-[14.5px] font-semibold text-text-primary leading-tight truncate group-hover:text-accent transition-colors">{a.job_title}</h3>
          <p className="text-[12.5px] font-medium text-accent mt-0.5 truncate">{a.company}</p>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-1.5 text-[12px] text-text-muted">
            {a.location && <span className="inline-flex items-center gap-1.5"><MapPin size={12.5} className="text-text-hint" />{a.location}</span>}
            {a.department && <span className="inline-flex items-center gap-1.5"><Briefcase size={12.5} className="text-text-hint" />{a.department}</span>}
            <span className="inline-flex items-center gap-1.5 text-text-hint"><MethodIcon size={12.5} />Applied {formatLongDate(a.applied_on)}</span>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[11.5px] font-medium ${meta.pill}`}>{meta.label}</span>
        <ChevronRight size={16} className="text-text-hint shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">My Applications</h1>
          <p className="text-[13px] text-text-muted mt-1">Track the status of jobs you've applied for.</p>
        </div>
        {apps.length > 0 && (
          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 pl-3 pr-9 rounded-btn border border-border bg-bg-surface text-[13px] text-text-body appearance-none cursor-pointer focus:outline-none focus:border-accent transition-colors"
            >
              <option value="recent">Sort by: Recently applied</option>
              <option value="oldest">Sort by: Oldest first</option>
              <option value="company">Sort by: Company (A–Z)</option>
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
          </div>
        )}
      </div>

      {loading && <p className="text-[13px] text-text-muted">Loading your applications…</p>}

      {error && (
        <div className="bg-danger-tint border border-danger/25 rounded-card px-4 py-3">
          <p className="text-[13px] text-danger">{error}</p>
        </div>
      )}

      {!loading && !error && apps.length === 0 && (
        <div className="bg-bg-surface border border-border rounded-card px-4 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-bg-subtle flex items-center justify-center mx-auto">
            <FileSearch size={22} className="text-text-hint" />
          </div>
          <p className="text-[14.5px] font-medium text-text-primary mt-4">No applications yet</p>
          <p className="text-[12.5px] text-text-muted mt-1">Once you apply to a role, you'll be able to track it here.</p>
          <Link to="/seeker/jobs" className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline underline-offset-2">
            Browse open roles
          </Link>
        </div>
      )}

      {!loading && !error && apps.length > 0 && (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
                  tab === t.key ? 'text-accent' : 'text-text-muted hover:text-text-body'
                }`}
              >
                {t.label}
                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-accent-tint text-accent' : 'bg-bg-subtle text-text-muted'}`}>{t.count}</span>
                {tab === t.key && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent rounded-full" />}
              </button>
            ))}
          </div>

          {/* Groups */}
          {groups.every((g) => g.items.length === 0) ? (
            <div className="bg-bg-surface border border-border rounded-card px-4 py-12 text-center">
              <p className="text-[13px] text-text-muted">No applications in this category.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {groups.map((g) => g.items.length > 0 && (
                <div key={g.status}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-hint mb-2 px-0.5">{g.label} · {g.items.length}</p>
                  <div className="bg-bg-surface border border-border rounded-card divide-y divide-border overflow-hidden">
                    {g.items.map(Row)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
