import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'
import {
  Check, Minus, CalendarCheck, AlertTriangle, ChevronDown, ChevronRight,
  ArrowLeft, ArrowRight, Copy, CheckCheck, FileSearch, Briefcase, Building2,
  CalendarDays, ClipboardCheck, Sparkles, Users, FileText, Lightbulb, ShieldCheck,
} from 'lucide-react'

const WHATS_NEXT = [
  { icon: ClipboardCheck, tint: 'bg-accent-tint text-accent', title: 'Application under review', body: 'The hiring team will review your application and qualifications.' },
  { icon: Sparkles, tint: 'bg-purple-tint text-purple-text', title: 'Scored against the role', body: 'Canvett matched your CV to this role to help recruiters spot strong fits.' },
  { icon: Users, tint: 'bg-success-tint text-success-text', title: 'Be prepared', body: 'If shortlisted, you may be invited for an interview or assessment.' },
  { icon: FileText, tint: 'bg-warning-tint text-warning-text', title: 'Track your status', body: 'Follow your application status anytime in My Applications.' },
]

export default function ParseReceipt({ receipt, jobTitle, company, jobId }) {
  const [showParse, setShowParse] = useState(false)
  const [showText, setShowText] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const colors = ['#2F6FB0', '#C77D2E', '#3E9E63', '#6E5AAE', '#C05F6E', '#E8B84B']
    confetti({ particleCount: 90, spread: 78, startVelocity: 42, origin: { y: 0.42 }, colors, scalar: 0.9 })
    const t = setTimeout(() => {
      confetti({ particleCount: 45, angle: 60, spread: 60, origin: { x: 0, y: 0.65 }, colors })
      confetti({ particleCount: 45, angle: 120, spread: 60, origin: { x: 1, y: 0.65 }, colors })
    }, 180)
    return () => clearTimeout(t)
  }, [])

  const matched = receipt.matched_skills || []
  const unmatched = receipt.unmatched_skills || []
  const totalSkills = matched.length + unmatched.length

  const now = useMemo(() => new Date(), [])
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const appId = useMemo(() => {
    const pad = (n) => String(n).padStart(2, '0')
    const suffix = (receipt.candidate_id ?? 0).toString(16).toUpperCase().padStart(4, '0')
    return `CAN-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${suffix}`
  }, [now, receipt.candidate_id])

  function copyId() {
    navigator.clipboard?.writeText(appId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }).catch(() => {})
  }

  const cardClass = 'rounded-card border border-border bg-bg-surface'

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div>
        {jobId && (
          <Link to={`/seeker/jobs/${jobId}`} className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline underline-offset-2">
            <ArrowLeft size={15} /> Back to role
          </Link>
        )}
        <h1 className="font-outfit text-[24px] font-semibold tracking-[-0.3px] text-text-primary">Application Submitted! 🎉</h1>
        <p className="mt-1.5 text-[14px] text-text-muted">
          Your application for <span className="font-medium text-accent">{jobTitle}</span>
          {company && <> at <span className="font-medium text-accent">{company}</span></> } has been submitted successfully.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Main card */}
        <div className={`${cardClass} p-6 sm:p-8 flex flex-col`}>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <div className="relative w-[210px] h-[210px] flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                <circle cx="80" cy="14" r="2.5" fill="var(--color-accent)" />
                <rect x="76" y="20" width="6" height="6" rx="1.5" fill="var(--color-score-amber)" transform="rotate(20 79 23)" />
                <circle cx="98" cy="31" r="3" fill="var(--color-accent)" />
                <rect x="59" y="27" width="6" height="6" rx="1.5" fill="var(--color-purple-text)" transform="rotate(-25 62 30)" />
                <rect x="113" y="31" width="5" height="9" rx="2" fill="var(--color-success)" transform="rotate(35 115 35)" />
                <circle cx="43" cy="35" r="3" fill="var(--color-danger)" />
                <rect x="129" y="45" width="6" height="6" rx="1.5" fill="var(--color-score-amber)" transform="rotate(15 132 48)" />
                <rect x="24" y="45" width="5" height="9" rx="2" fill="var(--color-accent)" transform="rotate(-20 26 49)" />
                <circle cx="141" cy="64" r="2.5" fill="var(--color-accent-light)" />
                <rect x="17" y="60" width="6" height="6" rx="1.5" fill="var(--color-success)" transform="rotate(30 20 63)" />
                <circle cx="132" cy="98" r="2.5" fill="var(--color-purple-text)" />
                <rect x="27" y="95" width="5" height="8" rx="2" fill="var(--color-score-amber)" transform="rotate(-15 29 98)" />
                <circle cx="30" cy="102" r="2.5" fill="var(--color-accent)" />
              </svg>
              <div className="relative w-28 h-28 rounded-full bg-success-tint flex items-center justify-center">
                <Check size={56} className="text-success-text" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="mt-6 font-outfit text-[24px] font-semibold text-text-primary">You're all set!</h2>
            <p className="mt-2 max-w-md text-[14px] leading-relaxed text-text-muted">
              We've received your application{company ? ` and the hiring team at ${company}` : ' and the hiring team'} will review it shortly.
            </p>
          </div>

          {/* Meta row */}
          <div className="mt-7 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-3">
            <MetaFact icon={Briefcase} label="Role applied" value={jobTitle} />
            <MetaFact icon={Building2} label="Company" value={company || '—'} />
            <MetaFact icon={CalendarDays} label="Date applied" value={`${dateStr} · ${timeStr}`} />
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link
              to="/seeker/applications"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-btn border border-border-strong bg-bg-surface px-6 text-[14px] font-medium text-text-body transition-colors hover:bg-bg-subtle"
            >
              View My Applications <ArrowRight size={15} />
            </Link>
            <Link
              to="/seeker/jobs"
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-btn bg-accent px-6 text-[14px] font-semibold text-white transition-all hover:bg-accent-2 active:scale-[0.99]"
            >
              Browse More Jobs <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-[12px] text-text-hint">
            <ShieldCheck size={13} /> Your information is secure and only used for this application.
          </div>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-5">
          {/* What's next */}
          <div className={`${cardClass} p-5`}>
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-score-amber" fill="currentColor" fillOpacity={0.22} />
              <h3 className="text-[14px] font-semibold text-text-primary">What's next?</h3>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {WHATS_NEXT.map(({ icon: StepIcon, tint, title, body }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-btn flex items-center justify-center shrink-0 ${tint}`}>
                    <StepIcon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-text-primary leading-snug">{title}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-text-muted">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application summary */}
          <div className={`${cardClass} p-5`}>
            <div className="flex items-center gap-2">
              <ClipboardCheck size={16} className="text-accent" />
              <h3 className="text-[14px] font-semibold text-text-primary">Application summary</h3>
            </div>
            <dl className="mt-4 flex flex-col gap-3.5">
              <SummaryRow label="Role" value={jobTitle} />
              <SummaryRow label="Company" value={company || '—'} />
              <SummaryRow label="Date applied" value={`${dateStr} · ${timeStr}`} />
              <div>
                <dt className="text-[10.5px] uppercase tracking-[0.06em] text-text-hint">Application ID</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-[12.5px] text-text-body">{appId}</span>
                  <button onClick={copyId} aria-label="Copy application ID" className="text-text-hint hover:text-accent transition-colors">
                    {copied ? <CheckCheck size={14} className="text-success-text" /> : <Copy size={14} />}
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Parse transparency (folded in) */}
      <div className={`${cardClass} overflow-hidden`}>
        <button
          onClick={() => setShowParse((v) => !v)}
          className="flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-bg-subtle"
        >
          <div className="w-9 h-9 rounded-btn bg-accent-tint flex items-center justify-center shrink-0">
            <FileSearch size={16} className="text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-medium text-text-primary">What we read from your CV</p>
            <p className="mt-0.5 text-[12px] text-text-muted">
              {totalSkills > 0
                ? `Recognised ${matched.length} of ${totalSkills} skills listed for this role`
                : 'A quick receipt of what our system extracted'}
              {receipt.duration_verified ? ' · dates read successfully' : ' · dates need a clearer format'}
            </p>
          </div>
          <ChevronRight size={16} className={`text-text-hint shrink-0 transition-transform ${showParse ? 'rotate-90' : ''}`} />
        </button>

        {showParse && (
          <div className="border-t border-border p-5 flex flex-col gap-5">
            <p className="text-[12.5px] leading-relaxed text-text-muted">
              This is a receipt of what the system extracted, so you can check nothing important was missed.
            </p>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <p className="text-[12.5px] font-medium text-text-body">Skills recognised ({matched.length})</p>
                {matched.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {matched.map((skill) => (
                      <span key={skill} className="flex items-center gap-1 rounded-md bg-success-tint px-2 py-1 text-[12px] font-medium text-success-text">
                        <Check size={12} /> {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2.5 text-[12.5px] text-text-hint">None of the listed skills were found in your application.</p>
                )}
              </div>

              <div>
                <p className="text-[12.5px] font-medium text-text-body">Not found ({unmatched.length})</p>
                {unmatched.length > 0 ? (
                  <>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {unmatched.map((skill) => (
                        <span key={skill} className="flex items-center gap-1 rounded-md bg-bg-subtle px-2 py-1 text-[12px] font-medium text-text-muted">
                          <Minus size={12} /> {skill}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2.5 text-[12px] leading-relaxed text-text-hint">If you do have these, they may be worded differently in your CV.</p>
                  </>
                ) : (
                  <p className="mt-2.5 text-[12.5px] text-text-hint">Every skill listed for this role was found.</p>
                )}
              </div>

              <div>
                <p className="text-[12.5px] font-medium text-text-body">Employment dates</p>
                {receipt.duration_verified ? (
                  <p className="mt-2.5 flex items-start gap-1.5 text-[12.5px] text-success-text">
                    <CalendarCheck size={14} className="mt-0.5 shrink-0" /> Your dates were read successfully.
                  </p>
                ) : (
                  <p className="mt-2.5 flex items-start gap-1.5 text-[12.5px] leading-relaxed text-score-amber">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <span>We couldn't read clear start and end dates. A format like &ldquo;June 2023 &ndash; March 2025&rdquo; helps.</span>
                  </p>
                )}
              </div>
            </div>

            {receipt.extracted_text && (
              <div>
                <button
                  onClick={() => setShowText((v) => !v)}
                  className="flex items-center gap-1.5 text-[12.5px] font-medium text-text-muted transition-colors hover:text-text-body"
                >
                  <ChevronDown size={14} className={`transition-transform ${showText ? 'rotate-180' : ''}`} />
                  {showText ? 'Hide' : 'Show'} the full text we extracted
                </button>
                {showText && (
                  <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-bg-subtle p-4 font-sans text-[12px] leading-relaxed text-text-body">
                    {receipt.extracted_text}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MetaFact({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-btn bg-bg-subtle flex items-center justify-center shrink-0">
        <Icon size={17} className="text-text-muted" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-text-hint">{label}</p>
        <p className="text-[13px] font-medium text-text-primary truncate">{value}</p>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-[0.06em] text-text-hint">{label}</dt>
      <dd className="mt-0.5 text-[13px] text-text-body">{value}</dd>
    </div>
  )
}
