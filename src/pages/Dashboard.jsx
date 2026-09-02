import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowRight, Users, FileText } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import ScorePill from '../components/ui/ScorePill'
import NewJobModal from '../components/ui/NewJobModal'
import { useAuth } from '../context/AuthContext'
import { getStats, getJobs, getTopCandidates, getActivity } from '../lib/api'
import { timeAgo } from '../lib/time'
import { DEPARTMENT_ICONS, FALLBACK_ICON } from '../lib/departments'
import { initialsFromName } from '../lib/initials'

function shortRole(title) {
  const parts = title.split(/\s[-\u2013\u2014]\s/)
  if (parts.length > 1) return parts[parts.length - 1].trim()
  return title.split(' ')[0]
}

function JobPostingsIcon({ size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 4v5" />
    </svg>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const hour = new Date().getHours()
  const partOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  const firstName = (user?.full_name || 'there').trim().split(' ')[0]

  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [topCandidates, setTopCandidates] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)

  function loadData() {
    Promise.all([getStats(), getJobs(), getTopCandidates(), getActivity()])
      .then(([statsData, jobsData, topData, activityData]) => {
        setError(null)
        setStats(statsData)
        setJobs(jobsData)
        setTopCandidates(topData)
        setActivity(activityData)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  const topScore = topCandidates[0] ? Math.round(topCandidates[0].overall_score) : null
  const avg = stats?.avg_match_score ?? 0
  const CIRC = 339.292
  const dashOffset = CIRC * (1 - avg / 100)

  const roleData = [...jobs]
    .map((j) => ({ id: j.id, title: j.title, count: j.applicant_count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  const maxRole = Math.max(1, ...roleData.map((r) => r.count))

  const heroLine =
    stats && stats.resumes_ranked > 0
      ? `${stats.resumes_ranked} resume${stats.resumes_ranked === 1 ? '' : 's'} scored across ${stats.active_postings} open role${stats.active_postings === 1 ? '' : 's'}.` +
        (topScore != null ? ` Your top match is sitting at ${topScore}%.` : '')
      : 'Post a role and upload resumes to see ranked, explainable matches.'

  const statPills = [
    { label: 'Active postings', value: stats?.active_postings ?? 0, Icon: JobPostingsIcon },
    { label: 'Total applicants', value: stats?.total_applicants ?? 0, Icon: Users },
    { label: 'Resumes ranked', value: stats?.resumes_ranked ?? 0, Icon: FileText },
  ]

  return (
    <div className="p-6">
      {error && (
        <p className="text-[13px] text-danger-text mb-4">
          Could not load your dashboard: {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 items-start lg:grid-cols-[1fr_300px]">
        {/* ── main column ── */}
        <div className="anim-stagger min-w-0 flex flex-col gap-6">

          {/* hero */}
          <section
            className="relative overflow-hidden rounded-modal px-7 py-7 text-white"
            style={{
              background: 'linear-gradient(120deg, #1B5595 0%, #4338CA 100%)',
              boxShadow: '0 16px 40px rgba(46,68,150,0.22)',
            }}
          >
            <svg
              className="absolute right-6 pointer-events-none z-[1] opacity-90"
              style={{ top: '50%', transform: 'translateY(-50%) rotate(-8deg)' }}
              width="220" height="220" viewBox="0 0 100 100" fill="none"
            >
              <rect x="20" y="20" width="26" height="38" rx="7" fill="#fff" fillOpacity="0.16" />
              <rect x="52" y="20" width="26" height="22" rx="7" fill="#fff" fillOpacity="0.10" />
              <rect x="52" y="48" width="26" height="32" rx="7" fill="#fff" fillOpacity="0.16" />
              <rect x="20" y="64" width="26" height="16" rx="7" fill="#fff" fillOpacity="0.10" />
            </svg>

            <div className="relative z-[2] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/70">
                  Good {partOfDay}, {firstName} · {today}
                </p>
                <h1 className="font-outfit text-[26px] font-semibold leading-[1.15] tracking-[-0.3px] mt-2 max-w-[380px]">
                  Rank your next hire with confidence
                </h1>
                <p className="text-[13.5px] text-white/80 mt-2 max-w-[400px] leading-[1.5]">
                  {heroLine}
                </p>
                <button
                  onClick={() => navigate('/ranking')}
                  className="mt-5 inline-flex items-center gap-2 rounded-btn bg-[#101725] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#1c2637] transition-colors"
                >
                  Review rankings
                  <ArrowRight size={15} />
                </button>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-btn bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2.5 text-[13px] font-medium text-white transition-colors"
              >
                <Plus size={14} />
                New job posting
              </button>
            </div>
          </section>

          {/* stat pills */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {statPills.map(({ label, value, Icon }) => (
              <div key={label} className="bg-bg-surface border border-border rounded-card px-4 py-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-btn flex items-center justify-center shrink-0 bg-bg-subtle text-text-muted">
                  <Icon size={19} />
                </div>
                <div>
                  <p className="font-mono text-[21px] font-medium text-text-primary leading-[1.1]">{value}</p>
                  <p className="text-[11.5px] text-text-muted">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* recent job postings */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-medium text-text-primary leading-[1.3]">Recent job postings</h2>
              <button onClick={() => navigate('/jobs')} className="text-[12px] font-medium text-accent hover:underline">See all</button>
            </div>

            {loading && <p className="text-[13px] text-text-muted">Loading...</p>}
            {!loading && !error && jobs.length === 0 && (
              <p className="text-[13px] text-text-muted">No job postings yet.</p>
            )}

            {jobs.length > 0 && (
              <div className="bg-bg-surface border border-border rounded-card overflow-hidden">
                {jobs.slice(0, 5).map((job, i) => {
                  const Icon = DEPARTMENT_ICONS[job.department] || FALLBACK_ICON
                  return (
                    <div
                      key={job.id}
                      className={`flex items-center gap-4 px-4 py-3.5 ${i > 0 ? 'border-t border-border' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-btn bg-accent-tint flex items-center justify-center text-accent shrink-0">
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-medium text-text-primary leading-[1.4] truncate">{job.title}</h3>
                        <p className="text-[12px] text-text-muted mt-0.5">{job.department} • Posted {timeAgo(job.posted_date)}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="w-[62px] text-right">
                          <p className="font-mono text-[15px] font-medium text-text-primary leading-none">{job.applicant_count}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">applicants</p>
                        </div>
                        <div className="w-[86px] flex justify-end">
                          <StatusBadge status={job.status} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* recent activity */}
          <section>
            <h2 className="text-[16px] font-medium text-text-primary mb-4 leading-[1.3]">Recent activity</h2>
            <div className="bg-bg-surface border border-border rounded-card p-4">
              {activity.length === 0 ? (
                <p className="text-[13px] text-text-muted">No recent activity.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {activity.map((a) => (
                    <div key={a.id} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[13px] text-text-body leading-[1.4]">{a.description}</p>
                        <p className="text-[11px] text-text-muted mt-0.5">{timeAgo(a.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── right rail ── */}
        <div className="anim-stagger flex flex-col gap-5">
          {/* avg match donut */}
          <div className="bg-bg-surface border border-border rounded-modal p-5 text-center">
            <h2 className="text-[14.5px] font-medium text-text-primary">Average match score</h2>
            <p className="text-[12px] text-text-muted mt-0.5 mb-1">Across all ranked resumes</p>
            <div className="relative w-[128px] h-[128px] mx-auto my-3">
              <svg width="128" height="128" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="var(--color-bg-subtle)" strokeWidth="14" />
                <circle
                  cx="64" cy="64" r="54" fill="none"
                  stroke="var(--color-accent)" strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={dashOffset}
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[26px] font-medium text-text-primary">{avg}%</span>
                <span className="text-[10.5px] text-text-muted">avg fit</span>
              </div>
            </div>
            {stats?.score_delta != null && (
              <p className={`text-[12px] font-medium ${stats.score_delta >= 0 ? 'text-success' : 'text-danger-text'}`}>
                {stats.score_delta >= 0 ? '↑' : '↓'} {Math.abs(stats.score_delta)}% vs last month
              </p>
            )}
          </div>

          {/* applicants by role */}
          <div className="bg-bg-surface border border-border rounded-modal p-5">
            <h2 className="text-[14.5px] font-medium text-text-primary">Applicants by role</h2>
            <p className="text-[12px] text-text-muted mt-0.5">Across your postings</p>
            {roleData.length === 0 ? (
              <p className="text-[13px] text-text-muted mt-4">No postings yet.</p>
            ) : (
              <div className="flex items-end gap-2.5 h-[150px] mt-4">
                {roleData.map((r) => {
                  const h = r.count > 0 ? Math.max((r.count / maxRole) * 90, 8) : 3
                  const isMax = r.count === maxRole && r.count > 0
                  return (
                    <div key={r.id} className="flex-1 flex flex-col items-center gap-2 h-full min-w-0">
                      <div className="flex-1 w-full flex flex-col items-center justify-end gap-1">
                        <span className="font-mono text-[11px] text-text-muted">{r.count}</span>
                        <div
                          className="w-full max-w-[30px] rounded-t-[7px] rounded-b-[3px]"
                          style={{ height: `${h}px`, background: isMax ? 'var(--color-accent)' : 'var(--color-accent-light)' }}
                        />
                      </div>
                      <span className="text-[9.5px] text-text-hint w-full text-center truncate" title={r.title}>
                        {shortRole(r.title)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* top candidates */}
          <div className="bg-bg-surface border border-border rounded-modal p-5">
            <h2 className="text-[14.5px] font-medium text-text-primary mb-3">Top candidates</h2>
            {topCandidates.length === 0 ? (
              <p className="text-[13px] text-text-muted">No candidates ranked yet.</p>
            ) : (
              <div className="flex flex-col">
                {topCandidates.map((c, i) => (
                  <div key={c.candidate_id} className={`flex items-center gap-3 py-2.5 ${i > 0 ? 'border-t border-border' : ''}`}>
                    <div className="w-9 h-9 rounded-full bg-purple-tint flex items-center justify-center text-[11px] font-medium text-purple-text shrink-0">
                      {initialsFromName(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-primary leading-[1.4] truncate">{c.name}</p>
                      <p className="text-[11px] text-text-muted truncate">{c.job_title}</p>
                    </div>
                    <ScorePill score={Math.round(c.overall_score)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <NewJobModal
          onClose={() => setShowModal(false)}
          onCreated={loadData}
        />
      )}
    </div>
  )
}
