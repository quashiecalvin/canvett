import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Check, Minus, CalendarCheck, AlertTriangle, ChevronDown } from 'lucide-react'

export default function ParseReceipt({ receipt, jobTitle }) {
  const [showText, setShowText] = useState(false)
  const matched = receipt.matched_skills || []
  const unmatched = receipt.unmatched_skills || []

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-border bg-bg-surface p-5 sm:p-7">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-success" />
          <div>
            <h1 className="font-outfit text-[20px] font-semibold tracking-[-0.2px] text-text-primary sm:text-[23px]">
              Application submitted
            </h1>
            <p className="mt-1 text-[14px] text-text-muted">
              Your application for {jobTitle} has been received.
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-text-hint">
            What we read from your application
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-text-muted">
            This is a receipt of what the system extracted, so you can check nothing important was missed.
          </p>

          <div className="mt-5">
            <p className="text-[13px] font-medium text-text-body">
              Skills recognised ({matched.length})
            </p>
            {matched.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {matched.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 rounded-md bg-success-tint px-2 py-1 text-[12.5px] font-medium text-success-text"
                  >
                    <Check size={12} />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[13px] text-text-hint">
                None of the listed skills were found in your application.
              </p>
            )}
          </div>

          {unmatched.length > 0 && (
            <div className="mt-5">
              <p className="text-[13px] font-medium text-text-body">
                Not found ({unmatched.length})
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {unmatched.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 rounded-md bg-bg-subtle px-2 py-1 text-[12.5px] font-medium text-text-muted"
                  >
                    <Minus size={12} />
                    {skill}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-text-hint">
                If you do have these, they may be worded differently in your CV.
              </p>
            </div>
          )}

          <div className="mt-5">
            <p className="text-[13px] font-medium text-text-body">Employment dates</p>
            {receipt.duration_verified ? (
              <p className="mt-2 flex items-start gap-1.5 text-[13px] text-success-text">
                <CalendarCheck size={14} className="mt-0.5 shrink-0" />
                Your dates were read successfully.
              </p>
            ) : (
              <p className="mt-2 flex items-start gap-1.5 text-[13px] text-score-amber">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                We could not read clear start and end dates. Adding dates in a format like
                &ldquo;June 2023 &ndash; March 2025&rdquo; helps the system read your experience accurately.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <button
            onClick={() => setShowText(!showText)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted transition-colors hover:text-text-body"
          >
            <ChevronDown
              size={15}
              className={`transition-transform ${showText ? 'rotate-180' : ''}`}
            />
            {showText ? 'Hide' : 'Show'} the full text we extracted
          </button>
          {showText && (
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-bg-subtle p-4 font-sans text-[12.5px] leading-relaxed text-text-body">
              {receipt.extracted_text}
            </pre>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <Link
          to="/seeker/applications"
          className="flex h-11 items-center justify-center rounded-btn bg-accent px-6 text-[14px] font-semibold text-white transition-all hover:bg-accent-2 active:scale-[0.99]"
        >
          View my applications
        </Link>
        <Link
          to="/seeker/jobs"
          className="flex h-11 items-center justify-center rounded-btn border border-border bg-bg-surface px-6 text-[14px] font-medium text-text-body transition-colors hover:bg-bg-subtle"
        >
          Browse more jobs
        </Link>
      </div>
    </div>
  )
}
