import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Upload, UploadCloud, FileText, X, Plus, Trash2, FileCheck2, FileDown, RefreshCw, Target, SpellCheck, ShieldCheck } from 'lucide-react'
import { getPublicJob, applyWithUpload, applyWithForm } from '../../lib/api'
import ParseReceipt from '../../components/seeker/ParseReceipt'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i))

function LitBulb({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      className="text-score-amber shrink-0">
      {/* rays of light */}
      <line x1="12" y1="0.8" x2="12" y2="3" />
      <line x1="6.1" y1="3.1" x2="7.3" y2="4.3" />
      <line x1="17.9" y1="3.1" x2="16.7" y2="4.3" />
      <line x1="3.2" y1="9" x2="5" y2="9" />
      <line x1="20.8" y1="9" x2="19" y2="9" />
      {/* bulb */}
      <path d="M15 15c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 9c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
        fill="currentColor" fillOpacity="0.22" />
      <path d="M9.5 19h5" />
      <path d="M10.5 22h3" />
    </svg>
  )
}

const UPLOAD_TIPS = [
  { icon: RefreshCw, title: 'Keep your CV up to date', body: 'Make sure it reflects your most recent roles, skills, and achievements.' },
  { icon: Target, title: 'Tailor it to this role', body: "Canvett matches your CV against this role's required skills — lead with the experience that fits." },
  { icon: SpellCheck, title: 'Proofread before uploading', body: 'Clear, error-free writing parses more accurately and reads better to recruiters.' },
]

function MonthYear({ label, month, year, onMonth, onYear, allowPresent, present, onPresent }) {
  const selectClass = "h-10 rounded-btn border border-border bg-bg-surface px-2 text-[13.5px] text-text-body focus:border-accent focus:outline-none disabled:opacity-40"
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium text-text-body">{label}</label>
      <div className="flex gap-2">
        <select value={month} onChange={(e) => onMonth(e.target.value)} disabled={present} className={`${selectClass} flex-1`}>
          <option value="">Month</option>
          {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => onYear(e.target.value)} disabled={present} className={`${selectClass} w-24`}>
          <option value="">Year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {allowPresent && (
        <label className="mt-2 flex items-center gap-2 text-[12.5px] text-text-muted">
          <input type="checkbox" checked={present} onChange={(e) => onPresent(e.target.checked)} className="accent-accent" />
          I currently work here
        </label>
      )}
    </div>
  )
}

const emptyExperience = { job_title: '', company: '', startMonth: '', startYear: '', endMonth: '', endYear: '', present: false, description: '' }
const emptyEducation = { qualification: '', institution: '', startMonth: '', startYear: '', endMonth: '', endYear: '' }

