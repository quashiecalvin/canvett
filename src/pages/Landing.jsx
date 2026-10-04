import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight, Check, Sparkles, Eye, SlidersHorizontal, ShieldCheck, Users, Sun, Moon,
  Search, Bell, Home as HomeIcon, Briefcase, FileText, Settings as SettingsIcon, LayoutGrid,
  Bookmark, MapPin,
} from 'lucide-react'
import './Landing.css'
import { setThemeColor, THEME_COLORS } from '../lib/themeColor'

const CONTACT_EMAIL = 'quashiecalvin13@gmail.com'

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent-2">
        <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
          <rect x="8" y="8" width="5" height="7" rx="1.5" fill="white" fillOpacity="0.95" />
          <rect x="15" y="8" width="5" height="4" rx="1.5" fill="white" fillOpacity="0.6" />
          <rect x="15" y="14" width="5" height="6" rx="1.5" fill="white" fillOpacity="0.95" />
          <rect x="8" y="17" width="5" height="3" rx="1.5" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
      <span className="font-outfit text-[20px] font-semibold tracking-[-0.3px] text-text-primary">
        Can<span className="text-accent">vett</span>
      </span>
    </div>
  )
}

function FeatureCard({ icon, title, children }) {
  return (
    <div className="landing-feature min-w-0">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[12px] bg-accent-2 text-white">{icon}</div>
      <h3 className="text-[16px] font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-[1.6] text-text-muted">{children}</p>
    </div>
  )
}

function Step({ n, title, children, last }) {
  return (
    <div className="flex items-start gap-3 sm:flex-col sm:gap-0">
      <div className="flex items-center gap-2 sm:mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-2 text-[13px] font-semibold text-white">{n}</span>
        {!last && <ArrowRight size={15} className="hidden text-text-hint sm:block" />}
      </div>
      <div>
        <h4 className="text-[14px] font-semibold text-text-primary">{title}</h4>
        <p className="mt-1 text-[12.5px] leading-[1.5] text-text-muted">{children}</p>
      </div>
    </div>
  )
}

