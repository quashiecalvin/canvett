import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bookmark, MapPin, Briefcase, Clock, ChevronDown } from 'lucide-react'
import { getSavedJobs, unsaveJob } from '../../lib/api'
import { daysAgo } from '../../lib/time'

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
    ? <img src={logo} alt={name} className="w-14 h-14 rounded-xl object-contain bg-white border border-border shrink-0" />
    : <div className="w-14 h-14 text-[15px] rounded-xl flex items-center justify-center text-white font-semibold shrink-0" style={{ background: companyColor(name) }}>{monogram(name)}</div>
}

export default function SavedJobs() {
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState('saved')
  const navigate = useNavigate()

  useEffect(() => {
    getSavedJobs().then(setSaved).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function remove(jobId, e) {
    e.stopPropagation()
    const prev = saved
    setSaved((s) => s.filter((j) => j.job_id !== jobId))
    try { await unsaveJob(jobId) } catch { setSaved(prev) }
  }

  const sorted = useMemo(() => {
    const arr = [...saved]
    if (sort === 'posted') arr.sort((a, b) => new Date(b.posted_date || 0) - new Date(a.posted_date || 0))
    else if (sort === 'company') arr.sort((a, b) => (a.company || '').localeCompare(b.company || ''))
    else arr.sort((a, b) => new Date(b.saved_at || 0) - new Date(a.saved_at || 0))
    return arr
  }, [saved, sort])

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Saved Jobs</h1>
          <p className="text-[13px] text-text-muted mt-1">Jobs you've saved for later.</p>
        </div>
        {saved.length > 0 && (
          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 pl-3 pr-9 rounded-btn border border-border bg-bg-surface text-[13px] text-text-body appearance-none cursor-pointer focus:outline-none focus:border-accent transition-colors"
            >
              <option value="saved">Sort by: Recently saved</option>
              <option value="posted">Sort by: Recently posted</option>
              <option value="company">Sort by: Company (A–Z)</option>
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
          </div>
        )}
      </div>

      {loading && <p className="text-[13px] text-text-muted">Loading saved roles…</p>}

      {error && (
        <div className="bg-danger-tint border border-danger/25 rounded-card px-4 py-3">
          <p className="text-[13px] text-danger">{error}</p>
        </div>
      )}

      {!loading && !error && saved.length === 0 && (
        <div className="border border-dashed border-border-strong rounded-card px-4 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-bg-subtle flex items-center justify-center mx-auto">
            <Bookmark size={22} className="text-text-hint" />
          </div>
          <p className="text-[14.5px] font-medium text-text-primary mt-4">No saved jobs yet</p>
          <p className="text-[12.5px] text-text-muted mt-1">Bookmark jobs you're interested in and come back to them later.</p>
          <Link to="/seeker/jobs" className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline underline-offset-2">
            Browse open roles
          </Link>
        </div>
      )}

      {!loading && !error && saved.length > 0 && (
        <div className="flex flex-col gap-3">
          {sorted.map((j) => (
            <div
              key={j.job_id}
              onClick={() => navigate(`/seeker/jobs/${j.job_id}`)}
              className="group bg-bg-surface border border-border rounded-card p-5 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:border-accent-light hover:shadow-sm"
            >
              {companyMark(j.company, j.company_logo)}

              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold text-text-primary leading-tight truncate group-hover:text-accent transition-colors">{j.title}</h3>
                <p className="text-[12.5px] font-medium text-accent mt-0.5 truncate">{j.company}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[12px] text-text-muted">
                  {j.location && <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-text-hint" />{j.location}</span>}
                  {j.employment_type && <span className="inline-flex items-center gap-1.5"><Briefcase size={13} className="text-text-hint" />{j.employment_type}</span>}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(j.required_skills || []).slice(0, 3).map((skill) => (
                    <span key={skill} className="bg-bg-subtle text-text-body text-[11px] font-medium px-2.5 py-1 rounded-btn">{skill}</span>
                  ))}
                  {(j.required_skills || []).length > 3 && (
                    <span className="bg-bg-subtle text-text-muted text-[11px] font-medium px-2.5 py-1 rounded-btn">+{j.required_skills.length - 3}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between self-stretch gap-3 shrink-0">
                <button
                  onClick={(e) => remove(j.job_id, e)}
                  aria-label="Remove from saved"
                  className="w-9 h-9 rounded-btn flex items-center justify-center bg-accent-tint text-accent hover:bg-danger-tint hover:text-danger transition-colors"
                >
                  <Bookmark size={16} fill="currentColor" />
                </button>
                {j.saved_at && (
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-text-hint whitespace-nowrap">
                    <Clock size={12} /> Saved {daysAgo(j.saved_at)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
