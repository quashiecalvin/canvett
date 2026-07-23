import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, FileText, X, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { getPublicJob, applyWithUpload, applyWithForm } from '../../lib/api'
import ParseReceipt from '../../components/seeker/ParseReceipt'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i))

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
  const [path, setPath] = useState(null)
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [file, setFile] = useState(null)
  const [phone, setPhone] = useState('')
  const [summary, setSummary] = useState('')
  const [skillsText, setSkillsText] = useState('')
  const [experience, setExperience] = useState([{ ...emptyExperience }])
  const [education, setEducation] = useState([{ ...emptyEducation }])

  useEffect(() => {
    getPublicJob(id).then(setJob).catch((err) => setLoadError(err.message))
  }, [id])

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
        <ParseReceipt receipt={receipt} jobTitle={job.title} />
      </div>
    )
  }

  const inputClass = "h-10 w-full rounded-btn border border-border bg-bg-surface px-3 text-[13.5px] text-text-body placeholder:text-text-hint focus:border-accent focus:outline-none"
  const cardClass = "rounded-xl border border-border bg-bg-surface p-5 sm:p-6"

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => (path ? setPath(null) : navigate(`/seeker/jobs/${id}`))}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-text-muted transition-colors hover:text-text-body"
      >
        <ArrowLeft size={15} />
        {path ? 'Choose a different way to apply' : 'Back to role'}
      </button>

      <h1 className="font-outfit text-[21px] font-semibold tracking-[-0.3px] text-text-primary sm:text-[24px]">
        Apply for {job.title}
      </h1>
      <p className="mt-1 text-[14px] text-text-muted">{job.company}</p>

      {!path && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setPath('upload')}
            className="rounded-xl border border-border bg-bg-surface p-5 text-left transition-shadow hover:shadow-md focus:border-accent focus:outline-none"
          >
            <Upload size={20} className="text-accent" />
            <h2 className="mt-3 font-outfit text-[16px] font-semibold text-text-primary">Upload your CV</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-muted">
              Send the CV you already have, as a PDF or Word document.
            </p>
          </button>

          <button
            onClick={() => setPath('form')}
            className="rounded-xl border border-border bg-bg-surface p-5 text-left transition-shadow hover:shadow-md focus:border-accent focus:outline-none"
          >
            <FileText size={20} className="text-accent" />
            <h2 className="mt-3 font-outfit text-[16px] font-semibold text-text-primary">Fill in a form</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-muted">
              Enter your details directly. Takes a few minutes, and nothing gets misread.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 rounded-md bg-success-tint px-2 py-1 text-[11.5px] font-medium text-success-text">
              <CheckCircle2 size={11} />
              Most accurate
            </span>
          </button>
        </div>
      )}

      {path === 'upload' && (
        <div className={`mt-6 ${cardClass}`}>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border-strong px-4 py-10 text-center transition-colors hover:border-accent hover:bg-accent-tint/30">
            <Upload size={22} className="text-text-muted" />
            <span className="mt-3 text-[14px] font-medium text-text-body">
              {file ? file.name : 'Choose a PDF or Word document'}
            </span>
            <span className="mt-1 text-[12.5px] text-text-hint">PDF or DOCX only</span>
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
              <X size={13} />
              Remove file
            </button>
          )}

          {error && <p className="mt-4 text-[13px] text-danger">{error}</p>}

          <button
            onClick={submitUpload}
            disabled={submitting || !file}
            className="mt-5 h-11 w-full rounded-btn bg-accent text-[14px] font-semibold text-white transition-all hover:bg-accent-2 active:scale-[0.99] disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {submitting ? 'Submitting...' : 'Submit application'}
          </button>
        </div>
      )}

      {path === 'form' && (
        <div className="mt-6 flex flex-col gap-4">
          <div className={cardClass}>
            <h2 className="font-outfit text-[15.5px] font-semibold text-text-primary">Professional summary</h2>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="A short paragraph about your background and what you do."
              className="mt-3 w-full rounded-btn border border-border bg-bg-surface p-3 text-[13.5px] leading-relaxed text-text-body placeholder:text-text-hint focus:border-accent focus:outline-none"
            />
          </div>

          <div className={cardClass}>
            <h2 className="font-outfit text-[15.5px] font-semibold text-text-primary">Skills</h2>
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
            <h2 className="font-outfit text-[15.5px] font-semibold text-text-primary">Work experience</h2>
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
            <h2 className="font-outfit text-[15.5px] font-semibold text-text-primary">Education</h2>
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
            <h2 className="font-outfit text-[15.5px] font-semibold text-text-primary">Contact number</h2>
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
