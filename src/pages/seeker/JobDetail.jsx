import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Building2, Briefcase, GraduationCap, Clock, Layers } from 'lucide-react'
import { getPublicJob } from '../../lib/api'

function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000)
  if (days === 0) return 'Posted today'
  if (days === 1) return 'Posted yesterday'
  if (days < 30) return `Posted ${days} days ago`
  const months = Math.floor(days / 30)
  return `Posted ${months} month${months > 1 ? 's' : ''} ago`
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getPublicJob(id)
      .then(setJob)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p className="text-sm text-text-muted">Loading role...</p>
  }

  if (error) {
    return (
      <div className="max-w-xl">
        <div className="rounded-lg border border-border bg-bg-surface px-4 py-10 text-center">
          <p className="text-[14px] text-text-body">{error}</p>
          <Link
            to="/seeker/jobs"
            className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline underline-offset-2"
          >
            Back to all jobs
          </Link>
        </div>
      </div>
    )
  }

  const meta = [
    { icon: Building2, value: job.company },
    { icon: MapPin, value: job.location },
    { icon: Briefcase, value: job.employment_type },
    { icon: Layers, value: job.department },
  ].filter((m) => m.value)

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/seeker/jobs')}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-text-muted transition-colors hover:text-text-body"
      >
        <ArrowLeft size={15} />
        All jobs
      </button>

      <div className="rounded-xl border border-border bg-bg-surface p-5 sm:p-7">
        <h1 className="font-outfit text-[22px] font-semibold leading-tight tracking-[-0.3px] text-text-primary sm:text-[26px]">
          {job.title}
        </h1>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {meta.map(({ icon: Icon, value }) => (
            <span key={value} className="flex items-center gap-1.5 text-[13.5px] text-text-muted">
              <Icon size={15} className="shrink-0" />
              {value}
            </span>
          ))}
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-text-hint">
          <Clock size={13} />
          {timeAgo(job.posted_date)}
        </p>

        <div className="mt-6 border-t border-border pt-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-text-hint">
            About this role
          </h2>
          <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-text-body">
            {job.description}
          </p>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-text-hint">
            Required skills
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(job.required_skills || []).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-accent-tint px-2.5 py-1 text-[12.5px] font-medium text-accent"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.05em] text-text-hint">
              <Briefcase size={13} />
              Experience
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-text-body">
              {job.experience_requirement}
            </p>
          </div>
          <div>
            <h2 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.05em] text-text-hint">
              <GraduationCap size={13} />
              Education
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-text-body">
              {job.education_requirement}
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-5 border-t border-border bg-bg-page py-4 sm:static sm:border-0 sm:bg-transparent sm:py-0">
        <button
          onClick={() => navigate(`/seeker/jobs/${job.id}/apply`)}
          className="h-12 w-full rounded-btn bg-accent text-[14.5px] font-semibold text-white transition-all hover:bg-accent-2 active:scale-[0.99] sm:w-auto sm:px-8"
        >
          Apply for this role
        </button>
      </div>
    </div>
  )
}
