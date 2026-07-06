import { useState, useEffect } from 'react'
import { Plus, Search, ChevronDown, Filter, ArrowUpDown, Code2, SquareActivity, Palette, Briefcase, Megaphone, MoreVertical } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import NewJobModal from '../components/ui/NewJobModal'
import { getJobs } from '../lib/api'

const iconForDepartment = {
  Engineering: Code2,
  Analytics: SquareActivity,
  Design: Palette,
  Product: Briefcase,
  Marketing: Megaphone,
  Operations: Briefcase,
}

export default function JobPostings() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)

  function loadJobs() {
    getJobs()
      .then((data) => {
        setJobs(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadJobs()
  }, [])

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-page px-6 pt-6 pb-3">
        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Job postings</h1>
            <p className="text-[13px] text-text-muted mt-1">Manage your open roles and track applicants</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus size={14} />
            New job posting
          </button>
        </header>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
            <input
              type="text"
              placeholder="Search job postings..."
              className="w-full h-10 pl-9 pr-3 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px]"
            />
          </div>
          <button className="flex items-center gap-2 h-10 px-4 rounded-btn border border-border-strong text-[13px] text-text-body hover:bg-bg-subtle transition-colors">
            <Filter size={14} />
            Status: All
            <ChevronDown size={14} className="text-text-hint" />
          </button>
          <button className="flex items-center gap-2 h-10 px-4 rounded-btn border border-border-strong text-[13px] text-text-body hover:bg-bg-subtle transition-colors">
            <ArrowUpDown size={14} />
            Newest
            <ChevronDown size={14} className="text-text-hint" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-6">
        {loading && <p className="text-[13px] text-text-muted">Loading jobs...</p>}
        {error && <p className="text-[13px] text-danger-text">Error: {error}</p>}
        {!loading && !error && jobs.length === 0 && (
          <p className="text-[13px] text-text-muted">No job postings yet.</p>
        )}

        {jobs.map((job) => {
          const Icon = iconForDepartment[job.department] || Briefcase
          return (
            <div key={job.id} className="bg-bg-surface border border-border rounded-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-btn bg-accent-tint flex items-center justify-center text-accent shrink-0">
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-medium text-text-primary leading-[1.4]">{job.title}</h3>
                <p className="text-[12px] text-text-muted mt-0.5">{job.department} • {job.employment_type} • {job.location}</p>
              </div>
              <div className="flex items-center gap-8 shrink-0">
                <div className="text-center">
                  <p className="text-[15px] font-medium text-text-primary">{job.applicant_count}</p>
                  <p className="text-[11px] text-text-muted">applicants</p>
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-medium text-text-primary">{job.ranked_count}</p>
                  <p className="text-[11px] text-text-muted">ranked</p>
                </div>
                <div className="w-20 flex justify-center">
                  <StatusBadge status={job.status} />
                </div>
                <button className="text-text-hint hover:text-text-body transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          )
        })}
   </div>

      {showModal && (
        <NewJobModal
          onClose={() => setShowModal(false)}
          onCreated={loadJobs}
        />
      )}
    </div>
  )
}
