import { useState, useEffect } from 'react'
import { Plus, Code2, SquareActivity, Palette, Briefcase, Megaphone } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import { getStats, getJobs } from '../lib/api'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getStats(), getJobs()])
      .then(([statsData, jobsData]) => {
        setStats(statsData)
        setJobs(jobsData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Active postings', value: stats?.active_postings ?? 0 },
    { label: 'Total applicants', value: stats?.total_applicants ?? 0 },
    { label: 'Resumes ranked', value: stats?.resumes_ranked ?? 0 },
    { label: 'Avg match score', value: stats ? `${stats.avg_match_score}%` : '0%' },
  ]

  return (
    <div className="p-6">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Dashboard</h1>
          <p className="text-[13px] text-text-muted mt-1">{today}</p>
        </div>
        <button className="flex items-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors">
          <Plus size={14} />
          New job posting
        </button>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value }) => (
          <div key={label} className="bg-bg-subtle rounded-btn px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.07em] text-text-hint">{label}</p>
            <p className="text-[22px] font-medium text-text-primary mt-1 leading-[1.2]">{value}</p>
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
                  <p className="text-[12px] text-text-muted mt-0.5">{job.department} • {job.location}</p>
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
    </div>
  )
}
