import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Building2, Shield, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword } from '../lib/api'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(user?.full_name || '')
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

  async function saveProfile() {
    setProfileMsg(null)
    setProfileErr(null)
    setSavingProfile(true)
    try {
      const updated = await updateProfile({
        full_name: fullName,
        company_name: isRecruiter ? companyName : null,
      })
      updateUser(updated)
      setProfileMsg('Profile updated.')
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
      setPwMsg('Password changed.')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (e) {
      setPwErr(e.message)
    }
    setSavingPw(false)
  }

  const inputClass = "w-full h-10 px-3 rounded-btn border border-border-strong text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px]"
  const labelClass = "block text-[12px] font-medium text-text-body mb-1.5"
  const cardClass = "bg-bg-surface border border-border rounded-card p-5"

  const profileChanged =
    fullName !== (user?.full_name || '') ||
    (isRecruiter && companyName !== (user?.company_name || ''))

  return (
    <div className="p-6 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted hover:text-text-body transition-colors mb-5"
      >
        <ArrowLeft size={15} />
        Back
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-avatar-bg flex items-center justify-center text-[18px] font-medium text-avatar-text shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">
            {user?.full_name}
          </h1>
          <p className="text-[13px] text-text-muted mt-0.5 capitalize">
            {isRecruiter ? 'Recruiter' : 'Job Seeker'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Account info (read-only) */}
        <div className={cardClass}>
          <h2 className="text-[15px] font-medium text-text-primary mb-4">Account</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Mail size={15} className="text-text-hint shrink-0" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-text-hint">Email</p>
                <p className="text-[13px] text-text-body">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={15} className="text-text-hint shrink-0" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-text-hint">Account type</p>
                <p className="text-[13px] text-text-body capitalize">{isRecruiter ? 'Recruiter' : 'Job Seeker'}</p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-text-hint mt-4">
            Your email and account type cannot be changed.
          </p>
        </div>

        {/* Editable details */}
        <div className={cardClass}>
          <h2 className="text-[15px] font-medium text-text-primary mb-4">Details</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`${inputClass} pl-9`}
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
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <p className="text-[11px] text-text-hint mt-1.5">
                  Shown to job seekers on every role you post.
                </p>
              </div>
            )}

            {profileMsg && (
              <div className="flex items-center gap-2 text-[12px] text-success-text">
                <Check size={13} />
                {profileMsg}
              </div>
            )}
            {profileErr && <p className="text-[12px] text-danger-text">{profileErr}</p>}

            <button
              onClick={saveProfile}
              disabled={savingProfile || !profileChanged || !fullName.trim()}
              className="h-10 px-5 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 self-start"
            >
              {savingProfile ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* Change password */}
        <div className={cardClass}>
          <h2 className="text-[15px] font-medium text-text-primary mb-4">Change password</h2>
          <div className="flex flex-col gap-4">
            <div>
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

            {pwMsg && (
              <div className="flex items-center gap-2 text-[12px] text-success-text">
                <Check size={13} />
                {pwMsg}
              </div>
            )}
            {pwErr && <p className="text-[12px] text-danger-text">{pwErr}</p>}

            <button
              onClick={savePassword}
              disabled={savingPw || !currentPw || !newPw || !confirmPw}
              className="h-10 px-5 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 self-start"
            >
              {savingPw ? 'Changing...' : 'Change password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
