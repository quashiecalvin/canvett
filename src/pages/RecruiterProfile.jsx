import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pencil, Camera, MapPin, Phone, Mail, Globe, Shield,
  Check, Lock, Trash2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword, deleteAccount } from '../lib/api'

function fileToLogoDataUrl(file, size = 256) {
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
        resolve(canvas.toDataURL('image/png'))
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

export default function RecruiterProfile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [logoBusy, setLogoBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [bio, setBio] = useState('')
  const [logo, setLogo] = useState('')
  const logoInputRef = useRef(null)

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

  const company = user?.company_name || 'Your company'
  const companyInitials = (user?.company_name || user?.full_name || 'C').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null

  function startEdit() {
    setFullName(user?.full_name || '')
    setEmail(user?.email || '')
    setCompanyName(user?.company_name || '')
    setPhone(user?.phone || '')
    setLocation(user?.location || '')
    setWebsite(user?.website || '')
    setBio(user?.bio || '')
    setLogo(user?.company_logo || '')
    setMsg(null); setErr(null)
    setEditing(true)
  }

  async function onLogoPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { setErr('Please choose an image file.'); return }
    setLogoBusy(true); setErr(null)
    try {
      const dataUrl = await fileToLogoDataUrl(file)
      setLogo(dataUrl)
      const updated = await updateProfile({
        full_name: user?.full_name || '',
        email: user?.email || '',
        company_name: user?.company_name,
        phone: user?.phone,
        location: user?.location,
        website: user?.website,
        bio: user?.bio,
        company_logo: dataUrl,
      })
      updateUser(updated)
    } catch (er) {
      setErr(er.message || 'Could not update the logo.')
    }
    setLogoBusy(false)
  }

  async function save() {
    setSaving(true); setErr(null); setMsg(null)
    try {
      const updated = await updateProfile({
        full_name: fullName,
        email,
        company_name: companyName,
        phone,
        location,
        website,
        bio,
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

  const LogoBlock = () => (
    <div className="relative shrink-0">
      {(editing ? logo : user?.company_logo)
        ? <img src={editing ? logo : user?.company_logo} alt={company} className="w-24 h-24 rounded-2xl object-contain bg-white border border-border ring-4 ring-bg-surface shrink-0" />
        : <div className="w-24 h-24 rounded-2xl bg-accent-tint ring-4 ring-bg-surface flex items-center justify-center text-accent text-[24px] font-semibold shrink-0">{companyInitials}</div>}
      <button
        type="button"
        onClick={() => logoInputRef.current?.click()}
        disabled={logoBusy}
        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center ring-2 ring-bg-surface hover:bg-accent-2 transition-colors disabled:opacity-60"
        aria-label="Change company logo"
      >
        <Camera size={15} />
      </button>
      <input ref={logoInputRef} type="file" accept="image/*" onChange={onLogoPick} className="hidden" />
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
          <p className="text-[13px] text-text-muted mt-1">Manage your company details and account.</p>
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
          {/* Company identity */}
          <div className="bg-bg-surface border border-border rounded-card p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {LogoBlock()}
              <div className="min-w-0 flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Company name</label><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your organisation" className={inputCls} /></div>
                <div><label className={labelCls}>Your name</label><input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Company website</label><input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className={inputCls} /></div>
                <div><label className={labelCls}>Company location</label><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className={inputCls} /></div>
              </div>
            </div>
          </div>

          {/* About the company */}
          <div className="bg-bg-surface border border-border rounded-card p-6">
            <h3 className="text-[15px] font-medium text-text-primary mb-3">About the company</h3>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5}
              placeholder="A short description of your company, shown to job seekers…"
              className="w-full px-3 py-2.5 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px] transition-colors resize-y" />
          </div>
        </div>
      ) : (
        /* ---------- VIEW: main + rail, then full-width ---------- */
        <>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5 items-start">
            {/* Main column */}
            <div className="flex flex-col gap-5 min-w-0">
              {/* Company identity */}
              <div className="bg-bg-surface border border-border rounded-card p-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {LogoBlock()}
                  <div className="min-w-0 flex-1 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[22px] font-semibold text-text-primary leading-tight">{company}</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-tint text-accent text-[11px] font-medium px-2.5 py-0.5"><Shield size={11} /> Recruiter</span>
                    </div>
                    {user?.full_name && <p className="text-[13px] text-text-muted mt-0.5">Managed by {user.full_name}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2.5 mt-4 max-w-xl">
                      <span className="inline-flex items-center gap-2 text-[12.5px] text-text-muted min-w-0"><Mail size={14} className="text-text-hint shrink-0" /><span className="truncate">{user?.email}</span></span>
                      <span className="inline-flex items-center gap-2 text-[12.5px] text-text-muted min-w-0"><Phone size={14} className="text-text-hint shrink-0" /><span className="truncate">{user?.phone || '—'}</span></span>
                      {user?.website
                        ? <a href={user.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[12.5px] text-accent hover:underline min-w-0"><Globe size={14} className="shrink-0" /><span className="truncate">{user.website.replace(/^https?:\/\//, '')}</span></a>
                        : <span className="inline-flex items-center gap-2 text-[12.5px] text-text-muted min-w-0"><Globe size={14} className="text-text-hint shrink-0" />—</span>}
                      <span className="inline-flex items-center gap-2 text-[12.5px] text-text-muted min-w-0"><MapPin size={14} className="text-text-hint shrink-0" /><span className="truncate">{user?.location || '—'}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* About the company */}
              <div className="bg-bg-surface border border-border rounded-card p-6">
                <h3 className="text-[15px] font-medium text-text-primary mb-3">About the company</h3>
                <p className="text-[13px] text-text-body leading-relaxed whitespace-pre-line">{user?.bio || 'Add a short description of your company in Edit Profile — job seekers see this on your postings.'}</p>
              </div>
            </div>

            {/* Right rail */}
            <div className="flex flex-col gap-5">
              <div className="bg-bg-surface border border-border rounded-card p-6">
                <h3 className="text-[15px] font-medium text-text-primary mb-2">Company details</h3>
                <InfoRow label="Company" value={user?.company_name} />
                <InfoRow label="Contact" value={user?.full_name} />
                <InfoRow label="Email" value={user?.email} />
                <InfoRow label="Phone" value={user?.phone} />
                <InfoRow label="Location" value={user?.location} />
                {memberSince && <InfoRow label="Member since" value={memberSince} />}
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
              <p className="text-[12.5px] text-text-muted mb-4 max-w-md leading-relaxed">Permanently remove your account and all of your job postings and their applicants. This cannot be undone.</p>
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
