import { useState } from 'react'
import { ArrowRight, ArrowLeft, Plus, X, Sparkles } from 'lucide-react'
import { completeOnboarding } from '../../lib/api'

const FIELD_OPTIONS = ['Engineering', 'Analytics', 'Design', 'Product', 'Marketing', 'Operations']
const TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship']
const WORK_OPTIONS = ['On-site', 'Remote', 'Hybrid']

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-[13px] font-medium border transition-colors ${
        active ? 'bg-accent text-white border-accent' : 'bg-bg-surface text-text-body border-border hover:border-accent'
      }`}
    >
      {children}
    </button>
  )
}

export default function OnboardingModal({ user, onDone }) {
  const [step, setStep] = useState(0)
  const [field, setField] = useState('')
  const [jobType, setJobType] = useState('')
  const [workStyle, setWorkStyle] = useState('')
  const [location, setLocation] = useState('')
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  const firstName = (user?.full_name || '').trim().split(' ')[0]
  const TOTAL = 3

  function addSkill() {
    const v = skillInput.trim()
    if (!v) return
    if (!skills.some((s) => s.toLowerCase() === v.toLowerCase())) setSkills((p) => [...p, v])
    setSkillInput('')
  }

  async function finish(skip) {
    setBusy(true); setErr(null)
    try {
      const payload = skip ? {} : {
        pref_field: field,
        pref_job_type: jobType,
        pref_location: workStyle,
        location,
        skills: skills.join(', '),
      }
      const updated = await completeOnboarding(payload)
      onDone(updated)
    } catch (e) {
      if (skip) {
        // Never trap the user — dismiss locally even if the save failed.
        setDismissed(true)
      } else {
        setErr(e.message || 'Something went wrong. You can Skip for now and try again after signing in again.')
        setBusy(false)
      }
    }
  }

  if (dismissed) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-base/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-bg-surface border border-border rounded-modal shadow-2xl overflow-hidden">
        {/* header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles size={16} />
            <span className="text-[12px] font-semibold uppercase tracking-[0.06em]">Quick setup · Step {step + 1} of {TOTAL}</span>
          </div>
          <h2 className="font-outfit text-[20px] font-semibold text-text-primary mt-2">
            {step === 0 && (firstName ? `Welcome, ${firstName}! Let's tailor your jobs` : "Welcome! Let's tailor your jobs")}
            {step === 1 && 'Where and how do you want to work?'}
            {step === 2 && 'What are your top skills?'}
          </h2>
          <p className="text-[13px] text-text-muted mt-1">
            {step === 0 && 'A few quick answers help us surface the right roles. You can skip and fill these in later.'}
            {step === 1 && 'This helps us match roles to your situation.'}
            {step === 2 && 'Skills power your recommendations — add a handful you want to be matched on.'}
          </p>
          {/* progress */}
          <div className="flex gap-1.5 mt-4">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-accent' : 'bg-bg-subtle'}`} />
            ))}
          </div>
        </div>

        {/* body */}
        <div className="px-6 pb-2 min-h-[190px]">
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-[12px] font-medium text-text-body mb-2">Which field interests you most?</p>
                <div className="flex flex-wrap gap-2">
                  {FIELD_OPTIONS.map((f) => <Chip key={f} active={field === f} onClick={() => setField(field === f ? '' : f)}>{f}</Chip>)}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-medium text-text-body mb-2">What type of role?</p>
                <div className="flex flex-wrap gap-2">
                  {TYPE_OPTIONS.map((t) => <Chip key={t} active={jobType === t} onClick={() => setJobType(jobType === t ? '' : t)}>{t}</Chip>)}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-[12px] font-medium text-text-body mb-2">Preferred work style</p>
                <div className="flex flex-wrap gap-2">
                  {WORK_OPTIONS.map((w) => <Chip key={w} active={workStyle === w} onClick={() => setWorkStyle(workStyle === w ? '' : w)}>{w}</Chip>)}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-medium text-text-body mb-2">Where are you based?</p>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full h-10 px-3 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px] transition-colors"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
                {skills.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1.5 bg-accent-tint text-accent text-[12px] font-medium pl-3 pr-1.5 py-1 rounded-full">
                    {s}
                    <button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))} className="hover:text-accent-2"><X size={13} /></button>
                  </span>
                ))}
                {skills.length === 0 && <span className="text-[12px] text-text-hint">e.g. React, Python, Figma…</span>}
              </div>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 h-10 px-3 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px] transition-colors"
                />
                <button type="button" onClick={addSkill} className="h-10 px-3.5 rounded-btn border border-border-strong text-text-body hover:bg-bg-subtle transition-colors inline-flex items-center gap-1.5 text-[13px] font-medium"><Plus size={15} /> Add</button>
              </div>
            </div>
          )}

          {err && <p className="text-[12px] text-danger-text mt-3">{err}</p>}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border mt-2">
          <button onClick={() => finish(true)} disabled={busy}
            className="text-[12.5px] font-medium text-text-muted hover:text-text-body transition-colors disabled:opacity-50">
            Skip for now
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} disabled={busy}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-btn text-[13px] font-medium text-text-body hover:bg-bg-subtle transition-colors">
                <ArrowLeft size={15} /> Back
              </button>
            )}
            {step < TOTAL - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} disabled={busy}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent-2 transition-colors">
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button onClick={() => finish(false)} disabled={busy}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent-2 transition-colors disabled:opacity-60">
                {busy ? 'Saving…' : 'Finish setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
