import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight, Check, Sparkles, Eye, SlidersHorizontal, ShieldCheck, Users, Sun, Moon,
  Search, Bell, Home as HomeIcon, Briefcase, FileText, Settings as SettingsIcon, LayoutGrid, Plus,
} from 'lucide-react'
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
    <div className="flex-1 min-w-[180px]">
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

export default function Landing() {
  const { pathname } = useLocation()
  const [dark, setDark] = useState(false)
  useEffect(() => {
    try {
      const isDark = localStorage.getItem('canvett_theme') === 'dark'
      setDark(isDark)
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
      setThemeColor(isDark ? THEME_COLORS.dark : THEME_COLORS.light)
    } catch { /* ignore */ }
  }, [])
  function toggleTheme() {
    setDark((d) => {
      const nd = !d
      document.documentElement.setAttribute('data-theme', nd ? 'dark' : 'light')
      setThemeColor(nd ? THEME_COLORS.dark : THEME_COLORS.light)
      try { localStorage.setItem('canvett_theme', nd ? 'dark' : 'light') } catch { /* ignore */ }
      return nd
    })
  }
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="brand-bg min-h-screen w-full overflow-x-hidden text-text-primary">
      {/* ===== First screen: nav + full-height hero ===== */}
      <div className="flex min-h-screen flex-col">
        <header className="relative z-20 mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 py-5 md:px-8">
          <Link to="/" aria-label="Canvett home"><Logo /></Link>
          <nav className="hidden items-center gap-8 text-[14px] text-text-muted md:flex">
            <Link to="/" className="font-medium text-text-primary">Home</Link>
            <Link to="/about" className="transition-colors hover:text-text-primary">About</Link>
            <Link to="/privacy" className="transition-colors hover:text-text-primary">Privacy</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-text-primary">Contact</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="flex h-10 w-10 items-center justify-center rounded-btn border border-border text-text-muted transition-colors hover:bg-bg-subtle">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to="/login" className="inline-flex h-10 items-center rounded-btn border border-border-strong px-4 text-[13.5px] font-medium text-text-body transition-colors hover:bg-bg-subtle">Log in</Link>
            <Link to="/register" className="inline-flex h-10 items-center rounded-btn bg-accent-2 px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">Sign up</Link>
          </div>
        </header>
        {/* ---------- Hero (fills the rest of the first screen) ---------- */}
        <section className="relative z-10 mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-12 px-5 pb-12 md:grid-cols-2 md:px-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-surface px-3.5 py-1.5 text-[12.5px] font-medium text-text-muted">
              <Sparkles size={14} className="text-accent-2" /> Smarter hiring. Better teams.
            </span>
            <h1 className="mt-5 font-outfit text-[42px] font-bold leading-[1.05] tracking-[-1px] text-text-primary sm:text-[52px]">
              Find the right talent, faster with <span className="text-accent">Canvett</span>
            </h1>
            <p className="mt-5 max-w-[460px] text-[15px] leading-[1.65] text-text-muted">
              Canvett is an AI-powered recruitment platform that helps organisations find, rank and hire the best candidates. Smarter tools, fairer decisions, better teams.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/register" className="group inline-flex h-12 items-center gap-2 rounded-btn bg-accent-2 px-6 text-[14.5px] font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">
                Get started <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#features" className="inline-flex h-12 items-center rounded-btn border border-border-strong px-6 text-[14.5px] font-semibold text-text-body transition-colors hover:bg-bg-subtle">Learn more</a>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-text-body">
              {['AI-powered matching', 'Explainable results', 'Built for Ghana'].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-accent-2"><Check size={12} strokeWidth={3} className="text-white" /></span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* dashboard mockup */}
          <div className="relative hidden md:block" aria-hidden="true">
            <div className="overflow-hidden rounded-[16px] border border-border bg-bg-surface shadow-2xl shadow-black/20">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-text-hint/40" /><span className="h-2.5 w-2.5 rounded-full bg-text-hint/40" /><span className="h-2.5 w-2.5 rounded-full bg-text-hint/40" />
              </div>
              <div className="flex">
                <div className="hidden w-[118px] shrink-0 border-r border-border p-3 text-[11px] text-text-muted lg:block">
                  <div className="mb-3 flex items-center gap-1.5 font-semibold text-text-primary"><LayoutGrid size={13} className="text-accent" /> Canvett</div>
                  {[['Home', HomeIcon, true], ['Job Postings', Briefcase], ['Candidates', Users], ['Applications', FileText], ['Settings', SettingsIcon]].map(([l, Ic, active]) => (
                    <div key={l} className={'mb-1 flex items-center gap-1.5 rounded-md px-2 py-1.5 ' + (active ? 'bg-accent-2/15 text-accent' : 'text-text-muted')}><Ic size={12} /> {l}</div>
                  ))}
                </div>
                <div className="flex-1 p-3.5">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 flex-1 items-center gap-1.5 rounded-md border border-border bg-bg-subtle px-2 text-[10px] text-text-hint"><Search size={11} /> Search candidates or postings…</div>
                    <Bell size={13} className="text-text-hint" />
                    <span className="h-5 w-5 rounded-full bg-avatar-bg" />
                  </div>
                  {/* blue rank card + donut */}
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
                  {/* stat tiles */}
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {[['Active postings', '3'], ['Total applicants', '12'], ['Resumes ranked', '12']].map(([l, v]) => (
                      <div key={l} className="rounded-lg border border-border bg-bg-subtle p-2">
                        <div className="text-[8.5px] text-text-muted">{l}</div>
                        <div className="text-[15px] font-semibold text-text-primary">{v}</div>
                      </div>
                    ))}
                  </div>
                  {/* recent postings */}
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
            {/* floating top-candidate card */}
            <div className="absolute -right-3 -bottom-4 w-[180px] rounded-[12px] border border-border bg-bg-surface p-3 shadow-2xl shadow-black/25">
              <div className="mb-2 text-[9.5px] font-semibold text-text-muted">Top candidate</div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-avatar-bg text-[10px] font-semibold text-avatar-text">KM</span>
                <div className="flex-1"><div className="text-[11px] font-semibold text-text-primary">Kwame Mensah</div><div className="text-[9px] text-text-muted">Software Engineer</div></div>
                <span className="rounded-full bg-success-tint px-1.5 py-0.5 text-[9px] font-semibold text-success-text">100%</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* ===== Why Canvett (below the fold) ===== */}
      <section id="features" className="relative z-10 border-t border-border bg-bg-surface/60">
        <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-accent">Why Canvett</p>
          <h2 className="mt-2 font-outfit text-[30px] font-bold tracking-[-0.5px] text-text-primary">Everything you need to hire smarter</h2>
          <div className="mt-10 flex flex-wrap gap-8">
            <FeatureCard icon={<Sparkles size={20} />} title="AI-Powered Matching">Find candidates that actually fit your roles using semantic similarity and embeddings.</FeatureCard>
            <FeatureCard icon={<Eye size={20} />} title="Explainable Results">See clear skill, experience and education breakdowns for every candidate.</FeatureCard>
            <FeatureCard icon={<SlidersHorizontal size={20} />} title="Customisable Weights">Adjust hiring criteria to match your organisation's priorities, for every role.</FeatureCard>
            <FeatureCard icon={<ShieldCheck size={20} />} title="Secure & Reliable">Your data stays protected with industry best practices and secure hosting.</FeatureCard>
            <FeatureCard icon={<Users size={20} />} title="Built for Ghana">Designed with local context and the Ghanaian job market in mind.</FeatureCard>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="rounded-[16px] border border-border bg-bg-surface p-6">
              <div className="grid grid-cols-3 gap-4">
                {[['Explainable', 'Transparent score breakdowns'], ['Configurable', 'Weighting you control'], ['Local', 'For the Ghanaian market']].map(([h, s]) => (
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
              <h3 className="font-outfit text-[20px] font-bold text-text-primary">How it works</h3>
              <p className="mt-1 text-[13px] text-text-muted">Get from job posting to hired, in a few simple steps.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-4">
                <Step n="1" title="Create a job">Add the role, description and requirements.</Step>
                <Step n="2" title="Review candidates">AI matches and ranks the best fits.</Step>
                <Step n="3" title="Make a decision">View detailed insights and compare.</Step>
                <Step n="4" title="Hire with confidence" last>Bring the right person on board.</Step>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-5 rounded-[18px] border border-border bg-accent-2/[0.06] p-8 text-center sm:flex-row sm:text-left">
            <div>
              <h3 className="font-outfit text-[22px] font-bold text-text-primary">Ready to hire smarter?</h3>
              <p className="mt-1.5 text-[13.5px] text-text-muted">Create your account and rank your first shortlist in minutes.</p>
            </div>
            <Link to="/register" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-btn bg-accent-2 px-7 text-[14.5px] font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">
              Get started <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="relative z-10 border-t border-border px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <nav className="flex items-center gap-5 text-[13px] text-text-muted">
            <Link to="/" className="transition-colors hover:text-text-primary">Home</Link>
            <Link to="/about" className="transition-colors hover:text-text-primary">About</Link>
            <Link to="/privacy" className="transition-colors hover:text-text-primary">Privacy</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-text-primary">Contact</a>
          </nav>
          <p className="text-[12px] text-text-hint">&copy; {new Date().getFullYear()} Canvett</p>
        </div>
      </footer>
    </div>
  )
}