function RecruiterMockup() {
  return (
    <div className="landing-preview relative" aria-hidden="true">
      <div className="overflow-hidden rounded-[16px] border border-border bg-bg-surface shadow-2xl shadow-black/20">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-text-hint/40" /><span className="h-2.5 w-2.5 rounded-full bg-text-hint/40" /><span className="h-2.5 w-2.5 rounded-full bg-text-hint/40" />
        </div>
        <div className="flex">
          <div className="hidden w-[118px] shrink-0 border-r border-border p-3 text-[11px] text-text-muted lg:block">
            <div className="mb-3 flex items-center gap-1.5 font-semibold text-text-primary"><LayoutGrid size={13} className="text-accent" /> Canvett</div>
            {[['Dashboard', HomeIcon, true], ['Job Postings', Briefcase], ['Upload Resumes', FileText], ['Candidates', Users], ['Analytics', SlidersHorizontal], ['Settings', SettingsIcon]].map(([l, Ic, active]) => (
              <div key={l} className={'mb-1 flex items-center gap-1.5 rounded-md px-2 py-1.5 ' + (active ? 'bg-accent-2/15 text-accent' : 'text-text-muted')}><Ic size={12} /> {l}</div>
            ))}
          </div>
          <div className="flex-1 p-3.5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 flex-1 items-center gap-1.5 rounded-md border border-border bg-bg-subtle px-2 text-[10px] text-text-hint"><Search size={11} /> Search candidates or postings…</div>
              <Bell size={13} className="text-text-hint" />
              <span className="h-5 w-5 rounded-full bg-avatar-bg" />
            </div>
            <div className="mb-3 flex items-stretch gap-2.5">
              <div className="flex-1 rounded-lg bg-accent-2 p-3 text-white">
                <div className="text-[9px] uppercase tracking-wide text-white/70">Good evening, Hunter</div>
                <div className="mt-1 text-[13px] font-semibold leading-tight">Rank your next hire with confidence</div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-1 text-[9.5px] font-medium">Review rankings <ArrowRight size={10} /></div>
              </div>
              <div className="flex w-[108px] shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-bg-subtle p-2">
                <div className="text-[8.5px] text-text-muted">Average match</div>
                <svg width="46" height="46" viewBox="0 0 46 46" className="my-1">
                  <circle cx="23" cy="23" r="18" fill="none" stroke="currentColor" strokeWidth="5" className="text-border" />
                  <circle cx="23" cy="23" r="18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-accent-2" strokeDasharray="113" strokeDashoffset="35" transform="rotate(-90 23 23)" />
                  <text x="23" y="26" textAnchor="middle" className="fill-text-primary text-[10px] font-bold">69%</text>
                </svg>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {[['Active postings', '3'], ['Total applicants', '12'], ['Resumes ranked', '12']].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-border bg-bg-subtle p-2">
                  <div className="text-[8.5px] text-text-muted">{l}</div>
                  <div className="text-[15px] font-semibold text-text-primary">{v}</div>
                </div>
              ))}
            </div>
            <div className="mb-2 text-[10px] font-semibold text-text-body">Recent job postings</div>
            {[['Marketing Director', 'Active'], ['UI/UX Designer', 'In review'], ['Software Engineer', 'Active']].map(([r, st]) => (
              <div key={r} className="mb-1.5 flex items-center justify-between rounded-md border border-border bg-bg-subtle px-2 py-1.5">
                <span className="text-[10px] text-text-body">{r}</span>
                <span className={'rounded-full px-1.5 py-0.5 text-[8px] ' + (st === 'Active' ? 'bg-success-tint text-success-text' : 'bg-warning-tint text-warning-text')}>{st}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -right-3 -bottom-4 w-[180px] rounded-[12px] border border-border bg-bg-surface p-3 shadow-2xl shadow-black/25">
        <div className="mb-2 text-[9.5px] font-semibold text-text-muted">Top candidate</div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-avatar-bg text-[10px] font-semibold text-avatar-text">KM</span>
          <div className="flex-1"><div className="text-[11px] font-semibold text-text-primary">Kwame Mensah</div><div className="text-[9px] text-text-muted">Software Engineer</div></div>
          <span className="rounded-full bg-success-tint px-1.5 py-0.5 text-[9px] font-semibold text-success-text">100%</span>
        </div>
      </div>
    </div>
  )
}
function SeekerMockup() {
  return (
    <div className="landing-preview relative" aria-hidden="true">
      <div className="overflow-hidden rounded-[16px] border border-border bg-bg-surface shadow-2xl shadow-black/20">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-text-hint/40" /><span className="h-2.5 w-2.5 rounded-full bg-text-hint/40" /><span className="h-2.5 w-2.5 rounded-full bg-text-hint/40" />
        </div>
        <div className="flex">
          <div className="hidden w-[118px] shrink-0 border-r border-border p-3 text-[11px] text-text-muted lg:block">
            <div className="mb-3 flex items-center gap-1.5 font-semibold text-text-primary"><LayoutGrid size={13} className="text-accent" /> Canvett</div>
            {[['Home', HomeIcon, true], ['Saved Jobs', Bookmark], ['My Applications', FileText]].map(([l, Ic, active]) => (
              <div key={l} className={'mb-1 flex items-center gap-1.5 rounded-md px-2 py-1.5 ' + (active ? 'bg-accent-2/15 text-accent' : 'text-text-muted')}><Ic size={12} /> {l}</div>
            ))}
          </div>
          <div className="flex-1 p-3.5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 flex-1 items-center gap-1.5 rounded-md border border-border bg-bg-subtle px-2 text-[10px] text-text-hint"><Search size={11} /> Search roles…</div>
              <Bell size={13} className="text-text-hint" />
              <span className="h-5 w-5 rounded-full bg-avatar-bg" />
            </div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-text-primary">Recommended for you</span>
              <span className="text-[9px] text-text-muted">Ranked by match</span>
            </div>
            {[['Backend Engineer', 'Sunrise Trading · Accra', '92%'], ['Data Analyst', 'MTN Ghana · Accra', '85%'], ['Product Designer', 'Hubtel · Remote', '78%'], ['Marketing Officer', 'Melcom · Tema', '71%']].map(([r, c, m]) => (
              <div key={r} className="mb-1.5 flex items-center gap-2 rounded-md border border-border bg-bg-subtle px-2.5 py-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-2/10 text-[9px] font-bold text-accent">{c.split(" · ")[0].split(" ").map(word => word[0]).slice(0, 2).join("")}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[10.5px] font-medium text-text-body">{r}</div>
                  <div className="flex items-center gap-1 truncate text-[9px] text-text-muted"><MapPin size={8} /> {c}</div>
                </div>
                <span className="rounded-full bg-success-tint px-1.5 py-0.5 text-[9px] font-semibold text-success-text">{m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* floating application-status card */}
      <div className="absolute -right-3 -bottom-4 w-[190px] rounded-[12px] border border-border bg-bg-surface p-3 shadow-2xl shadow-black/25">
        <div className="mb-2 text-[9.5px] font-semibold text-text-muted">Your application</div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-2/15 text-accent"><Briefcase size={13} /></span>
          <div className="flex-1"><div className="text-[11px] font-semibold text-text-primary">Backend Engineer</div><div className="text-[9px] text-text-muted">Sunrise Trading</div></div>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-md bg-success-tint px-2 py-1 text-[9px] font-semibold text-success-text">Shortlisted <Check size={11} /></div>
      </div>
    </div>
  )
}

const AUD = {
  recruiter: {
    pill: 'Smarter hiring. Better teams.',
    titleLead: 'Great teams start with ',
    sub: 'Canvett helps organisations find, rank and hire the best candidates with explainable AI. Smarter tools, fairer decisions, better teams.',
    bullets: ['AI-powered ranking', 'Explainable scores', 'Built for Ghana'],
    cta: 'Start hiring',
    steps: [
      ['Create a job', 'Add the role, description and requirements.'],
      ['Review candidates', 'AI matches and ranks the best fits.'],
      ['Make a decision', 'View detailed insights and compare.'],
      ['Hire with confidence', 'Bring the right person on board.'],
    ],
  },
  seeker: {
    pill: 'Smarter applications. Better matches.',
    titleLead: 'Your next chapter starts with ',
    sub: 'Canvett matches your CV to roles that fit, shows you exactly how you rank, and lets you apply and track everything in one place.',
    bullets: ['Matched to the right roles', 'See how you rank', 'Apply & track with ease'],
    cta: 'Find my next role',
    steps: [
      ['Build your profile', 'Add your CV or fill a quick form.'],
      ['Get matched', 'See roles that fit, ranked by match.'],
      ['Apply in a click', 'Reuse your CV across applications.'],
      ['Track everything', "Follow each application's progress."],
    ],
  },
}
export default function Landing() {
  const { pathname } = useLocation()
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('canvett_theme')
      return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch { return false }
  })
  const [audience, setAudience] = useState('recruiter')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    setThemeColor(dark ? THEME_COLORS.dark : THEME_COLORS.light)
  }, [dark])
  function toggleTheme() {
    const next = !dark
    setDark(next)
    try { localStorage.setItem('canvett_theme', next ? 'dark' : 'light') } catch { /* ignore */ }
  }
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  const a = AUD[audience]

  return (
    <div className="canvett-landing brand-bg min-h-screen w-full overflow-x-hidden text-text-primary">
      <div className="landing-intro flex flex-col">
        <div className="hero-corners" aria-hidden="true"><i /><i /></div>
        <header className="landing-header relative z-20 mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 py-5 md:px-8">
          <Link to="/" aria-label="Canvett home"><Logo /></Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-8 text-[14px] text-text-muted md:flex">
            <Link to="/" className="font-medium text-text-primary">Home</Link>
            <Link to="/about" className="transition-colors hover:text-text-primary">About</Link>
            <Link to="/privacy" className="transition-colors hover:text-text-primary">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-text-primary">Terms</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-text-primary">Contact</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <button onClick={toggleTheme} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} className="flex h-10 w-10 items-center justify-center rounded-btn border border-border text-text-muted transition-colors hover:bg-bg-subtle">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to="/login" className="inline-flex h-10 items-center rounded-btn border border-border-strong px-4 text-[13.5px] font-medium text-text-body transition-colors hover:bg-bg-subtle">Log in</Link>
            <Link to="/register" className="inline-flex h-10 items-center rounded-btn bg-accent-2 px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">Sign up</Link>
          </div>
        </header>

        <section className="landing-hero relative z-10 mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-12 px-5 pb-12 md:grid-cols-2 md:px-8">
          <div>
            {/* audience toggle */}
            <div role="group" aria-label="Choose your audience" className="mb-6 inline-flex rounded-full border border-border bg-bg-surface p-1 text-[13px] font-medium">
              <button aria-pressed={audience === 'recruiter'} onClick={() => setAudience('recruiter')}
                className={'rounded-full px-4 py-1.5 transition-colors ' + (audience === 'recruiter' ? 'bg-accent-2 text-white' : 'text-text-muted hover:text-text-primary')}>For recruiters</button>
              <button aria-pressed={audience === 'seeker'} onClick={() => setAudience('seeker')}
                className={'rounded-full px-4 py-1.5 transition-colors ' + (audience === 'seeker' ? 'bg-accent-2 text-white' : 'text-text-muted hover:text-text-primary')}>For job seekers</button>
            </div>

            <span className="flex w-fit items-center gap-1.5 rounded-full border border-border bg-bg-surface px-3.5 py-1.5 text-[12.5px] font-medium text-text-muted">
              <Sparkles size={14} className="text-accent-2" /> {a.pill}
            </span>
            <h1 className="landing-title mt-5 font-outfit text-[42px] font-bold leading-[1.05] tracking-[-1px] text-text-primary sm:text-[52px]">
              {a.titleLead}<span className="text-accent">Canvett</span>
            </h1>
            <p className="mt-5 max-w-[460px] text-[15px] leading-[1.65] text-text-muted">{a.sub}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/register" className="group inline-flex h-12 items-center gap-2 rounded-btn bg-accent-2 px-6 text-[14.5px] font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">
                {a.cta} <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#features" className="inline-flex h-12 items-center rounded-btn border border-border-strong px-6 text-[14.5px] font-semibold text-text-body transition-colors hover:bg-bg-subtle">See how it works <ArrowRight size={16} className="ml-2" /></a>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-text-body">
              {a.bullets.map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent-2"><Check size={12} strokeWidth={3} className="text-white" /></span>{t}
                </span>
              ))}
            </div>
          </div>

          <div className="landing-visual">
            <div className="landing-decor" aria-hidden="true">
              {Array.from({ length: 3 }, (_, i) => <span key={i} />)}
            </div>
            <div className="landing-preview-label"><span className="landing-live-dot" /> {audience === 'recruiter' ? 'A clearer view of your next hire' : 'Your job search, all in one place'}<span>PRODUCT PREVIEW</span></div>
            {audience === 'recruiter' ? <RecruiterMockup /> : <SeekerMockup />}
            <p className="landing-preview-note">Illustrative preview · Built around your workflow</p>
          </div>
        </section>
      </div>
      {/* ===== Why Canvett (below the fold) ===== */}
      <section id="features" className="relative z-10 border-t border-border bg-bg-surface/60">
        <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-accent">Why Canvett</p>
          <h2 className="mt-2 font-outfit text-[30px] font-bold tracking-[-0.5px] text-text-primary">Everything you need to hire — and get hired — smarter</h2>
          <div className="landing-features mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <FeatureCard icon={<Sparkles size={20} />} title="AI-Powered Matching">Candidates and roles matched by meaning, not just keywords, using semantic similarity and embeddings.</FeatureCard>
            <FeatureCard icon={<Eye size={20} />} title="Explainable Results">Clear skill, experience and education breakdowns, so everyone sees exactly why a match ranks where it does.</FeatureCard>
            <FeatureCard icon={<SlidersHorizontal size={20} />} title="Customisable Weights">Recruiters tune how much skills, experience and education count, for every role.</FeatureCard>
            <FeatureCard icon={<ShieldCheck size={20} />} title="Privacy by design">Your data stays protected with industry best practices and secure hosting.</FeatureCard>
            <FeatureCard icon={<Users size={20} />} title="Built for Ghana">Designed with local context and the Ghanaian job market in mind.</FeatureCard>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="rounded-[16px] border border-border bg-bg-surface p-6">
              <div className="grid grid-cols-3 gap-4">
                {[['Explainable', 'Transparent score breakdowns'], ['Configurable', 'Weighting recruiters control'], ['Local', 'For the Ghanaian market']].map(([h, s]) => (
                  <div key={h}>
                    <div className="font-outfit text-[18px] font-bold text-accent">{h}</div>
                    <div className="mt-1 text-[11.5px] leading-[1.45] text-text-muted">{s}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-[12.5px] text-text-muted">
                <ShieldCheck size={15} className="text-accent" /> Transparent, explainable AI for fairer hiring.
              </div>
            </div>

            <div>
              <h3 className="font-outfit text-[20px] font-bold text-text-primary">How it works {audience === 'seeker' ? 'for job seekers' : 'for recruiters'}</h3>
              <p className="mt-1 text-[13px] text-text-muted">{audience === 'seeker' ? 'From profile to offer, in a few simple steps.' : 'From job posting to hired, in a few simple steps.'}</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-4">
                {a.steps.map(([t, d], i) => (
                  <Step key={t} n={String(i + 1)} title={t} last={i === a.steps.length - 1}>{d}</Step>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-5 rounded-[18px] border border-border bg-accent-2/[0.06] p-8 text-center sm:flex-row sm:text-left">
            <div>
              <h3 className="font-outfit text-[22px] font-bold text-text-primary">{audience === 'seeker' ? 'Ready to find your next role?' : 'Ready to hire smarter?'}</h3>
              <p className="mt-1.5 text-[13.5px] text-text-muted">{audience === 'seeker' ? 'Create your account and get matched to roles in minutes.' : 'Create your account and rank your first shortlist in minutes.'}</p>
            </div>
            <Link to="/register" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-btn bg-accent-2 px-7 text-[14.5px] font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">
              {a.cta} <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center items-center gap-5 text-[13px] text-text-muted">
            <Link to="/" className="transition-colors hover:text-text-primary">Home</Link>
            <Link to="/about" className="transition-colors hover:text-text-primary">About</Link>
            <Link to="/privacy" className="transition-colors hover:text-text-primary">Privacy</Link>
            <Link to="/terms" className="transition-colors hover:text-text-primary">Terms</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-text-primary">Contact</a>
          </nav>
          <p className="text-[12px] text-text-hint">&copy; {new Date().getFullYear()} Canvett</p>
        </div>
      </footer>
    </div>
  )
}
