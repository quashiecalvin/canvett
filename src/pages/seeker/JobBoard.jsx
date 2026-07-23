import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Building2, Briefcase, Search } from 'lucide-react'
import { getPublicJobs } from '../../lib/api'

function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000)
  if (days === 0) return 'Posted today'
  if (days === 1) return 'Posted yesterday'
  if (days < 30) return `Posted ${days} days ago`
  const months = Math.floor(days / 30)
  return `Posted ${months} month${months > 1 ? 's' : ''} ago`
}

export default function JobBoard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getPublicJobs()
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const term = query.trim().toLowerCase()
  const visible = term
    ? jobs.filter((job) =>
        [job.title, job.company, job.location, job.department]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(term))
      )
    : jobs

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
          Browse Jobs
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Open roles from employers hiring through Canvett.
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-hint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, company or location"
          className="w-full rounded-lg border border-border bg-bg-surface py-2.5 pl-10 pr-4 text-sm text-text-body placeholder:text-text-hint focus:border-accent focus:outline-none"
        />
      </div>

      {loading && <p className="text-sm text-text-muted">Loading jobs...</p>}

      {error && (
        <div className="rounded-lg border border-border bg-danger-tint px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="rounded-lg border border-border bg-bg-surface px-4 py-10 text-center">
          <p className="text-sm text-text-muted">
            {jobs.length === 0
              ? 'There are no open roles at the moment. Please check back soon.'
              : 'No roles match your search.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((job) => (
          <button
            key={job.id}
            onClick={() => navigate(`/seeker/jobs/${job.id}`)}
            className="flex flex-col rounded-xl border border-border bg-bg-surface p-5 text-left transition-shadow hover:shadow-md focus:border-accent focus:outline-none"
          >
            <h2 className="font-display text-lg font-semibold leading-snug text-text-primary">
              {job.title}
            </h2>

            <div className="mt-3 flex flex-col gap-1.5 text-sm text-text-muted">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{job.company}</span>
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{job.location}</span>
              </span>
              <span className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 shrink-0" />
                <span className="truncate">{job.employment_type}</span>
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {(job.required_skills || []).slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-accent-tint px-2 py-1 text-xs font-medium text-accent"
                >
                  {skill}
                </span>
              ))}
              {(job.required_skills || []).length > 4 && (
                <span className="rounded-md bg-bg-subtle px-2 py-1 text-xs font-medium text-text-muted">
                  +{job.required_skills.length - 4} more
                </span>
              )}
            </div>

            <p className="mt-4 border-t border-border pt-3 text-xs text-text-hint">
              {timeAgo(job.posted_date)}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
