import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Briefcase, BarChart3, Bookmark, Clock, CheckCircle2,
  GraduationCap, Layers, Building2, ChevronRight,
} from 'lucide-react'
import {
  getPublicJob, getPublicJobs, getMyApplications, getSavedJobs, saveJob, unsaveJob,
} from '../../lib/api'
import ApplyChooserModal from '../../components/seeker/ApplyChooserModal'
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
function companyMark(name, logo, box = 'w-14 h-14', txt = 'text-[15px]') {
  return logo
    ? <img src={logo} alt={name} className={`${box} rounded-xl object-contain bg-white border border-border shrink-0`} />
    : <div className={`${box} ${txt} rounded-xl flex items-center justify-center text-white font-semibold shrink-0`} style={{ background: companyColor(name) }}>{monogram(name)}</div>
}

const STATUS_LABEL = { 'Under review': 'In review', Shortlisted: 'Shortlisted' }

const TABS = [
  { key: 'description', label: 'Job Description' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'company', label: 'About the Company' },
]

export default function JobDetail() {
  const { id } = useParams()
  const jid = Number(id)
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [allJobs, setAllJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [chooserOpen, setChooserOpen] = useState(false)
  const [myApp, setMyApp] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const [tab, setTab] = useState('description')

  useEffect(() => {
    setLoading(true)
    setTab('description')
    getPublicJob(id).then(setJob).catch((e) => setError(e.message)).finally(() => setLoading(false))
    getPublicJobs().then(setAllJobs).catch(() => {})
    getMyApplications().then((list) => setMyApp(list.find((a) => a.job_id === jid) || null)).catch(() => {})
    getSavedJobs().then((list) => setSavedIds(new Set(list.map((j) => j.job_id)))).catch(() => {})
  }, [id, jid])

  const isSaved = savedIds.has(jid)

  async function toggleSave() {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (isSaved) next.delete(jid); else next.add(jid)
      return next
    })
    try { if (isSaved) await unsaveJob(jid); else await saveJob(jid) } catch {
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (isSaved) next.add(jid); else next.delete(jid)
        return next
      })
    }
  }

  const similar = useMemo(() => {
    if (!job) return []
    return allJobs.filter((j) => j.id !== jid && j.department === job.department).slice(0, 4)
  }, [allJobs, job, jid])

  if (loading) return <div className="p-6"><p className="text-[13px] text-text-muted">Loading role…</p></div>

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-bg-surface border border-border rounded-card px-4 py-12 text-center max-w-md">
          <p className="text-[13px] text-text-body">{error}</p>
          <Link to="/seeker/jobs" className="text-[13px] font-medium text-accent hover:underline underline-offset-2 mt-3 inline-block">Back to all jobs</Link>
        </div>
      </div>
    )
  }

  const summary = [
    { icon: Building2, label: 'Company', value: job.company },
    { icon: MapPin, label: 'Location', value: job.location },
    { icon: Briefcase, label: 'Employment type', value: job.employment_type },
    { icon: BarChart3, label: 'Experience', value: job.experience_requirement },
    { icon: Layers, label: 'Field', value: job.department },
    { icon: Clock, label: 'Posted', value: daysAgo(job.posted_date) },
  ].filter((f) => f.value)

  return (
    <div className="p-6 flex flex-col gap-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted hover:text-text-body transition-colors self-start">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] items-start">
        {/* Main */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Header card */}
          <div className="bg-bg-surface border border-border rounded-card p-6">
            <div className="flex items-start gap-4">
              {companyMark(job.company, job.company_logo)}
              <div className="min-w-0 flex-1">
                <h1 className="text-[22px] font-semibold text-text-primary leading-tight">{job.title}</h1>
                <p className="text-[14px] font-medium text-accent mt-0.5">{job.company}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[12.5px] text-text-muted">
                  <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-text-hint" />{job.location}</span>
                  <span className="inline-flex items-center gap-1.5"><Briefcase size={13} className="text-text-hint" />{job.employment_type}</span>
                  {job.experience_requirement && <span className="inline-flex items-center gap-1.5"><BarChart3 size={13} className="text-text-hint" />{job.experience_requirement}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-5 border-t border-border">
              {myApp ? (
                <>
                  <span className="inline-flex items-center gap-2 h-10 px-4 rounded-btn bg-success-tint text-success-text text-[13px] font-medium">
                    <CheckCircle2 size={16} /> Applied · {STATUS_LABEL[myApp.status] || myApp.status}
                  </span>
                  <Link to="/seeker/applications" className="text-[12.5px] font-medium text-accent hover:underline underline-offset-2">Track application →</Link>
                </>
              ) : (
                <button onClick={() => setChooserOpen(true)} className="h-10 px-5 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent-2 active:scale-[0.99] transition-all">
                  Apply Now
                </button>
              )}
              <button
                onClick={toggleSave}
                className={`inline-flex items-center gap-2 h-10 px-4 rounded-btn border text-[13px] font-medium transition-colors ${
                  isSaved ? 'border-accent text-accent bg-accent-tint' : 'border-border-strong text-text-body hover:bg-bg-subtle'
                }`}
              >
                <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} /> {isSaved ? 'Saved' : 'Save Job'}
              </button>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-text-hint whitespace-nowrap">
                <Clock size={13} /> Posted {daysAgo(job.posted_date)}
              </span>
            </div>
          </div>

          {/* Tabs card */}
          <div className="bg-bg-surface border border-border rounded-card overflow-hidden">
            <div className="flex border-b border-border px-2 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative px-3 py-3 text-[13px] font-medium whitespace-nowrap transition-colors ${
                    tab === t.key ? 'text-accent' : 'text-text-muted hover:text-text-body'
                  }`}
                >
                  {t.label}
                  {tab === t.key && <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-accent rounded-full" />}
                </button>
              ))}
            </div>

            <div className="p-6">
              {tab === 'description' && (
                <p className="text-[13.5px] leading-relaxed text-text-body whitespace-pre-line">{job.description}</p>
              )}

              {tab === 'requirements' && (
                <div className="flex flex-col gap-5">
                  <div>
                    <h3 className="text-[13px] font-medium text-text-primary mb-2.5">Required skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.required_skills || []).map((skill) => (
                        <span key={skill} className="bg-accent-tint text-accent text-[12px] font-medium px-2.5 py-1 rounded-btn">{skill}</span>
                      ))}
                      {(job.required_skills || []).length === 0 && <span className="text-[12.5px] text-text-muted">No specific skills listed.</span>}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="flex items-center gap-1.5 text-[13px] font-medium text-text-primary mb-1.5"><Briefcase size={13} className="text-text-muted" /> Experience</h3>
                      <p className="text-[13px] leading-relaxed text-text-body">{job.experience_requirement || '—'}</p>
                    </div>
                    <div>
                      <h3 className="flex items-center gap-1.5 text-[13px] font-medium text-text-primary mb-1.5"><GraduationCap size={13} className="text-text-muted" /> Education</h3>
                      <p className="text-[13px] leading-relaxed text-text-body">{job.education_requirement || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'company' && (
                <div className="flex items-start gap-4">
                  {companyMark(job.company, job.company_logo, 'w-12 h-12', 'text-[13px]')}
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-semibold text-text-primary">{job.company}</h3>
                    <p className="text-[13.5px] leading-relaxed text-text-body mt-1.5 whitespace-pre-line">
                      {job.company_description || 'This company has not added a description yet.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Similar jobs */}
          {similar.length > 0 && (
            <div>
              <h2 className="text-[15px] font-medium text-text-primary mb-3 px-0.5">Similar jobs</h2>
              <div className="bg-bg-surface border border-border rounded-card divide-y divide-border overflow-hidden">
                {similar.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/seeker/jobs/${s.id}`)}
                    className="group flex items-center gap-3.5 p-4 cursor-pointer hover:bg-bg-subtle transition-colors"
                  >
                    {companyMark(s.company, s.company_logo, 'w-10 h-10', 'text-[12px]')}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-text-primary truncate group-hover:text-accent transition-colors">{s.title}</p>
                      <p className="text-[12px] text-text-muted truncate mt-0.5">{[s.company, s.location, s.employment_type].filter(Boolean).join(' · ')}</p>
                    </div>
                    <ChevronRight size={16} className="text-text-hint shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-5">
          <div className="bg-bg-surface border border-border rounded-card p-5 lg:sticky lg:top-6">
            <h2 className="text-[14px] font-medium text-text-primary mb-3">Job summary</h2>
            <div className="flex flex-col gap-3">
              {summary.map(({ icon: FactIcon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <FactIcon size={14} className="text-text-hint shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.06em] text-text-hint">{label}</p>
                    <p className="text-[13px] text-text-body leading-snug">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg-surface border border-border rounded-card p-5">
            <h2 className="text-[14px] font-medium text-text-primary mb-3">About the company</h2>
            <div className="flex items-center gap-3">
              {companyMark(job.company, job.company_logo, 'w-11 h-11', 'text-[13px]')}
              <p className="text-[14px] font-semibold text-text-primary truncate">{job.company}</p>
            </div>
            <p className="text-[12.5px] leading-relaxed text-text-muted mt-3 line-clamp-4">
              {job.company_description || 'This company has not added a description yet.'}
            </p>
          </div>
        </div>
      </div>

      {chooserOpen && (
        <ApplyChooserModal
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => {
            setChooserOpen(false)
            getMyApplications().then((list) => setMyApp(list.find((a) => a.job_id === jid) || null)).catch(() => {})
          }}
        />
      )}
    </div>
  )
}
