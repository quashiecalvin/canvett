import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight, Check, Sparkles, Eye, SlidersHorizontal, ShieldCheck, Users,
  Bell, Home as HomeIcon, Briefcase, FileText, Settings as SettingsIcon, LayoutGrid,
} from 'lucide-react'
import { setThemeColor, THEME_COLORS } from '../lib/themeColor'

const CONTACT_EMAIL = 'quashiecalvin13@gmail.com'

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#2563EB]">
        <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
          <rect x="8" y="8" width="5" height="7" rx="1.5" fill="white" fillOpacity="0.95" />
          <rect x="15" y="8" width="5" height="4" rx="1.5" fill="white" fillOpacity="0.6" />
          <rect x="15" y="14" width="5" height="6" rx="1.5" fill="white" fillOpacity="0.95" />
          <rect x="8" y="17" width="5" height="3" rx="1.5" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
      <span className="font-outfit text-[20px] font-semibold tracking-[-0.3px] text-white">
        Can<span className="text-[#5b9bf0]">vett</span>
      </span>
    </div>
  )
}

function FeatureCard({ icon, title, children }) {
  return (
    <div className="flex-1 min-w-[180px]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#2563EB] text-white">
        {icon}
      </div>
      <h3 className="text-[16px] font-semibold text-white">{title}</h3>
      <p className="mt-2 text-[13.5px] leading-[1.6] text-white/55">{children}</p>
    </div>
  )
}

function Step({ n, title, children, last }) {
  return (
    <div className="flex items-start gap-3 sm:flex-col sm:items-start sm:gap-0">
      <div className="flex items-center gap-2 sm:mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-[13px] font-semibold text-white">{n}</span>
        {!last && <ArrowRight size={15} className="hidden text-white/25 sm:block" />}
      </div>
      <div>
        <h4 className="text-[14px] font-semibold text-white">{title}</h4>
        <p className="mt-1 text-[12.5px] leading-[1.5] text-white/50">{children}</p>
      </div>
    </div>
  )
}

