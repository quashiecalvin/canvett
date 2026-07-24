import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Code2, SquareActivity, Palette, Briefcase, Megaphone, MapPin, ArrowRight } from 'lucide-react'
import FilterDropdown from '../../components/ui/FilterDropdown'
import { getPublicJobs } from '../../lib/api'

const iconForDepartment = {
  Engineering: Code2,
  Analytics: SquareActivity,
  Design: Palette,
  Product: Briefcase,
  Marketing: Megaphone,
  Operations: Briefcase,
}

function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}

export default function JobBoard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const navigate = useNavigate()

  useEffect(() => {
    getPublicJobs()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const departments = ['All', ...new Set(jobs.map((j) => j.department).filter(Boolean))]

  const term = search.trim().toLowerCase()
  const filtered = jobs.filter((job) => {
    const matchesDept = department === 'All' || job.department === department
    if (!matchesDept) return false
    if (!term) return true
    return [job.title, job.company, job.location, job.department]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(term))
  })

  return (
    <div className="p-6 flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Browse jobs</h1>
        <p className="text-[13px] text-text-muted mt-1">
          Open roles from employers hiring through Canvett
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, company or location"
            className="w-full h-9 pl-9 pr-3 rounded-btn border border-border bg-bg-surface text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent"
          />
        </div>
        {departments.length > 2 && (
          <FilterDropdown
            icon={Filter}
            label="Department"
            value={department}
            options={departments}
            onChange={setDepartment}
          />
        )}
      </div>

      {loading && <p className="text-[13px] text-text-muted">Loading roles...</p>}

      {error && (
        <div className="bg-danger-tint border border-danger/25 rounded-card px-4 py-3">
          <p className="text-[13px] text-danger">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="text-[12px] text-text-muted">
            {filtered.length} {filtered.length === 1 ? 'role' : 'roles'}
            {department !== 'All' && ` in ${department}`}
          </p>

          {filtered.length === 0 ? (
            <div className="bg-bg-surface border border-border rounded-card px-4 py-12 text-center">
              <Search size={20} className="mx-auto text-text-hint" />
              <p className="text-[13px] text-text-body mt-3">
                {jobs.length === 0
                  ? 'There are no open roles at the moment.'
                  : 'No roles match your search.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map((job) => {
                const Icon = iconForDepartment[job.department] || Briefcase
                return (
                  <button
                    key={job.id}
                    onClick={() => navigate(`/seeker/jobs/${job.id}`)}
                    className="group bg-bg-surface border border-border rounded-card p-4 flex items-start gap-4 text-left transition-colors hover:border-accent-light focus:outline-none focus:border-accent"
                  >
                    <div className="w-10 h-10 rounded-btn bg-accent-tint flex items-center justify-center text-accent shrink-0">
                      <Icon size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-[15px] font-medium text-text-primary leading-[1.3] truncate">
                        {job.title}
                      </h2>
                      <p className="text-[12px] text-text-muted mt-0.5 truncate">
                        {job.company} • {job.department} • Posted {timeAgo(job.posted_date)}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                          <MapPin size={11} />
                          {job.location}
                        </span>
                        <span className="text-[11px] text-text-hint">•</span>
                        <span className="text-[11px] text-text-muted">{job.employment_type}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {(job.required_skills || []).slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="bg-accent-tint text-accent text-[11px] font-medium px-2 py-0.5 rounded-btn"
                          >
                            {skill}
                          </span>
                        ))}
                        {(job.required_skills || []).length > 5 && (
                          <span className="bg-bg-subtle text-text-muted text-[11px] font-medium px-2 py-0.5 rounded-btn">
                            +{job.required_skills.length - 5}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-text-hint shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
