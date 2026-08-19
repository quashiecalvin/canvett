import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Building2, Shield, Check, Lock, IdCard, CalendarDays } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword } from '../lib/api'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [companyName, setCompanyName] = useState(user?.company_name || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)
  const [profileErr, setProfileErr] = useState(null)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [pwErr, setPwErr] = useState(null)

  const isRecruiter = user?.role === 'recruiter'
  const initials = (user?.full_name || user?.email || '?')
    .split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null

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
        <div className="h-20 bg-gradient-to-r from-accent to-accent-2" />
        <div className="bg-bg-surface px-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div className="w-20 h-20 rounded-full bg-avatar-bg ring-4 ring-bg-surface flex items-center justify-center text-[24px] font-medium text-avatar-text shrink-0">
              {initials}
            </div>
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
      </div>
    </div>
  )
}
