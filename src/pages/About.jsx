import { useState } from 'react'
import PublicPage from './PublicPage'

function IconCircle({ tint = 'bg-accent-tint', color = 'text-accent', children }) {
  return (
    <div className={`mb-4 flex h-13 w-13 items-center justify-center rounded-[14px] ${tint} ${color}`}
      style={{ height: '52px', width: '52px' }}>
      {children}
    </div>
  )
}

const VALUES = [
  {
    title: 'Integrity', tint: 'bg-accent-tint', color: 'text-accent',
    body: 'Honest, transparent, and explainable by design.',
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
  },
  {
    title: 'Innovation', tint: 'bg-success-tint', color: 'text-success',
    body: 'Using modern NLP to solve a real, everyday problem.',
    icon: <><path d="M9 18h6M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z" /></>,
  },
  {
    title: 'Inclusion', tint: 'bg-purple-tint', color: 'text-purple-text',
    body: 'Fairer access to opportunity for every applicant.',
    icon: <><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3-5 7-5s7 1.7 7 5" /><circle cx="18" cy="9" r="2.2" /><path d="M16 20c0-2.4 1-4 4-4" /></>,
  },
  {
    title: 'Impact', tint: 'bg-warning-tint', color: 'text-score-amber',
    body: 'Helping build stronger teams and better careers.',
    icon: <><path d="M3 17l6-6 4 4 7-7" /><path d="M17 5h4v4" /></>,
  },
]

const CHECKS = [
  'Reads CVs and matches on meaning, not just keywords',
  'Transparent scoring with an explainable breakdown',
  'Simple and quick, and the decision stays with you',
  'Built with the Ghanaian job market in mind',
]

const CANDIDATES = [
  ['Kofi Asante', 'Backend Engineer', '98%', 'text-success bg-success-tint'],
  ['Ama Yeboah', 'Full-Stack Developer', '92%', 'text-success bg-success-tint'],
  ['Emmanuel Boakye', 'Frontend Developer', '88%', 'text-accent bg-accent-tint'],
  ['Sarah Lartey', 'Marketing Specialist', '84%', 'text-score-amber bg-warning-tint'],
]

const S = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" {...props} />
)

// Hero visual: shows /about-hero.jpg (drop a photo into the app's public/
// folder) with the "Better matches" + logo cards floating on top. If no image
// is present, it falls back to the soft gradient shape so nothing looks broken.
function HeroArt() {
  const [imgOk, setImgOk] = useState(true)
  return (
    <div className="relative hidden h-[340px] md:block">
      {imgOk ? (
        <img
          src="/about-hero.jpg"
          alt="A recruiter reviewing candidates on a laptop"
          onError={() => setImgOk(false)}
          className="absolute inset-[6%_0_6%_6%] object-cover shadow-[0_22px_50px_rgba(20,40,80,0.20)]"
          style={{ borderRadius: '44% 56% 58% 42% / 52% 46% 54% 48%' }}
        />
      ) : (
        <div
          className="absolute inset-[8%_0_8%_6%] bg-gradient-to-br from-[#DCE7F5] to-[#C9B8F0]"
          style={{ borderRadius: '44% 56% 58% 42% / 52% 46% 54% 48%' }}
        />
      )}
      <div className="absolute left-[2%] top-5 flex items-center gap-2.5 rounded-[14px] border border-border bg-bg-surface px-3.5 py-3 shadow-[0_18px_40px_rgba(20,40,80,0.16)]">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-tint text-accent">
          <S width="16" height="16"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></S>
        </span>
        <div>
          <div className="text-[12.5px] font-semibold text-text-primary">Better matches</div>
          <div className="text-[11px] text-text-muted">Greater opportunities</div>
        </div>
      </div>
      <div className="absolute bottom-7 right-[2%] flex items-center gap-2 rounded-[14px] border border-border bg-bg-surface px-3.5 py-2.5 shadow-[0_18px_40px_rgba(20,40,80,0.16)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-accent">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <rect x="8" y="8" width="5" height="7" rx="1.5" fill="white" fillOpacity="0.9" />
            <rect x="15" y="8" width="5" height="4" rx="1.5" fill="white" fillOpacity="0.6" />
            <rect x="15" y="14" width="5" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
            <rect x="8" y="17" width="5" height="3" rx="1.5" fill="white" fillOpacity="0.6" />
          </svg>
        </span>
        <span className="font-outfit text-[15px] font-bold text-text-primary">Can<span className="text-accent">vett</span></span>
      </div>
    </div>
  )
}

