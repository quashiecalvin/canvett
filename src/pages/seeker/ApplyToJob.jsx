import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Upload, FileText, X, Plus, Trash2, CheckCircle2 , ArrowRight, FileCheck2 } from 'lucide-react'
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
        <ParseReceipt receipt={receipt} jobTitle={job.title} />
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
        <div className={`mt-6 ${cardClass}`}>
          <label className={`flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed px-4 py-12 text-center transition-all
            ${file ? 'border-accent bg-accent-tint/40' : 'border-border-strong hover:border-accent hover:bg-accent-tint/20'}`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors
              ${file ? 'bg-accent text-white' : 'bg-bg-subtle text-text-muted'}`}>
              {file ? <FileCheck2 size={26} /> : <Upload size={26} />}
            </div>
            <span className="mt-4 text-[14.5px] font-medium text-text-body">
              {file ? file.name : 'Choose a PDF or Word document'}
            </span>
            <span className="mt-1 text-[12.5px] text-text-hint">
              {file ? 'Ready to submit' : 'Click to browse — PDF or DOCX only'}
            </span>
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
