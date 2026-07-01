import { Plus, Code2, SquareActivity, Palette } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import ScorePill from '../components/ui/ScorePill'

export default function Dashboard() {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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
        {[
          { label: 'Active postings', value: '8', delta: '↑ 2 this week', positive: true },
          { label: 'Total applicants', value: '143', delta: '↑ 34 new this week', positive: true },
          { label: 'Resumes ranked', value: '97', delta: '64 pending', positive: false },
          { label: 'Avg match score', value: '74%', delta: '↑ 6% vs last month', positive: true },
        ].map(({ label, value, delta, positive }) => (
          <div key={label} className="bg-bg-subtle rounded-btn px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.07em] text-text-hint">{label}</p>
            <p className="text-[22px] font-medium text-text-primary mt-1 leading-[1.2]">{value}</p>
            <p className={`text-[11px] mt-1 ${positive ? 'text-success' : 'text-text-muted'}`}>{delta}</p>
          </div>
        ))}
      </div>
      <section className="mb-6">
        <h2 className="text-[18px] font-medium text-text-primary mb-4 leading-[1.3]">Recent job postings</h2>
        <div className="flex flex-col gap-3">
          {[
            { icon: Code2, title: 'Software Engineer - Backend', dept: 'Engineering', posted: 'Posted 3 days ago', applicants: '42 applicants', status: 'Active' },
            { icon: SquareActivity, title: 'Data Analyst', dept: 'Analyst', posted: 'Posted 1 week ago', applicants: '28 applicants', status: 'In review' },
            { icon: Palette, title: 'UX Designer', dept: 'Design', posted: 'Posted 2 weeks ago', applicants: '42 applicants', status: 'Closed' },
          ].map(({ icon: Icon, title, dept, posted, applicants, status }) => (
            <div key={title} className="bg-bg-surface border border-border rounded-card p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-btn bg-accent-tint flex items-center justify-center text-accent shrink-0">
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-medium text-text-primary leading-[1.4]">{title}</h3>
                <p className="text-[12px] text-text-muted mt-0.5">{dept} • {posted}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={status} />
                <span className="text-[12px] text-text-muted">{applicants}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-bg-surface border border-border rounded-card p-4">
          <h2 className="text-[15px] font-medium text-text-primary mb-4 leading-[1.4]">Recent activity</h2>
          <div className="flex flex-col gap-4">
            {[
              { text: '12 resumes ranked for Software Engineer - Backend', time: '2 hours ago' },
              { text: 'New job posting created: Product Manager', time: 'Yesterday, 4:15 PM' },
              { text: '7 resumes uploaded for Data Analyst', time: 'Yesterday, 11:02 AM' },
            ].map(({ text, time }, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <div>
                  <p className="text-[13px] text-text-body leading-[1.4]">{text}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bg-surface border border-border rounded-card p-4">
          <h2 className="text-[15px] font-medium text-text-primary mb-4 leading-[1.4]">Top candidates for this week</h2>
          <div className="flex flex-col gap-3">
            {[
              { initials: 'EN', name: 'Eric Ntow', role: 'Software Engineer', score: 92 },
              { initials: 'KN', name: 'Kelly Nartey', role: 'Data Analyst', score: 88 },
              { initials: 'LM', name: 'Lawrence Mensah', role: 'Software Engineer', score: 74 },
            ].map(({ initials, name, role, score }) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-tint flex items-center justify-center text-[11px] font-medium text-purple-text shrink-0">
                  {initials}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-text-primary leading-[1.4]">{name}</p>
                  <p className="text-[11px] text-text-muted">{role}</p>
                </div>
                <ScorePill score={score} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}