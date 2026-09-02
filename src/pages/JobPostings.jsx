import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowUpDown } from 'lucide-react'
import FilterDropdown from '../components/ui/FilterDropdown'
import StatusBadge from '../components/ui/StatusBadge'
import NewJobModal from '../components/ui/NewJobModal'
import { getJobs, deleteJob } from '../lib/api'
import { useJob } from '../context/JobContext'
import JobActionsMenu from '../components/ui/JobActionsMenu'
import { DEPARTMENT_ICONS, FALLBACK_ICON } from '../lib/departments'

const STATUSES = ['All', 'Active', 'In review', 'Closed']

export default function JobPostings() {
  const navigate = useNavigate()
  const { setSelectedJobId, refreshJobs } = useJob()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('Newest')
  const [searchParams, setSearchParams] = useSearchParams()
  const [highlightId, setHighlightId] = useState(null)
  const highlightRef = useRef(null)

  useEffect(() => {
    const h = searchParams.get('highlight')
    if (h) {
      setHighlightId(Number(h))
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const t = setTimeout(() => setHighlightId(null), 2200)
      return () => clearTimeout(t)
    }
  }, [highlightId, jobs])

  function loadJobs() {
    getJobs()
      .then((data) => {
        setError(null)
        setJobs(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }
  async function handleDelete(jobId) {
    if (!confirm('Delete this job posting? This will also remove its candidates and rankings.')) return
    try {
      await deleteJob(jobId)
      loadJobs()
      refreshJobs()
    } catch (err) {
      setError(`Could not delete the job posting: ${err.message}`)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadJobs()
  }, [])

  const filteredJobs = jobs
    .filter((job) => statusFilter === 'All' || job.status === statusFilter)
    .sort((a, b) => {
      if (sortOrder === 'Newest') return new Date(b.posted_date) - new Date(a.posted_date)
      if (sortOrder === 'Oldest') return new Date(a.posted_date) - new Date(b.posted_date)
      if (sortOrder === 'Highest applicants') return b.applicant_count - a.applicant_count
      return 0
    })

  const counts = {
    All: jobs.length,
    Active: jobs.filter((j) => j.status === 'Active').length,
    'In review': jobs.filter((j) => j.status === 'In review').length,
    Closed: jobs.filter((j) => j.status === 'Closed').length,
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-page px-6 pt-6 pb-3">
        <div className="bg-bg-surface border border-border rounded-modal shadow-sm px-5 py-4 mb-4">
          <div className="flex items-center gap-2.5">
            <h1 className="font-outfit text-[22px] font-semibold text-text-primary leading-[1.2]">Job postings</h1>
            <span className="font-mono text-[12px] font-medium bg-accent-tint text-accent px-2.5 py-0.5 rounded-pill">{jobs.length}</span>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-1 rounded-btn bg-bg-subtle p-1 self-start max-w-full overflow-x-auto">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium whitespace-nowrap transition-colors ${
                    statusFilter === s
                      ? 'bg-bg-surface text-text-primary shadow-sm border border-border'
                      : 'text-text-muted hover:text-text-body'
                  }`}
                >
                  {s}
                  <span className={`font-mono text-[11px] ${statusFilter === s ? 'text-accent' : 'text-text-hint'}`}>{counts[s]}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <FilterDropdown
                icon={ArrowUpDown}
                label="Sort"
                value={sortOrder}
                options={['Newest', 'Oldest', 'Highest applicants']}
                onChange={setSortOrder}
              />
              <button
                onClick={() => { setEditingJob(null); setShowModal(true) }}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors shrink-0 whitespace-nowrap"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">New job posting</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-6">
        {loading && <p className="text-[13px] text-text-muted">Loading jobs...</p>}
        {error && <p className="text-[13px] text-danger-text">Error: {error}</p>}
        {!loading && !error && jobs.length === 0 && (
          <p className="text-[13px] text-text-muted">No job postings yet.</p>
        )}

        {filteredJobs.map((job) => {
          const Icon = DEPARTMENT_ICONS[job.department] || FALLBACK_ICON
          return (
            <div
              key={job.id}
              ref={job.id === highlightId ? highlightRef : undefined}
              className={`bg-bg-surface border rounded-card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 transition-shadow ${job.id === highlightId ? 'border-accent ring-2 ring-accent/40' : 'border-border'}`}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-btn bg-accent-tint flex items-center justify-center text-accent shrink-0">
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-medium text-text-primary leading-[1.4]">{job.title}</h3>
                  <p className="text-[12px] text-text-muted mt-0.5">{job.department} • {job.employment_type} • {job.location}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 shrink-0 border-t border-border pt-3 sm:border-t-0 sm:pt-0 sm:gap-8">
                <div className="flex items-center gap-6 sm:gap-8">
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
                </div>
                <JobActionsMenu
                  onViewCandidates={() => { setSelectedJobId(job.id); navigate('/ranking') }}
                  onEdit={() => { setEditingJob(job); setShowModal(true) }}
                  onDelete={() => handleDelete(job.id)}
                />
              </div>
            </div>
          )
        })}
   </div>

      {showModal && (
        <NewJobModal
          job={editingJob}
          onClose={() => { setShowModal(false); setEditingJob(null) }}
          onCreated={() => { loadJobs(); refreshJobs() }}
        />
      )}
    </div>
  )
}
