import { Plus, Search, ChevronDown, Filter, ArrowUpDown, Code2, SquareActivity, Palette, Briefcase, Megaphone, MoreVertical } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'

export default function JobPostings() {
  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-page px-6 pt-6 pb-3">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Job postings</h1>
          <p className="text-[13px] text-text-muted mt-1">Manage your open roles and track applicants</p>
        </div>
        <button className="flex items-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors">
          <Plus size={14} />
          New job posting
        </button>
      </header>

      <div className="flex items-center gap-3 mb-6">
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
      <div className="flex flex-col gap-3">
        {[
          { icon: Code2, title: 'Software Engineer - Backend', dept: 'Engineering', type: 'Full-time', location: 'Accra', posted: 'Posted 3 days ago', applicants: 42, ranked: 28, status: 'Active' },
          { icon: SquareActivity, title: 'Data Analyst', dept: 'Analytics', type: 'Full-time', location: 'Remote', posted: 'Posted 1 week ago', applicants: 28, ranked: 15, status: 'In review' },
          { icon: Palette, title: 'UX Designer', dept: 'Design', type: 'Contract', location: 'Accra', posted: 'Posted 2 weeks ago', applicants: 19, ranked: 19, status: 'Closed' },
          { icon: Briefcase, title: 'Product Manager', dept: 'Product', type: 'Full-time', location: 'Hybrid', posted: 'Posted yesterday', applicants: 7, ranked: 0, status: 'Active' },
          { icon: Megaphone, title: 'Marketing Lead', dept: 'Marketing', type: 'Full-time', location: 'Kumasi', posted: 'Posted 5 days ago', applicants: 34, ranked: 20, status: 'Active' },
          { icon: Palette, title: 'Product Designer', dept: 'Design', type: 'Full-time', location: 'Ho', posted: 'Posted 3 days ago', applicants: 25, ranked: 15, status: 'Active' },
          { icon: Code2, title: 'Software Engineer', dept: 'Engineering', type: 'Part-time', location: 'Tamale', posted: 'Posted 1 week ago', applicants: 48, ranked: 10, status: 'Active' },
          { icon: Briefcase, title: 'Operations Manager', dept: 'Operations', type: 'Full-time', location: 'Accra', posted: 'Posted 4 days ago', applicants: 16, ranked: 8, status: 'Active' },
          { icon: SquareActivity, title: 'Business Analyst', dept: 'Analytics', type: 'Full-time', location: 'Sunyani', posted: 'Posted 6 days ago', applicants: 21, ranked: 12, status: 'Active' },
          { icon: Megaphone, title: 'Content Strategist', dept: 'Marketing', type: 'Contract', location: 'Kumasi', posted: 'Posted 2 days ago', applicants: 13, ranked: 5, status: 'Active' },
        ].map(({ icon: Icon, title, dept, type, location, posted, applicants, ranked, status }) => (
          <div key={title} className="bg-bg-surface border border-border rounded-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-btn bg-accent-tint flex items-center justify-center text-accent shrink-0">
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-medium text-text-primary leading-[1.4]">{title}</h3>
              <p className="text-[12px] text-text-muted mt-0.5">{dept} • {type} • {location} • {posted}</p>
            </div>
            <div className="flex items-center gap-8 shrink-0">
              <div className="text-center">
                <p className="text-[15px] font-medium text-text-primary">{applicants}</p>
                <p className="text-[11px] text-text-muted">applicants</p>
              </div>
              <div className="text-center">
                <p className="text-[15px] font-medium text-text-primary">{ranked}</p>
                <p className="text-[11px] text-text-muted">ranked</p>
              </div>
              <div className="w-20 flex justify-center">
                <StatusBadge status={status} />
              </div>
              <button className="text-text-hint hover:text-text-body transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}