export default function ApplyToJob() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [searchParams] = useSearchParams()
  const method = searchParams.get('method')
  const [path, setPath] = useState(method === 'form' || method === 'upload' ? method : null)

  useEffect(() => {
    if (method === 'form' || method === 'upload') setPath(method)
  }, [method])
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [phone, setPhone] = useState('')
  const [summary, setSummary] = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [experience, setExperience] = useState([{ ...emptyExperience }])
  const [education, setEducation] = useState([{ ...emptyEducation }])

  useEffect(() => {
    getPublicJob(id).then(setJob).catch((err) => setLoadError(err.message))
  }, [id])
    useEffect(() => {
    if (!path) navigate(`/seeker/jobs/${id}`, { replace: true })
  }, [path, id, navigate])

  const topRef = useRef(null)

  useEffect(() => {
    if (receipt) topRef.current?.scrollIntoView({ block: "start" })
  }, [receipt])

  function updateEntry(list, setList, index, field, value) {
    setList(list.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function formatDate(month, year) {
    return month && year ? `${month} ${year}` : ''
  }

  async function submitUpload() {
    if (!file) return setError('Please choose a file first.')
    setError(null)
    setSubmitting(true)
    try {
      setReceipt(await applyWithUpload(id, file))
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function submitForm() {
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        phone,
        summary,
        skills: skillsText.split(',').map((s) => s.trim()).filter(Boolean),
        experience: experience
          .filter((e) => e.job_title.trim() || e.company.trim())
          .map((e) => ({
            job_title: e.job_title,
            company: e.company,
            start: formatDate(e.startMonth, e.startYear),
            end: e.present ? 'Present' : formatDate(e.endMonth, e.endYear),
            description: e.description,
          })),
        education: education
          .filter((ed) => ed.qualification.trim() || ed.institution.trim())
          .map((ed) => ({
            qualification: ed.qualification,
            institution: ed.institution,
            start: formatDate(ed.startMonth, ed.startYear),
            end: formatDate(ed.endMonth, ed.endYear),
          })),
      }
      setReceipt(await applyWithForm(id, payload))
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadError) {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-bg-surface px-4 py-10 text-center">
        <p className="text-[14px] text-text-body">{loadError}</p>
      </div>
    )
  }

  if (!job) return <p className="text-sm text-text-muted">Loading...</p>

  if (receipt) {
    return (
      <div ref={topRef}>
        <ParseReceipt receipt={receipt} jobTitle={job.title} company={job.company} jobId={job.id} />
      </div>
    )
  }

  const inputClass = "h-10 w-full rounded-btn border border-border bg-bg-surface px-3 text-[13.5px] text-text-body placeholder:text-text-hint focus:border-accent focus:outline-none"
  const cardClass = "rounded-xl border border-border bg-bg-surface p-5 sm:p-6"

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(`/seeker/jobs/${id}`)}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-text-muted transition-colors hover:text-text-body"
      >
        <ArrowLeft size={15} />
        Back to role
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">
            Apply for {job.title}
          </h1>
          <p className="mt-1 text-[14px] text-text-muted">{job.company}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-tint px-3 py-1 text-[12px] font-medium text-accent">
            {path === 'upload' ? <Upload size={12} /> : <FileText size={12} />}
            {path === 'upload' ? 'Uploading a CV' : 'Guided form'}
          </span>
          <button
            onClick={() => navigate(`/seeker/jobs/${id}/apply?method=${path === 'upload' ? 'form' : 'upload'}`)}
            className="text-[12px] font-medium text-text-muted hover:text-accent transition-colors"
          >
            Use the {path === 'upload' ? 'guided form' : 'CV upload'} instead
          </button>
        </div>
      </div>

      {path === 'upload' && (
        <>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px] items-start">
            {/* Upload card */}
            <div className={cardClass}>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-accent-tint flex items-center justify-center mx-auto">
                  <FileText size={24} className="text-accent" />
                </div>
                <h2 className="mt-4 text-[17px] font-semibold text-text-primary">Upload your CV</h2>
                <p className="mt-1 text-[13px] text-text-muted">We'll read it and build your application automatically — no forms to fill in.</p>
              </div>

              <label
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragActive(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f) { setFile(f); setError(null) }
                }}
                className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed px-4 py-10 text-center transition-all
                  ${file ? 'border-accent bg-accent-tint/40' : dragActive ? 'border-accent bg-accent-tint/30' : 'border-border-strong hover:border-accent hover:bg-accent-tint/15'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${file ? 'bg-accent text-white' : 'bg-bg-subtle text-text-muted'}`}>
                  {file ? <FileCheck2 size={22} /> : <UploadCloud size={22} />}
                </div>
                <span className="mt-3 text-[14px] font-medium text-text-body">
                  {file ? file.name : 'Drag and drop your file here'}
                </span>
                {file ? (
                  <span className="mt-1 text-[12.5px] text-text-hint">Ready to submit</span>
                ) : (
                  <>
                    <span className="mt-1 text-[12.5px] text-text-hint">or</span>
                    <span className="mt-2 inline-flex items-center gap-2 h-9 px-4 rounded-btn bg-accent text-white text-[13px] font-medium">
                      <Upload size={14} /> Choose file
                    </span>
                  </>
                )}
                <span className="mt-3 text-[12px] text-text-hint">PDF or DOCX only · Max 5MB</span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => { setFile(e.target.files[0] || null); setError(null) }}
                />
              </label>

              {file && (
                <button
                  onClick={() => setFile(null)}
                  className="mt-3 flex items-center gap-1.5 text-[12.5px] text-text-muted hover:text-danger"
                >
                  <X size={13} /> Remove file
                </button>
              )}

              <div className="mt-4 flex items-center gap-2.5 rounded-btn bg-bg-subtle px-3 py-2.5 text-[12.5px] text-text-muted">
                <ShieldCheck size={15} className="shrink-0 text-success-text" />
                <span>Your CV is used only for this application.</span>
              </div>

              {error && <p className="mt-4 text-[13px] text-danger">{error}</p>}
            </div>

            {/* Tips rail */}
            <div className="flex flex-col gap-4">
              <div className={cardClass}>
                <div className="flex items-center gap-2 pb-3.5 border-b border-border">
                  <LitBulb size={17} />
                  <h3 className="text-[14px] font-semibold text-text-primary">Tips for a great application</h3>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                  {UPLOAD_TIPS.map(({ icon: TipIcon, title, body }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-btn bg-accent-tint flex items-center justify-center shrink-0">
                        <TipIcon size={15} className="text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-text-primary leading-snug">{title}</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-text-muted">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cardClass}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-btn bg-accent-tint flex items-center justify-center shrink-0">
                    <FileDown size={15} className="text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-text-primary">Not sure how to structure it?</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-text-muted">
                      Our CV template is laid out for accurate parsing.{' '}
                      <a href="/Canvett_CV_Template.docx" download className="font-medium text-accent hover:underline">Download template</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border-strong pt-5">
            <button
              onClick={() => navigate(`/seeker/jobs/${id}`)}
              className="h-11 px-5 rounded-btn border border-border-strong text-[13.5px] font-medium text-text-body hover:bg-bg-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitUpload}
              disabled={submitting || !file}
              className="h-11 px-8 rounded-btn bg-accent text-[14px] font-semibold text-white transition-all hover:bg-accent-2 active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit application'}
            </button>
          </div>
        </>
      )}

      {path === 'form' && (
        <div className="mt-6 flex flex-col gap-4">
          <div className={cardClass}>
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-text-primary"><span className="w-5 h-5 rounded-full bg-accent-tint text-accent text-[11px] font-semibold flex items-center justify-center shrink-0">1</span>Professional summary</h2>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="A short paragraph about your background and what you do."
              className="mt-3 w-full rounded-btn border border-border bg-bg-surface p-3 text-[13.5px] leading-relaxed text-text-body placeholder:text-text-hint focus:border-accent focus:outline-none"
            />
          </div>

          <div className={cardClass}>
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-text-primary"><span className="w-5 h-5 rounded-full bg-accent-tint text-accent text-[11px] font-semibold flex items-center justify-center shrink-0">2</span>Skills</h2>
            <p className="mt-1 text-[12.5px] text-text-muted">Separate each skill with a comma.</p>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Python, FastAPI, PostgreSQL"
              className={`mt-3 ${inputClass}`}
            />
          </div>

          <div className={cardClass}>
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-text-primary"><span className="w-5 h-5 rounded-full bg-accent-tint text-accent text-[11px] font-semibold flex items-center justify-center shrink-0">3</span>Work experience</h2>
            {experience.map((e, i) => (
              <div key={i} className="mt-4 border-t border-border pt-4 first:mt-3 first:border-0 first:pt-0">
                {experience.length > 1 && (
                  <button
                    onClick={() => setExperience(experience.filter((_, x) => x !== i))}
                    className="mb-2 flex items-center gap-1 text-[12px] text-text-muted hover:text-danger"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="text" value={e.job_title} placeholder="Job title" className={inputClass}
                    onChange={(ev) => updateEntry(experience, setExperience, i, 'job_title', ev.target.value)} />
                  <input type="text" value={e.company} placeholder="Company" className={inputClass}
                    onChange={(ev) => updateEntry(experience, setExperience, i, 'company', ev.target.value)} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <MonthYear label="Started" month={e.startMonth} year={e.startYear}
                    onMonth={(v) => updateEntry(experience, setExperience, i, 'startMonth', v)}
                    onYear={(v) => updateEntry(experience, setExperience, i, 'startYear', v)} />
                  <MonthYear label="Ended" month={e.endMonth} year={e.endYear} allowPresent present={e.present}
                    onMonth={(v) => updateEntry(experience, setExperience, i, 'endMonth', v)}
                    onYear={(v) => updateEntry(experience, setExperience, i, 'endYear', v)}
                    onPresent={(v) => updateEntry(experience, setExperience, i, 'present', v)} />
                </div>
                <textarea value={e.description} rows={3} placeholder="What you did in this role"
                  onChange={(ev) => updateEntry(experience, setExperience, i, 'description', ev.target.value)}
                  className="mt-3 w-full rounded-btn border border-border bg-bg-surface p-3 text-[13.5px] leading-relaxed text-text-body placeholder:text-text-hint focus:border-accent focus:outline-none" />
              </div>
            ))}
            <button
              onClick={() => setExperience([...experience, { ...emptyExperience }])}
              className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline underline-offset-2"
            >
              <Plus size={14} />
              Add another role
            </button>
          </div>

          <div className={cardClass}>
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-text-primary"><span className="w-5 h-5 rounded-full bg-accent-tint text-accent text-[11px] font-semibold flex items-center justify-center shrink-0">4</span>Education</h2>
            {education.map((ed, i) => (
              <div key={i} className="mt-4 border-t border-border pt-4 first:mt-3 first:border-0 first:pt-0">
                {education.length > 1 && (
                  <button
                    onClick={() => setEducation(education.filter((_, x) => x !== i))}
                    className="mb-2 flex items-center gap-1 text-[12px] text-text-muted hover:text-danger"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="text" value={ed.qualification} placeholder="Qualification" className={inputClass}
                    onChange={(ev) => updateEntry(education, setEducation, i, 'qualification', ev.target.value)} />
                  <input type="text" value={ed.institution} placeholder="Institution" className={inputClass}
                    onChange={(ev) => updateEntry(education, setEducation, i, 'institution', ev.target.value)} />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <MonthYear label="Started" month={ed.startMonth} year={ed.startYear}
                    onMonth={(v) => updateEntry(education, setEducation, i, 'startMonth', v)}
                    onYear={(v) => updateEntry(education, setEducation, i, 'startYear', v)} />
                  <MonthYear label="Completed" month={ed.endMonth} year={ed.endYear}
                    onMonth={(v) => updateEntry(education, setEducation, i, 'endMonth', v)}
                    onYear={(v) => updateEntry(education, setEducation, i, 'endYear', v)} />
                </div>
              </div>
            ))}
            <button
              onClick={() => setEducation([...education, { ...emptyEducation }])}
              className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline underline-offset-2"
            >
              <Plus size={14} />
              Add another qualification
            </button>
          </div>

          <div className={cardClass}>
            <h2 className="flex items-center gap-2 text-[13px] font-medium text-text-primary"><span className="w-5 h-5 rounded-full bg-accent-tint text-accent text-[11px] font-semibold flex items-center justify-center shrink-0">5</span>Contact number</h2>
            <p className="mt-1 text-[12.5px] text-text-muted">So the employer can reach you if shortlisted.</p>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel"
              placeholder="024 000 0000" className={`mt-3 ${inputClass}`} />
          </div>

          {error && (
            <div className="rounded-btn border border-danger/25 bg-danger-tint px-4 py-3">
              <p className="text-[13px] text-danger">{error}</p>
            </div>
          )}

          <button
            onClick={submitForm}
            disabled={submitting}
            className="h-12 rounded-btn bg-accent text-[14.5px] font-semibold text-white transition-all hover:bg-accent-2 active:scale-[0.99] disabled:opacity-50 sm:self-start sm:px-10"
          >
            {submitting ? 'Submitting...' : 'Submit application'}
          </button>
        </div>
      )}
    </div>
  )
}
