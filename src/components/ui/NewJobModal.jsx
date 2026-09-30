import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import SkillsInput from './SkillsInput'
import { LOCATIONS } from '../../lib/locations'
import { createJob, updateJob } from '../../lib/api'

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
const WORK_MODES = ['On-site', 'Remote', 'Hybrid']
const DEPARTMENTS = ['Engineering', 'Analytics', 'Design', 'Product', 'Marketing', 'Operations']
const STATUSES = ['Active', 'In review', 'Closed']

export default function NewJobModal({ onClose, onCreated, job }) {
  const isEdit = Boolean(job)

  const [form, setForm] = useState({
    title: job?.title || '',
    department: job?.department || 'Engineering',
    employment_type: job?.employment_type || 'Full-time',
    work_mode: job?.work_mode || 'On-site',
    location: job?.location || '',
    description: job?.description || '',
    experience_requirement: job?.experience_requirement || '',
    education_requirement: job?.education_requirement || '',
    status: job?.status || 'Active',
  })
  const [skills, setSkills] = useState(job?.required_skills || [])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (
      !form.title ||
      !form.location ||
      !form.description ||
      !form.experience_requirement ||
      !form.education_requirement ||
      skills.length === 0
    ) {
      setError('Please fill in all fields and add at least one skill.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const payload = { ...form, required_skills: skills }
      if (isEdit) {
        await updateJob(job.id, payload)
      } else {
        await createJob(payload)
      }
      onCreated()
      onClose()
    } catch (err) {
      setError(`Could not ${isEdit ? 'update' : 'create'} the job posting: ${err.message}`)
      setSubmitting(false)
    }
  }

  return (
    <div className="anim-fade fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div
        className="anim-modal bg-bg-surface rounded-modal w-full max-w-lg max-h-[calc(100vh-160px)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-[18px] font-medium text-text-primary">{isEdit ? 'Edit job posting' : 'New job posting'}</h2>
          <button onClick={onClose} className="text-text-hint hover:text-text-body transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-4">
          <div>
            <label htmlFor="njm-1" className="block text-[12px] font-medium text-text-body mb-1.5">Job title</label>
            <input id="njm-1"
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. Accountant, Sales Manager, Registered Nurse"
              className="w-full h-10 px-3 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="njm-2" className="block text-[12px] font-medium text-text-body mb-1.5">Department</label>
              <div className="relative">
                <select id="njm-2"
                  value={form.department}
                  onChange={(e) => update('department', e.target.value)}
                  className="w-full h-10 pl-3 pr-9 rounded-btn border border-border-strong text-[13px] text-text-body appearance-none cursor-pointer focus:outline-none focus:border-accent focus:border-[1.5px] bg-bg-surface"
                >
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="njm-3" className="block text-[12px] font-medium text-text-body mb-1.5">Employment type</label>
              <div className="relative">
                <select id="njm-3"
                  value={form.employment_type}
                  onChange={(e) => update('employment_type', e.target.value)}
                  className="w-full h-10 pl-3 pr-9 rounded-btn border border-border-strong text-[13px] text-text-body appearance-none cursor-pointer focus:outline-none focus:border-accent focus:border-[1.5px] bg-bg-surface"
                >
                  {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="njm-4" className="block text-[12px] font-medium text-text-body mb-1.5">Work mode</label>
              <div className="relative">
                <select id="njm-4"
                  value={form.work_mode}
                  onChange={(e) => update('work_mode', e.target.value)}
                  className="w-full h-10 pl-3 pr-9 rounded-btn border border-border-strong text-[13px] text-text-body appearance-none cursor-pointer focus:outline-none focus:border-accent focus:border-[1.5px] bg-bg-surface"
                >
                  {WORK_MODES.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="njm-5" className="block text-[12px] font-medium text-text-body mb-1.5">Location</label>
            <input id="njm-5"
              type="text"
              list="job-locations"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Start typing a city…"
              className="w-full h-10 px-3 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px]"
            />
            <datalist id="job-locations">
              {LOCATIONS.map((l) => <option key={l} value={l} />)}
            </datalist>
          </div>
          {isEdit && (
            <div>
              <label htmlFor="njm-6" className="block text-[12px] font-medium text-text-body mb-1.5">Status</label>
              <div className="relative">
                <select id="njm-6"
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                  className="w-full h-10 pl-3 pr-9 rounded-btn border border-border-strong text-[13px] text-text-body appearance-none cursor-pointer focus:outline-none focus:border-accent focus:border-[1.5px] bg-bg-surface"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="njm-7" className="block text-[12px] font-medium text-text-body mb-1.5">Job description</label>
            <textarea id="njm-7"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={4}
              className="w-full px-3 py-2 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px] resize-none"
            />
          </div>

          <div>
            <label htmlFor="njm-8" className="block text-[12px] font-medium text-text-body mb-1.5">Experience requirement</label>
            <textarea id="njm-8"
              value={form.experience_requirement}
              onChange={(e) => update('experience_requirement', e.target.value)}
              placeholder="e.g. 3+ years in a similar role"
              rows={2}
              className="w-full px-3 py-2 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px] resize-none"
            />
          </div>

          <div>
            <label htmlFor="njm-9" className="block text-[12px] font-medium text-text-body mb-1.5">Education requirement</label>
            <textarea id="njm-9"
              value={form.education_requirement}
              onChange={(e) => update('education_requirement', e.target.value)}
              placeholder="e.g. BSc in a relevant field, or equivalent experience"
              rows={2}
              className="w-full px-3 py-2 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px] resize-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-text-body mb-1.5">Required skills</label>
            <SkillsInput skills={skills} setSkills={setSkills} />
          </div>

          {error && <p className="text-[12px] text-danger-text">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-btn border border-border-strong text-[13px] text-text-body hover:bg-bg-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Create job posting'}
          </button>
        </div>
      </div>
    </div>
  )
}
