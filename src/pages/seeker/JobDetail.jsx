import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Building2, Briefcase, GraduationCap, Clock, Layers,
  Code2, SquareActivity, Palette, Megaphone } from 'lucide-react'
import { getPublicJob } from '../../lib/api'

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
    return <div className="p-6"><p className="text-[13px] text-text-muted">Loading role...</p></div>
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-bg-surface border border-border rounded-card px-4 py-12 text-center max-w-md">
          <p className="text-[13px] text-text-body">{error}</p>
          <Link to="/seeker/jobs" className="text-[13px] font-medium text-accent hover:underline underline-offset-2 mt-3 inline-block">
            Back to all jobs
          </Link>
        </div>
      </div>
    )
  }

  const Icon = iconForDepartment[job.department] || Briefcase

  const facts = [
    { icon: Building2, label: 'Company', value: job.company },
    { icon: MapPin, label: 'Location', value: job.location },
    { icon: Briefcase, label: 'Type', value: job.employment_type },
    { icon: Layers, label: 'Department', value: job.department },
    { icon: Clock, label: 'Posted', value: timeAgo(job.posted_date) },
  ].filter((f) => f.value)

  return (
    <div className="p-6 flex flex-col gap-5">
      <button
        onClick={() => navigate('/seeker/jobs')}
        className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted hover:text-text-body transition-colors self-start"
      >
        <ArrowLeft size={15} />
        All jobs
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-btn bg-accent-tint flex items-center justify-center text-accent shrink-0">
          <Icon size={24} />
        </div>
        <div className="min-w-0">
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">{job.title}</h1>
          <p className="text-[13px] text-text-muted mt-1">
            {job.company} • {job.location} • {job.employment_type}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px] items-start">
        <div className="flex flex-col gap-4">
          <div className="bg-bg-surface border border-border rounded-card p-5">
            <h2 className="text-[13px] font-medium text-text-primary mb-3">About this role</h2>
            <p className="text-[13.5px] leading-relaxed text-text-body whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div className="bg-bg-surface border border-border rounded-card p-5">
            <h2 className="text-[13px] font-medium text-text-primary mb-3">Required skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {(job.required_skills || []).map((skill) => (
                <span key={skill} className="bg-accent-tint text-accent text-[12px] font-medium px-2.5 py-1 rounded-btn">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-bg-surface border border-border rounded-card p-5">
              <h2 className="flex items-center gap-1.5 text-[13px] font-medium text-text-primary mb-2">
                <Briefcase size={13} className="text-text-muted" />
                Experience
              </h2>
              <p className="text-[13px] leading-relaxed text-text-body">{job.experience_requirement}</p>
            </div>
            <div className="bg-bg-surface border border-border rounded-card p-5">
              <h2 className="flex items-center gap-1.5 text-[13px] font-medium text-text-primary mb-2">
                <GraduationCap size={13} className="text-text-muted" />
                Education
              </h2>
              <p className="text-[13px] leading-relaxed text-text-body">{job.education_requirement}</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border rounded-card p-5 lg:sticky lg:top-6">
          <h2 className="text-[13px] font-medium text-text-primary mb-3">At a glance</h2>
          <div className="flex flex-col gap-2.5">
            {facts.map(({ icon: FactIcon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5">
                <FactIcon size={14} className="text-text-hint shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.06em] text-text-hint">{label}</p>
                  <p className="text-[13px] text-text-body leading-snug">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate(`/seeker/jobs/${job.id}/apply`)}
            className="w-full h-10 mt-5 rounded-btn bg-accent text-white text-[13.5px] font-medium hover:bg-accent-2 active:scale-[0.99] transition-all"
          >
            Apply for this role
          </button>
          <p className="text-[11px] text-text-hint text-center mt-2">
            Upload a CV or fill in a form
          </p>
        </div>
      </div>
    </div>
  )
}