export default function About() {
  return (
    <PublicPage>
      {/* hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent">About Canvett</p>
          <h1 className="mt-3.5 font-outfit text-[38px] font-bold leading-[1.06] tracking-[-0.5px] text-text-primary md:text-[46px]">
            Smarter hiring<br />for a stronger future
          </h1>
          <p className="mt-4 max-w-lg text-[15.5px] leading-[1.7] text-text-muted">
            Canvett is an AI-powered recruitment decision support system designed to help
            organisations in Ghana and beyond find the right talent, faster and more fairly.
            We combine natural language processing, intelligent matching and explainable
            results to make recruitment simple, transparent and effective.
          </p>
        </div>
        <HeroArt />
      </section>

      {/* mission / vision */}
      <div className="border-y border-border bg-bg-surface">
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-14 md:grid-cols-2">
          <div>
            <IconCircle>
              <S width="24" height="24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></S>
            </IconCircle>
            <h2 className="font-outfit text-[26px] font-bold tracking-[-0.3px] text-text-primary">Our Mission</h2>
            <p className="mt-2.5 text-[14.5px] leading-[1.7] text-text-body">
              To give recruiters intelligent tools that connect them with the right talent,
              while giving job seekers fairer, more transparent access to opportunities through technology.
            </p>
          </div>
          <div className="md:border-l md:border-border md:pl-12">
            <IconCircle>
              <S width="24" height="24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></S>
            </IconCircle>
            <h2 className="font-outfit text-[26px] font-bold tracking-[-0.3px] text-text-primary">Our Vision</h2>
            <p className="mt-2.5 text-[14.5px] leading-[1.7] text-text-body">
              To become a trusted recruitment platform in Ghana and across Africa, known for
              fairness, transparency, and the successful careers it helps build.
            </p>
          </div>
        </section>
      </div>

      {/* values */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent">Our values</p>
        <h2 className="mt-2 font-outfit text-[26px] font-bold tracking-[-0.3px] text-text-primary">What drives us</h2>
        <p className="mt-1.5 text-[13.5px] text-text-muted">The principles behind how Canvett is built.</p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-[16px] border border-border bg-bg-surface p-5">
              <div className={`mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl ${v.tint} ${v.color}`}>
                <S width="22" height="22">{v.icon}</S>
              </div>
              <h3 className="font-outfit text-[16px] font-bold text-text-primary">{v.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-[1.55] text-text-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* why */}
      <div className="border-y border-border bg-bg-surface">
        <section className="mx-auto grid max-w-6xl items-center gap-11 px-6 py-14 md:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[16px] border border-border bg-bg-page p-3.5 shadow-[0_20px_50px_rgba(20,40,80,0.10)]">
            <div className="mb-2.5 px-1 font-outfit text-[13px] font-bold text-text-primary">Top candidates</div>
            {CANDIDATES.map(([name, role, score, pill]) => (
              <div key={name} className="mb-2 flex items-center justify-between rounded-[10px] bg-bg-subtle px-2.5 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="h-6.5 w-6.5 rounded-full bg-accent-light" style={{ height: '26px', width: '26px' }} />
                  <div>
                    <div className="text-[12px] font-semibold text-text-primary">{name}</div>
                    <div className="text-[10.5px] text-text-muted">{role}</div>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-[3px] text-[11px] font-bold ${pill}`}>{score}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent">Why Canvett</p>
            <h2 className="mt-2 font-outfit text-[26px] font-bold tracking-[-0.3px] text-text-primary">More than a keyword search</h2>
            <p className="mt-3 text-[14.5px] leading-[1.7] text-text-body">
              Canvett doesn't just filter for words. It reads a CV the way a person would,
              weighs skills, experience and education, and shows its working.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              {CHECKS.map((c) => (
                <div key={c} className="flex items-start gap-2.5 text-[14px] text-text-body">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent">
                    <S width="12" height="12" strokeWidth="3"><path d="M5 12l5 5 9-11" /></S>
                  </span>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* cta */}
      <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4.5" style={{ gap: '18px' }}>
          <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent" style={{ height: '52px', width: '52px' }}>
            <S width="24" height="24"><path d="M4 22V4M4 4h13l-2 4 2 4H4" /></S>
          </span>
          <div>
            <h3 className="font-outfit text-[20px] font-bold text-text-primary">Built for Ghana, for a better tomorrow</h3>
            <p className="mt-1.5 max-w-xl text-[13px] leading-[1.6] text-text-muted">
              When the right people find the right opportunities, everyone wins. That's the point
              of Canvett, a final-year thesis project by Quashie Calvin Nunana, University of Ghana.
            </p>
          </div>
        </div>
        <div className="shrink-0 font-outfit text-[26px] font-bold italic leading-[1.05] text-accent-2 md:text-right">
          Better<br />together
        </div>
      </section>
    </PublicPage>
  )
}
