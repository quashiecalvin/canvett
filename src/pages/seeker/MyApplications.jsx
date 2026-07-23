import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin, Upload, FileText, Search } from 'lucide-react'
import { getMyApplications } from '../../lib/api'

const STATUS_STYLES = {
  'Under review': 'bg-bg-subtle text-text-muted',
  'Shortlisted': 'bg-success-tint text-success-text',
  'Rejected': 'bg-danger-tint text-danger',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMyApplications()
      .then(setApplications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-text-muted">Loading your applications...</p>

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-outfit text-[22px] font-semibold tracking-[-0.3px] text-text-primary sm:text-[26px]">
          My Applications
        </h1>
        <p className="mt-1 text-[14px] text-text-muted">
          Roles you have applied for through Canvett.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/25 bg-danger-tint px-4 py-3 text-[13.5px] text-danger">
          {error}
        </div>
      )}

      {!error && applications.length === 0 && (
        <div className="rounded-xl border border-border bg-bg-surface px-4 py-12 text-center">
          <Search size={22} className="mx-auto text-text-hint" />
          <p className="mt-3 text-[14px] text-text-body">You have not applied to any roles yet.</p>
          <Link
            to="/seeker/jobs"
            className="mt-4 inline-block text-[13.5px] font-medium text-accent hover:underline underline-offset-2"
          >
            Browse open roles
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {applications.map((app) => {
          const MethodIcon = app.method === 'upload' ? Upload : FileText
          return (
            <div
              key={app.application_id}
              className="rounded-xl border border-border bg-bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-outfit text-[16.5px] font-semibold leading-snug text-text-primary">
                    {app.job_title}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                    <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
                      <Building2 size={14} className="shrink-0" />
                      {app.company}
                    </span>
                    {app.location && (
                      <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
                        <MapPin size={14} className="shrink-0" />
                        {app.location}
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-md px-2.5 py-1 text-[12px] font-medium ${
                    STATUS_STYLES[app.status] || 'bg-bg-subtle text-text-muted'
                  }`}
                >
                  {app.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3">
                <span className="flex items-center gap-1.5 text-[12.5px] text-text-hint">
                  <MethodIcon size={13} />
                  {app.method === 'upload' ? 'Applied with your CV' : 'Applied using the form'}
                </span>
                <span className="text-[12.5px] text-text-hint">
                  Applied {formatDate(app.applied_on)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