export default function Landing() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    setThemeColor('#0a1024')
  }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="landing-root min-h-screen w-full overflow-x-hidden text-white"
      style={{ background: 'radial-gradient(1100px 600px at 85% -5%, rgba(37,99,235,0.22), transparent 60%), radial-gradient(900px 600px at -10% 20%, rgba(37,99,235,0.14), transparent 55%), #080e20' }}>
      {/* ---------- Nav ---------- */}
      <header className="relative z-20 mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 md:px-8">
        <Link to="/" aria-label="Canvett home"><Logo /></Link>
        <nav className="hidden items-center gap-8 text-[14px] text-white/70 md:flex">
          <Link to="/" className="text-white hover:text-white">Home</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">Contact</a>
        </nav>
        <div className="flex items-center gap-2.5">
          <Link to="/login" className="inline-flex h-10 items-center rounded-btn border border-white/15 px-4 text-[13.5px] font-medium text-white/90 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light">Log in</Link>
          <Link to="/register" className="inline-flex h-10 items-center rounded-btn bg-[#2563EB] px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">Sign up</Link>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-10 pt-8 md:grid-cols-2 md:px-8 md:pt-14">
        <div>
          <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-[12.5px] font-medium text-white/75">Smarter hiring. Better teams.</span>
          <h1 className="mt-5 font-outfit text-[42px] font-bold leading-[1.05] tracking-[-1px] text-white sm:text-[52px]">
            Find the right talent, faster with <span className="text-[#5b9bf0]">Canvett</span>
          </h1>
          <p className="mt-5 max-w-[460px] text-[15px] leading-[1.65] text-white/60">
            Canvett is an AI-powered recruitment platform that helps organisations find, rank and hire the best candidates. Smarter tools, fairer decisions, better teams.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/register" className="group inline-flex h-12 items-center gap-2 rounded-btn bg-[#2563EB] px-6 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">
              Get started <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#features" className="inline-flex h-12 items-center rounded-btn border border-white/15 px-6 text-[14.5px] font-semibold text-white/90 transition-colors hover:bg-white/5">Learn more</a>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-white/70">
            {['AI-powered matching', 'Explainable results', 'Built for Ghana'].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#2563EB]/90"><Check size={12} strokeWidth={3} /></span>{t}
              </span>
            ))}
          </div>
        </div>

        {/* dashboard mockup */}
        <div className="relative hidden md:block" aria-hidden="true">
          <div className="rounded-[16px] border border-white/10 bg-[#0e1730] shadow-2xl shadow-black/50">
            <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/20" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            </div>
            <div className="flex">
              <div className="w-[120px] shrink-0 border-r border-white/8 p-3 text-[11px] text-white/55">
                <div className="mb-3 flex items-center gap-1.5 font-semibold text-white"><LayoutGrid size={13} className="text-[#5b9bf0]" /> Canvett</div>
                {[['Home', HomeIcon, true], ['Job Postings', Briefcase], ['Candidates', Users], ['Applications', FileText], ['Settings', SettingsIcon]].map(([l, Ic, active]) => (
                  <div key={l} className={'mb-1.5 flex items-center gap-1.5 rounded-md px-2 py-1.5 ' + (active ? 'bg-[#2563EB]/20 text-white' : 'text-white/55')}><Ic size={12} /> {l}</div>
                ))}
              </div>
              <div className="flex-1 p-4">
                <div className="text-[13px] font-semibold text-white">Good morning, Recruiter</div>
                <div className="mb-3 text-[10.5px] text-white/45">Here's what's happening with your hiring.</div>
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {[['Total Jobs', '8'], ['Applications', '142'], ['Shortlisted', '28'], ['Hired', '5']].map(([l, v]) => (
                    <div key={l} className="rounded-lg border border-white/8 bg-white/[0.03] p-2">
                      <div className="text-[9px] text-white/45">{l}</div>
                      <div className="text-[15px] font-semibold text-white">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5">
                  <div className="mb-2 text-[10.5px] font-semibold text-white/80">Recent Job Postings</div>
                  {[['Backend Engineer', '12'], ['Frontend Developer', '20'], ['Marketing Specialist', '8']].map(([r, n]) => (
                    <div key={r} className="mb-1.5 flex items-center justify-between rounded-md bg-white/[0.03] px-2 py-1.5">
                      <span className="text-[10.5px] text-white/80">{r}</span>
                      <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8.5px] text-emerald-300">{n} apps</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* floating match card */}
          <div className="absolute -right-4 bottom-6 w-[210px] rounded-[14px] border border-white/10 bg-[#111c38] p-3.5 shadow-2xl shadow-black/60">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b5d4f4] text-[11px] font-semibold text-[#0c447c]">KA</span>
              <div><div className="text-[11.5px] font-semibold text-white">Kofi Asante</div><div className="text-[9.5px] text-white/45">Backend Engineer</div></div>
            </div>
            <div className="my-2.5 flex items-center justify-between">
              <span className="text-[9.5px] text-white/45">Match Score</span>
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8.5px] text-emerald-300">Rank #1</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#2563EB] text-[13px] font-bold text-white">92%</div>
              <div className="flex-1 space-y-1 text-[9.5px] text-white/60">
                <div className="flex justify-between"><span>Skills</span><span>50%</span></div>
                <div className="flex justify-between"><span>Experience</span><span>30%</span></div>
                <div className="flex justify-between"><span>Education</span><span>20%</span></div>
              </div>
            </div>
            <div className="mt-2.5 rounded-md bg-[#2563EB] py-1.5 text-center text-[10px] font-semibold text-white">View details</div>
          </div>
        </div>
      </section>
      {/* ---------- Features ---------- */}
      <section id="features" className="relative z-10 border-t border-white/8 bg-[#070c1c]/60">
        <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-[#5b9bf0]">Why Canvett</p>
          <h2 className="mt-2 font-outfit text-[30px] font-bold tracking-[-0.5px] text-white">Everything you need to hire smarter</h2>
          <div className="mt-10 flex flex-wrap gap-8">
            <FeatureCard icon={<Sparkles size={20} />} title="AI-Powered Matching">Find candidates that actually fit your roles using semantic similarity and embeddings.</FeatureCard>
            <FeatureCard icon={<Eye size={20} />} title="Explainable Results">See clear skill, experience and education breakdowns for every candidate.</FeatureCard>
            <FeatureCard icon={<SlidersHorizontal size={20} />} title="Customisable Weights">Adjust hiring criteria to match your organisation's priorities, for every role.</FeatureCard>
            <FeatureCard icon={<ShieldCheck size={20} />} title="Secure & Reliable">Your data stays protected with industry best practices and secure hosting.</FeatureCard>
            <FeatureCard icon={<Users size={20} />} title="Built for Ghana">Designed with local context and the Ghanaian job market in mind.</FeatureCard>
          </div>

          {/* highlights + how it works */}
          <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-6">
              <div className="grid grid-cols-3 gap-4">
                {[['Explainable', 'Transparent score breakdowns'], ['Configurable', 'Weighting you control'], ['Local', 'For the Ghanaian market']].map(([h, s]) => (
                  <div key={h}>
                    <div className="font-outfit text-[18px] font-bold text-[#5b9bf0]">{h}</div>
                    <div className="mt-1 text-[11.5px] leading-[1.45] text-white/55">{s}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-white/8 pt-4 text-[12.5px] text-white/50">
                <ShieldCheck size={15} className="text-[#5b9bf0]" /> Transparent, explainable AI for fairer hiring.
              </div>
            </div>

            <div>
              <h3 className="font-outfit text-[20px] font-bold text-white">How it works</h3>
              <p className="mt-1 text-[13px] text-white/50">Get from job posting to hired, in a few simple steps.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-4">
                <Step n="1" title="Create a job">Add the role, description and requirements.</Step>
                <Step n="2" title="Review candidates">AI matches and ranks the best fits.</Step>
                <Step n="3" title="Make a decision">View detailed insights and compare.</Step>
                <Step n="4" title="Hire with confidence" last>Bring the right person on board.</Step>
              </div>
            </div>
          </div>

          {/* bottom CTA */}
          <div className="mt-16 flex flex-col items-center justify-between gap-5 rounded-[18px] border border-white/10 p-8 text-center sm:flex-row sm:text-left"
            style={{ background: 'linear-gradient(90deg, rgba(37,99,235,0.08), rgba(37,99,235,0.14))' }}>
            <div>
              <h3 className="font-outfit text-[22px] font-bold text-white">Ready to hire smarter?</h3>
              <p className="mt-1.5 text-[13.5px] text-white/60">Create your account and rank your first shortlist in minutes.</p>
            </div>
            <Link to="/register" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-btn bg-[#2563EB] px-7 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30">
              Get started <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="relative z-10 border-t border-white/8 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <nav className="flex items-center gap-5 text-[13px] text-white/55">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">Contact</a>
          </nav>
          <p className="text-[12px] text-white/35">&copy; {new Date().getFullYear()} Canvett</p>
        </div>
      </footer>
    </div>
  )
}
