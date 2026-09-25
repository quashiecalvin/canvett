import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Real destinations only - no dead links.
const CONTACT_EMAIL = 'quashiecalvin13@gmail.com'
const GITHUB_URL = 'https://github.com/quashiecalvin'
const LINKEDIN_URL = 'https://www.linkedin.com/in/calvin-quashie-3ba864298/'

// Brand marks (lucide dropped its logo icons), drawn inline.
function Github({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.22-3.37-1.22-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"/>
    </svg>
  )
}
function Linkedin({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97V21h-4V9Z"/>
    </svg>
  )
}

const linkCls = 'text-[13px] text-foot-text transition-colors hover:text-white'

function FootLink({ to, children }) {
  if (to.startsWith('mailto:') || to.startsWith('http')) {
    return (
      <a href={to} className={linkCls} {...(to.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    )
  }
  return <Link to={to} className={linkCls} onClick={() => window.scrollTo(0, 0)}>{children}</Link>
}

function Social({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-btn border border-foot-border text-foot-text transition-colors hover:border-foot-hint hover:text-white"
    >
      {children}
    </a>
  )
}

const CANVETT_COL = {
  title: 'Canvett',
  links: [['About', '/about'], ['Privacy', '/privacy'], ['Contact', `mailto:${CONTACT_EMAIL}`]],
}

// Full-width footer (navy) - spans edge to edge under the sidebar.
export default function Footer() {
  const { isRecruiter, isSeeker } = useAuth()

  // Link columns adapt to who's viewing - quick nav and an account column for
  // signed-in users, sign-in / sign-up for logged-out visitors. No dead links.
  const columns = isRecruiter
    ? [
        CANVETT_COL,
        { title: 'Quick links', links: [['Dashboard', '/dashboard'], ['Job postings', '/jobs'], ['Candidates', '/ranking']] },
        { title: 'Account', links: [['Profile', '/profile'], ['Settings', '/settings']] },
      ]
    : isSeeker
      ? [
          CANVETT_COL,
          { title: 'Quick links', links: [['Job board', '/seeker/jobs'], ['My applications', '/seeker/applications']] },
          { title: 'Account', links: [['Saved jobs', '/seeker/saved'], ['Profile', '/seeker/profile']] },
        ]
      : [
          CANVETT_COL,
          { title: 'Get started', links: [['Sign in', '/login'], ['Create account', '/register']] },
        ]

  return (
    <footer className="w-full border-t border-foot-border bg-foot-bg text-foot-text">
      <div className="px-4 py-10 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-6">
          {/* brand */}
          <div className="max-w-xs">
            <span className="font-outfit text-[18px] font-semibold tracking-[-0.2px]">
              <span className="text-white">Can</span>
              <span className="text-accent-light">vett</span>
            </span>
            <p className="mt-3 text-[13px] leading-[1.6] text-foot-hint">
              Intelligent matching. Better hiring.
            </p>
          </div>

          {/* on desktop md:contents lets these spread evenly across the row;
              on mobile they sit in a tidy 2-column grid */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 md:contents">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-foot-hint">{col.title}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, to]) => (
                    <li key={to}><FootLink to={to}>{label}</FootLink></li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 flex gap-2.5 self-start md:col-span-1">
              <Social href={GITHUB_URL} label="GitHub"><Github size={16} /></Social>
              <Social href={LINKEDIN_URL} label="LinkedIn"><Linkedin size={16} /></Social>
              <Social href={`mailto:${CONTACT_EMAIL}`} label="Email"><Mail size={16} /></Social>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-10 flex flex-col gap-2 border-t border-foot-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[12px] text-foot-hint">
            © 2026 Canvett · Built by Quashie Calvin Nunana · University of Ghana
          </span>
          <span className="text-[12px] text-foot-hint">All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
