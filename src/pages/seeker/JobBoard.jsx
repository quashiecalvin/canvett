import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Code2, SquareActivity, Palette, Briefcase, Megaphone, MapPin, Clock } from 'lucide-react'
import FilterDropdown from '../../components/ui/FilterDropdown'
import { getPublicJobs } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import ApplyChooserModal from '../../components/seeker/ApplyChooserModal'

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

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function JobBoard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState("All")
  const [applyJob, setApplyJob] = useState(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const firstName = (user?.full_name || '').trim().split(' ')[0]

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
      {/* Hero band */}
      <div className="rounded-card border border-border">
        <div className="bg-accent px-6 py-7 rounded-card">
          <h1 className="text-[22px] font-medium text-white leading-[1.2]">
  {firstName ? `${greeting()}, ${firstName} 👋` : `${greeting()} 👋`}
</h1>
          <p className="text-[13px] text-white/80 mt-1">
            Browse open roles from employers hiring through Canvett.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-hint" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, company or location"
                className="w-full h-11 pl-10 pr-3 rounded-btn border-0 bg-bg-surface text-[13.5px] text-text-body placeholder:text-text-hint focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
            {departments.length > 2 && (
              <div className="sm:w-48">
                <FilterDropdown
                  icon={Filter}
                  label="Department"
                  value={department}
                  options={departments}
                  onChange={setDepartment}
                  buttonClass="border-0 bg-bg-surface text-text-body hover:bg-white w-full justify-between"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && <p className="text-[13px] text-text-muted">Loading roles...</p>}

      {error && (
        <div className="bg-danger-tint border border-danger/25 rounded-card px-4 py-3">
          <p className="text-[13px] text-danger">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-text-primary">
              {filtered.length} {filtered.length === 1 ? 'role' : 'roles'} open
              {department !== 'All' && ` in ${department}`}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-bg-surface border border-border rounded-card px-4 py-14 text-center">
              <div className="w-11 h-11 rounded-full bg-bg-subtle flex items-center justify-center mx-auto">
                <Search size={20} className="text-text-hint" />
              </div>
              <p className="text-[14px] font-medium text-text-primary mt-4">
                {jobs.length === 0 ? 'No open roles right now' : 'No roles match your search'}
              </p>
              <p className="text-[12.5px] text-text-muted mt-1">
                {jobs.length === 0
                  ? 'Check back soon — new roles are posted regularly.'
                  : 'Try a different search term or clear the filter.'}
              </p>
              {jobs.length > 0 && (search || department !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setDepartment('All') }}
                  className="mt-4 text-[13px] font-medium text-accent hover:underline underline-offset-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((job) => {
                const Icon = iconForDepartment[job.department] || Briefcase
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/seeker/jobs/${job.id}`)}
                    className="group bg-bg-surface border border-border rounded-card p-5 flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-accent-light"
                  >
                    {/* Icon + title */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-btn bg-accent-tint flex items-center justify-center text-accent shrink-0 transition-transform duration-200 group-hover:scale-105">
                        <Icon size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-[14.5px] font-medium text-text-primary leading-[1.3] line-clamp-2 group-hover:text-accent transition-colors">
                          {job.title}
                        </h2>
                        <p className="text-[12px] text-text-muted mt-0.5 truncate">
                          {job.company}
                        </p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                        <MapPin size={11} />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                        <Briefcase size={11} />
                        {job.employment_type}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(job.required_skills || []).slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="bg-accent-tint text-accent text-[11px] font-medium px-2 py-0.5 rounded-btn"
                        >
                          {skill}
                        </span>
                      ))}
                      {(job.required_skills || []).length > 3 && (
                        <span className="bg-bg-subtle text-text-muted text-[11px] font-medium px-2 py-0.5 rounded-btn">
                          +{job.required_skills.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Footer: posted + apply */}
                    <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border">
                      <span className="inline-flex items-center gap-1 text-[11px] text-text-hint">
                        <Clock size={11} />
                        {timeAgo(job.posted_date)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setApplyJob(job) }}
                        className="h-8 px-4 rounded-btn bg-accent text-white text-[12.5px] font-medium hover:bg-accent-2 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {applyJob && (
        <ApplyChooserModal
          jobId={applyJob.id}
          jobTitle={applyJob.title}
          onClose={() => setApplyJob(null)}
        />
      )}
    </div>
  )
}
