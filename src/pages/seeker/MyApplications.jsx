import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin, Upload, FileText, FileSearch, ChevronRight } from 'lucide-react'
import { getMyApplications } from '../../lib/api'
import { DEPARTMENT_ICONS, FALLBACK_ICON } from '../../lib/departments'
import { formatLongDate } from '../../lib/time'

const STATUS_STYLES = {
  'Under review': 'bg-bg-subtle text-text-muted',
  'Shortlisted': 'bg-success-tint text-success-text',
  'Rejected': 'bg-danger-tint text-danger',
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

  if (loading) return <div className="p-6"><p className="text-[13px] text-text-muted">Loading your applications...</p></div>

  return (
    <div className="p-6 flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">My Applications</h1>
        <p className="text-[13px] text-text-muted mt-1">
          {applications.length === 0
            ? 'Roles you apply for will appear here.'
            : `You've applied to ${applications.length} ${applications.length === 1 ? 'role' : 'roles'}.`}
        </p>
      </div>

      {error && (
        <div className="bg-danger-tint border border-danger/25 rounded-card px-4 py-3">
          <p className="text-[13px] text-danger">{error}</p>
        </div>
      )}

      {!error && applications.length === 0 && (
        <div className="bg-bg-surface border border-border rounded-card px-4 py-14 text-center">
          <div className="w-11 h-11 rounded-full bg-bg-subtle flex items-center justify-center mx-auto">
            <FileSearch size={20} className="text-text-hint" />
          </div>
          <p className="text-[14px] font-medium text-text-primary mt-4">No applications yet</p>
          <p className="text-[12.5px] text-text-muted mt-1">
            Once you apply to a role, you'll be able to track it here.
          </p>
          <Link
            to="/seeker/jobs"
            className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline underline-offset-2"
          >
            Browse open roles
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {applications.map((app) => {
          const Icon = DEPARTMENT_ICONS[app.department] || FALLBACK_ICON
          const MethodIcon = app.method === 'upload' ? Upload : FileText
          return (
            <div
              key={app.application_id}
              className="group relative bg-bg-surface border border-border rounded-card p-5 flex items-start gap-4 transition-all duration-200 hover:border-accent-light hover:shadow-sm focus-within:border-accent-light"
            >
              <div className="w-10 h-10 rounded-btn bg-accent-tint flex items-center justify-center text-accent shrink-0">
                <Icon size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-medium text-text-primary leading-[1.3] truncate group-hover:text-accent transition-colors">
                      {/* Stretched link, so the whole card is clickable while the
                          title remains keyboard-focusable. Roles that have since
                          been taken down are plain text. */}
                      {app.job_id ? (
                        <Link to={`/seeker/jobs/${app.job_id}`} className="focus:outline-none focus-visible:underline">
                          <span className="absolute inset-0 rounded-card" aria-hidden="true" />
                          {app.job_title}
                        </Link>
                      ) : (
                        app.job_title
                      )}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] text-text-muted">
                        <Building2 size={13} className="shrink-0" />
                        {app.company}
                      </span>
                      {app.location && (
                        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-text-muted">
                          <MapPin size={13} className="shrink-0" />
                          {app.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-medium ${
                      STATUS_STYLES[app.status] || 'bg-bg-subtle text-text-muted'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-border">
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-text-hint">
                    <MethodIcon size={13} />
                    {app.method === 'upload' ? 'Applied with your CV' : 'Applied using the form'}
                  </span>
                  <span className="text-[12px] text-text-hint">
                    Applied {formatLongDate(app.applied_on)}
                  </span>
                </div>
              </div>

              {app.job_id && (
                <ChevronRight size={16} className="text-text-hint shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
