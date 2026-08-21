import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Building2, Briefcase, GraduationCap, Clock, Layers } from 'lucide-react'
import { getPublicJob } from '../../lib/api'
import ApplyChooserModal from '../../components/seeker/ApplyChooserModal'
import { DEPARTMENT_ICONS, FALLBACK_ICON } from '../../lib/departments'
import { daysAgo } from '../../lib/time'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  // Keyed by id so a slow response for a previous role cannot overwrite the
  // current one, and so loading/error state resets when the id changes.
  const [result, setResult] = useState({ id: null, job: null, error: null })
  const [chooserOpen, setChooserOpen] = useState(false)

  useEffect(() => {
    getPublicJob(id)
      .then((job) => setResult({ id, job, error: null }))
      .catch((err) => setResult({ id, job: null, error: err.message }))
  }, [id])

  const { job, error } = result
  const loading = result.id !== id

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

  const Icon = DEPARTMENT_ICONS[job.department] || FALLBACK_ICON

  const facts = [
    { icon: Building2, label: 'Company', value: job.company },
    { icon: MapPin, label: 'Location', value: job.location },
    { icon: Briefcase, label: 'Type', value: job.employment_type },
    { icon: Layers, label: 'Department', value: job.department },
    { icon: Clock, label: 'Posted', value: daysAgo(job.posted_date) },
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

      {/* Blue header band */}
      <div className="rounded-card border border-border overflow-hidden">
        <div className="bg-accent px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-btn bg-white/15 flex items-center justify-center text-white shrink-0">
              <Icon size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[22px] font-medium text-white leading-[1.2]">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-white/85">
                  <Building2 size={13} />
                  {job.company}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-white/85">
                  <MapPin size={13} />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-white/85">
                  <Briefcase size={13} />
                  {job.employment_type}
                </span>
              </div>
            </div>
          </div>
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
            onClick={() => setChooserOpen(true)}
            className="w-full h-10 mt-5 rounded-btn bg-accent text-white text-[13.5px] font-medium hover:bg-accent-2 active:scale-[0.99] transition-all"
          >
            Apply for this role
          </button>
          <p className="text-[11px] text-text-hint text-center mt-2">
            Upload a CV or fill in a form
          </p>
        </div>
      </div>

      {chooserOpen && (
        <ApplyChooserModal
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setChooserOpen(false)}
        />
      )}
    </div>
  )
}
