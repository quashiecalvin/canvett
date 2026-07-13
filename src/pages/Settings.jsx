import { useState, useEffect } from 'react'
import { Save, RotateCcw, AlertTriangle } from 'lucide-react'
import { getSettings, updateSettings } from '../lib/api'
import { useSettings } from '../context/SettingsContext'

const DEFAULTS = {
  skills_weight: 0.5,
  experience_weight: 0.3,
  education_weight: 0.2,
  unverified_factor: 0.7,
  skill_threshold: 0.5,
  recruiter_name: 'Recruiter',
  recruiter_role: 'HR Manager',
}
const SKILL_PRESETS = [
  {
    label: 'Strict',
    value: 0.65,
    blurb: 'Only count a skill when the candidate has described it almost exactly as the role does. Fewer false matches, but genuine ones worded differently may be missed.',
  },
  {
    label: 'Balanced',
    value: 0.5,
    blurb: 'Recommended. Counts clearly equivalent wording, such as "Postgres" for "PostgreSQL", while rejecting loosely related terms.',
  },
  {
    label: 'Lenient',
    value: 0.35,
    blurb: 'Counts a skill when the wording is broadly related. Catches more genuine matches, but may credit skills the candidate does not actually have.',
  },
]

function Section({ title, description, children }) {
  return (
    <div className="bg-bg-surface border border-border rounded-card p-4">
      <h2 className="text-[15px] font-medium text-text-primary leading-[1.4]">{title}</h2>
      <p className="text-[12px] text-text-muted mt-0.5 mb-4">{description}</p>
      {children}
    </div>
  )
}

function WeightSlider({ label, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] text-text-body">{label}</span>
        <span className="text-[12px] font-medium text-text-primary">{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full accent-accent"
      />
    </div>
  )
}

export default function Settings() {
  const { refreshSettings } = useSettings()
  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
     
    getSettings()
      .then((data) => {
        setForm(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setMessage(null)
    setError(null)
  }

  const weightTotal = form.skills_weight + form.experience_weight + form.education_weight
  const weightsValid = Math.abs(weightTotal - 1) < 0.001

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await updateSettings(form)
      await refreshSettings()
      setMessage('Settings saved. Re-rank a job to apply the new configuration to existing candidates.')
    } catch (e) {
      setError(e.message)
    }
    setSaving(false)
  }

  function handleReset() {
    setForm(DEFAULTS)
    setMessage(null)
    setError(null)
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-[13px] text-text-muted">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Settings</h1>
          <p className="text-[13px] text-text-muted mt-1">Configure how candidates are scored and ranked</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 h-10 px-4 rounded-btn border border-border-strong text-[13px] text-text-body hover:bg-bg-subtle transition-colors"
          >
            <RotateCcw size={14} />
            Reset to defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !weightsValid}
            className="flex items-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <Section
          title="Profile"
          description="Your name and role, shown in the sidebar."
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-text-body mb-1.5">Name</label>
              <input
                type="text"
                value={form.recruiter_name}
                onChange={(e) => update('recruiter_name', e.target.value)}
                placeholder="e.g. Calvin Quashie"
                className="w-full h-10 px-3 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-body mb-1.5">Role</label>
              <input
                type="text"
                value={form.recruiter_role}
                onChange={(e) => update('recruiter_role', e.target.value)}
                placeholder="e.g. HR Manager"
                className="w-full h-10 px-3 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px]"
              />
            </div>
          </div>
        </Section>

        <Section
          title="Scoring weights"
          description="How much each dimension contributes to a candidate's overall match score. The three weights must add up to 100%."
        >
          <div className="flex flex-col gap-4">
            <WeightSlider label="Skills" value={form.skills_weight} onChange={(v) => update('skills_weight', v)} />
            <WeightSlider label="Experience" value={form.experience_weight} onChange={(v) => update('experience_weight', v)} />
            <WeightSlider label="Education" value={form.education_weight} onChange={(v) => update('education_weight', v)} />
          </div>

          <div className={`mt-4 flex items-center gap-2 text-[12px] ${weightsValid ? 'text-success' : 'text-danger-text'}`}>
            {!weightsValid && <AlertTriangle size={13} />}
            Total: {Math.round(weightTotal * 100)}%
            {!weightsValid && ' — weights must add up to 100% before saving'}
          </div>
        </Section>

        <Section
          title="Unverified experience discount"
          description="When a candidate's experience duration cannot be read from their CV, this is the proportion of their experience score they keep. At 100% no penalty is applied; lower values penalise CVs that did not follow the standard template more heavily."
        >
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round(form.unverified_factor * 100)}
              onChange={(e) => update('unverified_factor', Number(e.target.value) / 100)}
              className="flex-1 accent-accent"
            />
            <span className="text-[13px] font-medium text-text-primary w-12 text-right">
              {Math.round(form.unverified_factor * 100)}%
            </span>
          </div>
        </Section>

        <Section
          title="Skill wording tolerance"
          description="When a required skill isn't found word-for-word in a CV, the system checks whether the candidate has described it differently — for example, writing 'Postgres' when the role asks for 'PostgreSQL'. This setting controls how forgiving that check is."
        >
          <div className="flex flex-col gap-2">
            {SKILL_PRESETS.map(({ label, value, blurb }) => {
              const active = Math.abs(form.skill_threshold - value) < 0.001
              return (
                <button
                  key={label}
                  onClick={() => update('skill_threshold', value)}
                  className={`text-left px-4 py-3 rounded-btn border transition-colors
                    ${active
                      ? 'border-accent bg-accent-tint'
                      : 'border-border hover:bg-bg-subtle'
                    }`}
                >
                  <span className={`text-[13px] font-medium ${active ? 'text-accent' : 'text-text-primary'}`}>
                    {label}
                  </span>
                  <p className="text-[12px] text-text-muted mt-0.5">{blurb}</p>
                </button>
              )
            })}
          </div>
        </Section>

        {message && (
          <div className="bg-success-tint rounded-card px-4 py-3">
            <p className="text-[12px] text-success-text">{message}</p>
          </div>
        )}
        {error && (
          <div className="bg-danger-tint rounded-card px-4 py-3">
            <p className="text-[12px] text-danger-text">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
