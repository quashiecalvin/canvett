import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pencil, Camera, MapPin, Phone, Mail, Globe, Plus, X, Check,
  Lock, Trash2, ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, changePassword, deleteAccount } from '../../lib/api'
import { initialsFromName } from '../../lib/initials'

const FIELD_OPTIONS = ['Engineering', 'Analytics', 'Design', 'Product', 'Marketing', 'Operations']
const TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship']
const WORK_OPTIONS = ['On-site', 'Remote', 'Hybrid']

function fileToPhotoDataUrl(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not load the image'))
      img.onload = () => {
        const scale = Math.min(size / img.width, size / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

const labelCls = 'block text-[12px] font-medium text-text-body mb-1.5'
const inputCls = 'w-full h-10 px-3 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px] transition-colors'

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-[12.5px] text-text-muted shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-text-primary sm:text-right break-words">{value || '—'}</span>
    </div>
  )
}

function PrefSelect({ value, onChange, options, placeholder = 'No preference' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full h-10 pl-3 pr-9 rounded-btn border border-border-strong bg-transparent text-[13px] text-text-body appearance-none cursor-pointer focus:outline-none focus:border-accent focus:border-[1.5px] transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
    </div>
  )
}

export default function SeekerProfile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  // form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [headline, setHeadline] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [languages, setLanguages] = useState('')
  const [bio, setBio] = useState('')
  const [photo, setPhoto] = useState('')
  const [prefField, setPrefField] = useState('')
  const [prefType, setPrefType] = useState('')
  const [prefLocation, setPrefLocation] = useState('')
  const [skillList, setSkillList] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const photoInputRef = useRef(null)

  // password + delete
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [pwErr, setPwErr] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deletePw, setDeletePw] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteErr, setDeleteErr] = useState(null)

  const name = user?.full_name || 'Your name'
  const initials = initialsFromName(user?.full_name || user?.email)
  const skillsFromUser = (user?.skills || '').split(',').map((s) => s.trim()).filter(Boolean)

  function startEdit() {
    setFullName(user?.full_name || '')
    setEmail(user?.email || '')
    setHeadline(user?.headline || '')
    setPhone(user?.phone || '')
    setLocation(user?.location || '')
    setWebsite(user?.website || '')
    setLanguages(user?.languages || '')
    setBio(user?.bio || '')
    setPhoto(user?.photo || '')
    setPrefField(user?.pref_field || '')
    setPrefType(user?.pref_job_type || '')
    setPrefLocation(user?.pref_location || '')
    setSkillList(skillsFromUser)
    setSkillInput('')
    setMsg(null); setErr(null)
    setEditing(true)
  }

  function addSkill() {
    const v = skillInput.trim()
    if (!v) return
    if (!skillList.some((s) => s.toLowerCase() === v.toLowerCase())) {
      setSkillList((prev) => [...prev, v])
    }
    setSkillInput('')
  }

  async function onPhotoPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { setErr('Please choose an image file.'); return }
    setPhotoBusy(true); setErr(null)
    try {
      const dataUrl = await fileToPhotoDataUrl(file)
      setPhoto(dataUrl)
      const updated = await updateProfile({
        full_name: user?.full_name || '',
        email: user?.email || '',
        headline: user?.headline,
        phone: user?.phone,
        location: user?.location,
        website: user?.website,
        languages: user?.languages,
        bio: user?.bio,
        pref_field: user?.pref_field,
        pref_job_type: user?.pref_job_type,
        pref_location: user?.pref_location,
        skills: user?.skills,
        photo: dataUrl,
      })
      updateUser(updated)
    } catch (er) {
      setErr(er.message || 'Could not update your photo.')
    }
    setPhotoBusy(false)
  }

  async function save() {
    setSaving(true); setErr(null); setMsg(null)
    try {
      const updated = await updateProfile({
        full_name: fullName,
        email,
        headline,
        phone,
        location,
        website,
        languages,
        bio,
        photo,
        pref_field: prefField,
        pref_job_type: prefType,
        pref_location: prefLocation,
        skills: skillList.join(', '),
      })
      updateUser(updated)
      setEditing(false)
      setMsg('Your profile has been saved.')
    } catch (e) {
      setErr(e.message || 'Could not save your profile.')
    }
    setSaving(false)
  }

  async function savePassword() {
    setPwMsg(null); setPwErr(null)
    if (newPw !== confirmPw) { setPwErr('The new passwords do not match.'); return }
    setSavingPw(true)
    try {
      await changePassword({ current_password: currentPw, new_password: newPw })
      setPwMsg('Your password has been changed.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (e) { setPwErr(e.message) }
    setSavingPw(false)
  }

  async function handleDeleteAccount() {
    setDeleteBusy(true); setDeleteErr(null)
    try {
      await deleteAccount(deletePw)
      logout()
      navigate('/login', { replace: true })
    } catch (e) {
      setDeleteErr(e.message || 'Could not delete your account.')
      setDeleteBusy(false)
    }
  }

  const AvatarBlock = () => (
    <div className="relative shrink-0">
      {(editing ? photo : user?.photo)
        ? <img src={editing ? photo : user?.photo} alt={name} className="w-24 h-24 rounded-full object-cover bg-white ring-4 ring-bg-surface shrink-0" />
        : <div className="w-24 h-24 text-[26px] rounded-full bg-avatar-bg ring-4 ring-bg-surface flex items-center justify-center font-medium text-avatar-text shrink-0">{initials}</div>}
      <button
        type="button"
        onClick={() => photoInputRef.current?.click()}
        disabled={photoBusy}
        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center ring-2 ring-bg-surface hover:bg-accent-2 transition-colors disabled:opacity-60"
        aria-label="Change photo"
      >
        <Camera size={15} />
      </button>
      <input ref={photoInputRef} type="file" accept="image/*" onChange={onPhotoPick} className="hidden" />
    </div>
  )

  const SkillsEditor = () => (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {skillList.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 bg-accent-tint text-accent text-[12px] font-medium pl-3 pr-1.5 py-1 rounded-full">
            {s}
            <button type="button" onClick={() => setSkillList((prev) => prev.filter((x) => x !== s))} className="hover:text-accent-2"><X size={13} /></button>
          </span>
        ))}
        {skillList.length === 0 && <span className="text-[12px] text-text-hint">Add your key skills…</span>}
      </div>
      <div className="flex gap-2 max-w-md">
        <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
          placeholder="Type a skill and press Enter" className={inputCls + ' flex-1'} />
        <button type="button" onClick={addSkill} className="h-10 px-3.5 rounded-btn border border-border-strong text-text-body hover:bg-bg-subtle transition-colors inline-flex items-center gap-1.5 text-[13px] font-medium"><Plus size={15} /> Add</button>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted hover:text-text-body transition-colors mb-5"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-tight">My Profile</h1>
          <p className="text-[13px] text-text-muted mt-1">Manage your professional profile and personal information.</p>
        </div>
        {!editing ? (
          <button
            onClick={startEdit}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent-2 transition-colors shrink-0"
          >
            <Pencil size={15} /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setEditing(false)} disabled={saving}
              className="h-10 px-4 rounded-btn text-[13px] font-medium text-text-muted hover:bg-bg-subtle transition-colors">
              Cancel
            </button>
            <button onClick={save} disabled={saving || !fullName.trim()}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>

      {msg && <div className="mb-4 flex items-center gap-1.5 text-[12.5px] text-success-text"><Check size={14} />{msg}</div>}
      {err && <div className="mb-4 text-[12.5px] text-danger-text">{err}</div>}

      {editing ? (
        /* ---------- EDIT: single full-width form ---------- */
        <div className="flex flex-col gap-5">
          {/* Identity + contact */}
          <div className="bg-bg-surface border border-border rounded-card p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {AvatarBlock()}
              <div className="min-w-0 flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Full name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Headline</label><input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Software Engineer" className={inputCls} /></div>
                <div><label className={labelCls}>Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className={inputCls} /></div>
                <div><label className={labelCls}>Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Website / LinkedIn</label><input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className={inputCls} /></div>
                <div><label className={labelCls}>Languages</label><input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="e.g. English, Twi" className={inputCls} /></div>
              </div>
            </div>
          </div>

          {/* About Me */}
          <div className="bg-bg-surface border border-border rounded-card p-6">
            <h3 className="text-[15px] font-medium text-text-primary mb-3">About Me</h3>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5}
              placeholder="A short professional summary…"
              className="w-full px-3 py-2.5 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px] transition-colors resize-y" />
          </div>

          {/* Skills */}
          <div className="bg-bg-surface border border-border rounded-card p-6">
            <h3 className="text-[15px] font-medium text-text-primary mb-3">Skills</h3>
            {SkillsEditor()}
          </div>

          {/* Job preferences */}
          <div className="bg-bg-surface border border-border rounded-card p-6">
            <h3 className="text-[15px] font-medium text-text-primary mb-1">Job preferences</h3>
            <p className="text-[12px] text-text-muted mb-5">Used to personalise the roles we show you.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className={labelCls}>Field</label><PrefSelect value={prefField} onChange={(e) => setPrefField(e.target.value)} options={FIELD_OPTIONS} /></div>
              <div><label className={labelCls}>Job type</label><PrefSelect value={prefType} onChange={(e) => setPrefType(e.target.value)} options={TYPE_OPTIONS} /></div>
              <div><label className={labelCls}>Work style</label><PrefSelect value={prefLocation} onChange={(e) => setPrefLocation(e.target.value)} options={WORK_OPTIONS} /></div>
            </div>
          </div>
        </div>
      ) : (
        /* ---------- VIEW: main + rail, then full-width ---------- */
        <>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">
            {/* Main column */}
            <div className="flex flex-col gap-5 min-w-0">
              {/* Identity */}
              <div className="bg-bg-surface border border-border rounded-card p-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {AvatarBlock()}
                  <div className="min-w-0 flex-1 w-full">
                    <h2 className="text-[22px] font-semibold text-text-primary leading-tight">{name}</h2>
                    {user?.headline && <p className="text-[14px] font-medium text-accent mt-0.5">{user.headline}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2.5 mt-4 max-w-xl">
                      <span className="inline-flex items-center gap-2 text-[12.5px] text-text-muted min-w-0"><MapPin size={14} className="text-text-hint shrink-0" /><span className="truncate">{user?.location || '—'}</span></span>
                      <span className="inline-flex items-center gap-2 text-[12.5px] text-text-muted min-w-0"><Phone size={14} className="text-text-hint shrink-0" /><span className="truncate">{user?.phone || '—'}</span></span>
                      <span className="inline-flex items-center gap-2 text-[12.5px] text-text-muted min-w-0"><Mail size={14} className="text-text-hint shrink-0" /><span className="truncate">{user?.email}</span></span>
                      {user?.website
                        ? <a href={user.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[12.5px] text-accent hover:underline min-w-0"><Globe size={14} className="shrink-0" /><span className="truncate">{user.website.replace(/^https?:\/\//, '')}</span></a>
                        : <span className="inline-flex items-center gap-2 text-[12.5px] text-text-muted min-w-0"><Globe size={14} className="text-text-hint shrink-0" />—</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* About Me */}
              <div className="bg-bg-surface border border-border rounded-card p-6">
                <h3 className="text-[15px] font-medium text-text-primary mb-3">About Me</h3>
                <p className="text-[13px] text-text-body leading-relaxed whitespace-pre-line">{user?.bio || 'Tell employers a little about yourself — add a short summary in Edit Profile.'}</p>
              </div>
            </div>

            {/* Right rail */}
            <div className="flex flex-col gap-5">
              {/* Personal information */}
              <div className="bg-bg-surface border border-border rounded-card p-6">
                <h3 className="text-[15px] font-medium text-text-primary mb-2">Personal Information</h3>
                <InfoRow label="Full Name" value={user?.full_name} />
                <InfoRow label="Phone Number" value={user?.phone} />
                <InfoRow label="Email Address" value={user?.email} />
                <InfoRow label="Location" value={user?.location} />
                <InfoRow label="Languages" value={user?.languages} />
              </div>

              {/* Skills */}
              <div className="bg-bg-surface border border-border rounded-card p-6">
                <h3 className="text-[15px] font-medium text-text-primary mb-3">Skills</h3>
                {skillsFromUser.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skillsFromUser.map((s) => (
                      <span key={s} className="bg-accent-tint text-accent text-[12px] font-medium px-3 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                ) : <p className="text-[12.5px] text-text-muted">No skills added yet. Add a few in Edit Profile — they power your job recommendations.</p>}
              </div>
            </div>
          </div>

          {/* Job preferences (full width) */}
          <div className="bg-bg-surface border border-border rounded-card p-6 mt-5">
            <h3 className="text-[15px] font-medium text-text-primary mb-1">Job preferences</h3>
            <p className="text-[12px] text-text-muted mb-5">Used to personalise the roles we show you.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:border-r border-border sm:pr-6">
                <p className="text-[11.5px] text-text-muted">Field</p>
                <p className="text-[15px] font-medium text-text-primary mt-1">{user?.pref_field || '—'}</p>
              </div>
              <div className="sm:border-r border-border sm:pr-6">
                <p className="text-[11.5px] text-text-muted">Job type</p>
                <p className="text-[15px] font-medium text-text-primary mt-1">{user?.pref_job_type || '—'}</p>
              </div>
              <div>
                <p className="text-[11.5px] text-text-muted">Work style</p>
                <p className="text-[15px] font-medium text-text-primary mt-1">{user?.pref_location || '—'}</p>
              </div>
            </div>
          </div>

          {/* Account & security (full width) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 items-start">
            {/* Password */}
            <div className="bg-bg-surface border border-border rounded-card p-6">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={15} className="text-text-muted" />
                <h3 className="text-[15px] font-medium text-text-primary">Password</h3>
              </div>
              <p className="text-[12.5px] text-text-muted mb-4 max-w-md leading-relaxed">Change the password you use to sign in to your account.</p>
              {!showPassword ? (
                <button onClick={() => { setShowPassword(true); setPwMsg(null); setPwErr(null) }}
                  className="h-9 px-4 rounded-btn border border-border-strong text-[12.5px] font-medium text-text-body hover:bg-bg-subtle transition-colors">
                  Change password
                </button>
              ) : (
                <div className="flex flex-col gap-3 max-w-md">
                  <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} autoComplete="current-password" placeholder="Current password" className={inputCls} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" placeholder="New password" className={inputCls} />
                    <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" placeholder="Confirm new" className={inputCls} />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={savePassword} disabled={savingPw || !currentPw || !newPw || !confirmPw}
                      className="h-9 px-4 rounded-btn bg-accent text-white text-[12.5px] font-medium hover:bg-accent-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {savingPw ? 'Changing…' : 'Update password'}
                    </button>
                    <button onClick={() => { setShowPassword(false); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setPwErr(null) }} disabled={savingPw}
                      className="h-9 px-3 rounded-btn text-[12.5px] font-medium text-text-muted hover:bg-bg-subtle transition-colors">Cancel</button>
                    {pwMsg && <span className="flex items-center gap-1 text-[12px] text-success-text"><Check size={13} />{pwMsg}</span>}
                    {pwErr && <span className="text-[12px] text-danger-text">{pwErr}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Delete account */}
            <div className="bg-bg-surface rounded-card border border-danger/30 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 size={15} className="text-danger" />
                <h3 className="text-[15px] font-medium text-text-primary">Delete account</h3>
              </div>
              <p className="text-[12.5px] text-text-muted mb-4 max-w-md leading-relaxed">Permanently remove your account, applications and saved jobs. This cannot be undone.</p>
              {!showDelete ? (
                <button onClick={() => { setShowDelete(true); setDeleteErr(null) }}
                  className="h-9 px-4 rounded-btn border border-danger/40 text-[12.5px] font-medium text-danger hover:bg-danger-tint transition-colors">
                  Delete my account
                </button>
              ) : (
                <div className="flex flex-col gap-3 max-w-md">
                  <input type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} autoComplete="current-password" placeholder="Enter your password to confirm" className={inputCls} />
                  {deleteErr && <span className="text-[12px] text-danger-text">{deleteErr}</span>}
                  <div className="flex items-center gap-2">
                    <button onClick={handleDeleteAccount} disabled={deleteBusy || !deletePw}
                      className="h-9 px-4 rounded-btn bg-danger text-white text-[12.5px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                      {deleteBusy ? 'Deleting…' : 'Permanently delete'}
                    </button>
                    <button onClick={() => { setShowDelete(false); setDeletePw(''); setDeleteErr(null) }} disabled={deleteBusy}
                      className="h-9 px-3 rounded-btn text-[12.5px] font-medium text-text-muted hover:bg-bg-subtle transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
