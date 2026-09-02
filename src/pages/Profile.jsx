import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Building2, Shield, Check, Lock, IdCard, CalendarDays, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword, deleteAccount } from '../lib/api'
import { initialsFromName } from '../lib/initials'

function fileToLogoDataUrl(file, size = 128) {
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

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-bg-surface border border-border rounded-card overflow-hidden">
      <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-border">
        <div className="w-8 h-8 rounded-btn bg-accent-tint flex items-center justify-center text-accent shrink-0">
          <Icon size={16} />
        </div>
        <div>
          <h2 className="text-[14px] font-medium text-text-primary leading-tight">{title}</h2>
          <p className="text-[12px] text-text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [companyName, setCompanyName] = useState(user?.company_name || '')
  const [companyLogo, setCompanyLogo] = useState(user?.company_logo || '')
  const [logoBusy, setLogoBusy] = useState(false)
  const logoInputRef = useRef(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [profileErr, setProfileErr] = useState(null)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [pwErr, setPwErr] = useState(null)

  const [showDelete, setShowDelete] = useState(false)
  const [deletePw, setDeletePw] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteErr, setDeleteErr] = useState(null)

  const isRecruiter = user?.role === 'recruiter'
  const initials = initialsFromName(user?.full_name || user?.email)

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null

  async function handleDeleteAccount() {
    setDeleteBusy(true)
    setDeleteErr(null)
    try {
      await deleteAccount(deletePw)
      logout()
      navigate('/login', { replace: true })
    } catch (e) {
      setDeleteErr(e.message || 'Could not delete your account.')
      setDeleteBusy(false)
    }
  }

  async function saveLogo(dataUrl) {
    setLogoBusy(true); setProfileErr(null); setProfileMsg(null)
    try {
      const updated = await updateProfile({
        full_name: fullName,
        email,
        company_name: companyName,
        phone: user?.phone,
        location: user?.location,
        headline: user?.headline,
        skills: user?.skills,
        bio: user?.bio,
        company_logo: dataUrl,
      })
      updateUser(updated)
      setCompanyLogo(dataUrl)
      setProfileMsg(dataUrl ? 'Company logo updated.' : 'Company logo removed.')
    } catch (e) {
      setProfileErr(e.message || 'Could not update the logo.')
    }
    setLogoBusy(false)
  }
  async function onLogoPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { setProfileErr('Please choose an image file.'); return }
    try {
      const dataUrl = await fileToLogoDataUrl(file)
      await saveLogo(dataUrl)
    } catch (err) {
      setProfileErr(err.message || 'Could not process the image.')
    }
  }
  function removeLogo() { saveLogo('') }

  async function saveProfile() {
    setProfileMsg(null)
    setProfileErr(null)
    setSavingProfile(true)
    try {
      const updated = await updateProfile({
        full_name: fullName,
        email: email,
        company_name: isRecruiter ? companyName : null,
      })
      updateUser(updated)
      setProfileMsg('Your details have been saved.')
    } catch (e) {
      setProfileErr(e.message)
    }
    setSavingProfile(false)
  }

  async function savePassword() {
    setPwMsg(null)
    setPwErr(null)
    if (newPw !== confirmPw) {
      setPwErr('The new passwords do not match.')
      return
    }
    setSavingPw(true)
    try {
      await changePassword({ current_password: currentPw, new_password: newPw })
      setPwMsg('Your password has been changed.')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (e) {
      setPwErr(e.message)
    }
    setSavingPw(false)
  }

  const inputClass = "w-full h-10 px-3 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px] transition-colors"
  const iconInputClass = inputClass + " pl-9"
  const labelClass = "block text-[12px] font-medium text-text-body mb-1.5"

  const profileChanged =
    fullName !== (user?.full_name || '') ||
    email !== (user?.email || '') ||
    (isRecruiter && companyName !== (user?.company_name || ''))

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted hover:text-text-body transition-colors mb-5"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      {/* Header band */}
      <div className="rounded-card border border-border overflow-hidden mb-5">
        <div className="h-20 bg-accent" />
        <div className="bg-bg-surface px-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            {companyLogo ? (
              <img src={companyLogo} alt={user?.company_name || 'Company logo'} className="w-20 h-20 rounded-full object-contain bg-white ring-4 ring-bg-surface shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-avatar-bg ring-4 ring-bg-surface flex items-center justify-center text-[24px] font-medium text-avatar-text shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0 sm:pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[20px] font-medium text-text-primary leading-tight truncate">
                  {user?.full_name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-tint text-accent text-[11px] font-medium px-2.5 py-0.5">
                  <Shield size={11} />
                  {isRecruiter ? 'Recruiter' : 'Job Seeker'}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1.5 text-[12.5px] text-text-muted">
                  <Mail size={13} className="shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </span>
                {isRecruiter && user?.company_name && (
                  <span className="flex items-center gap-1.5 text-[12.5px] text-text-muted">
                    <Building2 size={13} className="shrink-0" />
                    {user.company_name}
                  </span>
                )}
                {memberSince && (
                  <span className="flex items-center gap-1.5 text-[12.5px] text-text-hint">
                    <CalendarDays size={13} className="shrink-0" />
                    Member since {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Editable details */}
        <SectionCard
          icon={IdCard}
          title="Personal details"
          description="Update your name, email and how you appear on the platform."
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={iconInputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={iconInputClass}
                />
              </div>
            </div>

            {isRecruiter && (
              <div>
                <label className={labelClass}>Company name</label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your organisation"
                    className={iconInputClass}
                  />
                </div>
                <p className="text-[11px] text-text-hint mt-1.5">
                  Shown to job seekers on every role you post.
                </p>
              </div>
            )}

            {isRecruiter && (
              <div>
                <label className={labelClass}>Company logo</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-btn border border-border bg-bg-subtle flex items-center justify-center overflow-hidden shrink-0">
                    {companyLogo
                      ? <img src={companyLogo} alt="Company logo" className="w-full h-full object-contain" />
                      : <Building2 size={20} className="text-text-hint" />}
                  </div>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoBusy}
                    className="h-9 px-3.5 rounded-btn border border-border-strong text-[12.5px] font-medium text-text-body hover:bg-bg-subtle transition-colors disabled:opacity-50"
                  >
                    {logoBusy ? 'Uploading…' : companyLogo ? 'Change' : 'Upload logo'}
                  </button>
                  {companyLogo && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      disabled={logoBusy}
                      className="h-9 px-3 rounded-btn text-[12.5px] font-medium text-danger hover:bg-danger-tint transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={onLogoPick} className="hidden" />
                </div>
                <p className="text-[11px] text-text-hint mt-1.5">
                  Shown next to your postings for job seekers. Square PNGs work best.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={saveProfile}
                disabled={savingProfile || !profileChanged || !fullName.trim()}
                className="h-10 px-5 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingProfile ? 'Saving...' : 'Save changes'}
              </button>
              {profileMsg && (
                <span className="flex items-center gap-1.5 text-[12px] text-success-text">
                  <Check size={13} />
                  {profileMsg}
                </span>
              )}
              {profileErr && <span className="text-[12px] text-danger-text">{profileErr}</span>}
            </div>
          </div>
        </SectionCard>

        {/* Change password */}
        <SectionCard
          icon={Lock}
          title="Password"
          description="Choose a strong password you don't use elsewhere."
        >
          <div className="flex flex-col gap-4">
            <div className="sm:max-w-xs">
              <label className={labelClass}>Current password</label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                autoComplete="current-password"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>New password</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Confirm new password</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={savePassword}
                disabled={savingPw || !currentPw || !newPw || !confirmPw}
                className="h-10 px-5 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPw ? 'Changing...' : 'Update password'}
              </button>
              {pwMsg && (
                <span className="flex items-center gap-1.5 text-[12px] text-success-text">
                  <Check size={13} />
                  {pwMsg}
                </span>
              )}
              {pwErr && <span className="text-[12px] text-danger-text">{pwErr}</span>}
            </div>
          </div>
        </SectionCard>

        {/* Account type (read-only) */}
        <div className="flex items-center gap-3 px-5 py-4 rounded-card border border-border bg-bg-subtle">
          <Shield size={15} className="text-text-hint shrink-0" />
          <p className="text-[12.5px] text-text-muted">
            Your account type is <span className="font-medium text-text-body capitalize">{isRecruiter ? 'Recruiter' : 'Job Seeker'}</span> and cannot be changed.
          </p>
        </div>

        {/* Danger zone */}
        <div className="rounded-card border border-danger/30 overflow-hidden">
          <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-danger/20">
            <div className="w-8 h-8 rounded-btn bg-danger-tint flex items-center justify-center text-danger shrink-0">
              <Trash2 size={16} />
            </div>
            <div>
              <h2 className="text-[14px] font-medium text-text-primary leading-tight">Delete account</h2>
              <p className="text-[12px] text-text-muted mt-0.5">Permanently remove your account and all associated data. This cannot be undone.</p>
            </div>
          </div>
          <div className="p-5">
            {!showDelete ? (
              <button
                onClick={() => { setShowDelete(true); setDeleteErr(null) }}
                className="h-10 px-5 rounded-btn border border-danger/40 text-[13px] font-medium text-danger hover:bg-danger-tint transition-colors"
              >
                Delete my account
              </button>
            ) : (
              <div className="flex flex-col gap-3 max-w-sm">
                <p className="text-[12.5px] text-text-body">
                  This permanently deletes your account{isRecruiter ? ', all your job postings and their applicants' : ', your applications and saved jobs'}. Enter your password to confirm.
                </p>
                <input
                  type="password"
                  value={deletePw}
                  onChange={(e) => setDeletePw(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Your password"
                  className={inputClass}
                />
                {deleteErr && <span className="text-[12px] text-danger-text">{deleteErr}</span>}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteBusy || !deletePw}
                    className="h-10 px-5 rounded-btn bg-danger text-white text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteBusy ? 'Deleting…' : 'Permanently delete'}
                  </button>
                  <button
                    onClick={() => { setShowDelete(false); setDeletePw(''); setDeleteErr(null) }}
                    disabled={deleteBusy}
                    className="h-10 px-4 rounded-btn text-[13px] font-medium text-text-muted hover:bg-bg-subtle transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
