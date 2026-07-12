import { useState, useEffect } from 'react'
import { Plus, Code2, SquareActivity, Palette, Briefcase, Megaphone } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import ScorePill from '../components/ui/ScorePill'
import NewJobModal from '../components/ui/NewJobModal'
import { getStats, getJobs, getTopCandidates, getActivity } from '../lib/api'
import { timeAgo } from '../lib/time'

const iconForDepartment = {
  Engineering: Code2,
  Analytics: SquareActivity,
  Design: Palette,
  Product: Briefcase,
  Marketing: Megaphone,
  Operations: Briefcase,
}

export default function Dashboard() {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [topCandidates, setTopCandidates] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  function loadData() {
    Promise.all([getStats(), getJobs(), getTopCandidates(), getActivity()])
      .then(([statsData, jobsData, topData, activityData]) => {
        setStats(statsData)
        setJobs(jobsData)
        setTopCandidates(topData)
        setActivity(activityData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  function weekDelta(n, noun) {
    if (!n) return null
    return { text: `${n} ${noun} this week`, positive: true }
  }

  const statCards = [
    {
      label: 'Active postings',
      value: stats?.active_postings ?? 0,
      delta: weekDelta(stats?.postings_this_week, 'postings'),
    },
    {
      label: 'Total applicants',
      value: stats?.total_applicants ?? 0,
      delta: weekDelta(stats?.applicants_this_week, 'new'),
    },
    {
      label: 'Resumes ranked',
      value: stats?.resumes_ranked ?? 0,
      delta: weekDelta(stats?.ranked_this_week, 'ranked'),
    },
    {
      label: 'Avg match score',
      value: stats ? `${stats.avg_match_score}%` : '0%',
      delta:
        stats?.score_delta != null
          ? {
              text: `${stats.score_delta >= 0 ? '↑' : '↓'} ${Math.abs(stats.score_delta)}% vs last month`,
              positive: stats.score_delta >= 0,
            }
          : null,
    },
  ]

  return (
    <div className="p-6">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Dashboard</h1>
          <p className="text-[13px] text-text-muted mt-1">{today}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors"
        >
          <Plus size={14} />
          New job posting
        </button>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, delta }) => (
          <div key={label} className="bg-bg-subtle rounded-btn px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.07em] text-text-hint">{label}</p>
            <p className="text-[22px] font-medium text-text-primary mt-1 leading-[1.2]">{value}</p>
            {delta && (
              <p className={`text-[11px] mt-1 ${delta.positive ? 'text-success' : 'text-danger-text'}`}>
                {delta.text}
              </p>
            )}
          </div>
        ))}
      </div>

      <section className="mb-6">
        <h2 className="text-[18px] font-medium text-text-primary mb-4 leading-[1.3]">Recent job postings</h2>

        {loading && <p className="text-[13px] text-text-muted">Loading...</p>}
        {!loading && jobs.length === 0 && (
          <p className="text-[13px] text-text-muted">No job postings yet.</p>
        )}

        <div className="flex flex-col gap-3">
          {jobs.slice(0, 5).map((job) => {
            const Icon = iconForDepartment[job.department] || Briefcase
            return (
              <div key={job.id} className="bg-bg-surface border border-border rounded-card p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-btn bg-accent-tint flex items-center justify-center text-accent shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-medium text-text-primary leading-[1.4]">{job.title}</h3>
                  <p className="text-[12px] text-text-muted mt-0.5">{job.department} • Posted {timeAgo(job.posted_date)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={job.status} />
                  <span className="text-[12px] text-text-muted">{job.applicant_count} applicants</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h2 className="text-[18px] font-medium text-text-primary mb-4 leading-[1.3]">Recent activity</h2>
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
        </div>

        <div>
          <h2 className="text-[18px] font-medium text-text-primary mb-4 leading-[1.3]">Top candidates</h2>
          <div className="bg-bg-surface border border-border rounded-card p-4">
            {topCandidates.length === 0 ? (
              <p className="text-[13px] text-text-muted">No candidates ranked yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {topCandidates.map((c) => (
                  <div key={c.candidate_id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-tint flex items-center justify-center text-[11px] font-medium text-purple-text shrink-0">
                      {c.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-primary leading-[1.4] truncate">{c.name}</p>
                      <p className="text-[11px] text-text-muted">{c.job_title}</p>
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
