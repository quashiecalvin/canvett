import PublicPage from './PublicPage'

const S = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" {...props} />
)

const CONTACT = 'quashiecalvin13@gmail.com'

function Bullets({ items }) {
  return (
    <ul className="mt-1.5 space-y-1.5">
      {items.map((t) => (
        <li key={t} className="relative pl-4 text-[13.5px] leading-[1.6] text-text-body">
          <span className="absolute left-0 top-[9px] h-[5px] w-[5px] rounded-full bg-accent" />
          {t}
        </li>
      ))}
    </ul>
  )
}

function Section({ n, title, icon, children }) {
  return (
    <div id={`s${n}`} className="mb-9 flex gap-4.5" style={{ gap: '18px' }}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-tint text-accent">
        <S width="20" height="20">{icon}</S>
      </span>
      <div>
        <h2 className="mb-1 font-outfit text-[20px] font-bold text-text-primary">{n}. {title}</h2>
        {children}
      </div>
    </div>
  )
}

const NAV = [
  'Information we collect',
  'How we use it',
  'How we share it',
  'Data security',
  'Your rights',
  'Ghana Data Protection Act',
  'Changes to this policy',
]

export default function Privacy() {
  return (
    <PublicPage>
      {/* hero */}
      <div className="bg-gradient-to-b from-accent-tint to-transparent">
        <section className="mx-auto grid max-w-6xl items-center gap-9 px-6 py-14 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent">Privacy</p>
            <h1 className="mt-3 font-outfit text-[34px] font-bold leading-[1.05] tracking-[-0.5px] text-text-primary md:text-[44px]">
              Your privacy<br />matters to us
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-text-muted">
              This Privacy Policy explains how Canvett collects, uses, protects and shares
              your information. We are committed to keeping your data safe and being
              transparent about how it is used.
            </p>
            <div className="mt-5.5 inline-flex items-center gap-2 text-[12.5px] text-text-muted" style={{ marginTop: '22px' }}>
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-md bg-purple-tint text-purple-text" style={{ height: '22px', width: '22px' }}>
                <S width="13" height="13"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></S>
              </span>
              Last updated: September 2026
            </div>
          </div>
          <div className="relative hidden h-[300px] items-center justify-center md:flex">
            <div className="absolute right-[4%] top-[8%] h-[250px] w-[300px]"
              style={{ background: 'radial-gradient(circle at 45% 42%, rgba(124,111,224,.22), transparent 62%)', borderRadius: '46% 54% 60% 40% / 54% 42% 58% 46%' }} />
            <svg className="absolute text-purple-text" width="360" height="290" viewBox="0 0 360 290" fill="none" aria-hidden="true">
              <g transform="rotate(-16 180 145)">
                <ellipse cx="180" cy="145" rx="164" ry="112" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.4" />
                <circle cx="64" cy="66" r="5.5" fill="currentColor" />
                <circle cx="296" cy="224" r="5.5" fill="currentColor" />
              </g>
            </svg>
            <svg width="150" height="170" viewBox="0 0 150 170" className="relative drop-shadow-[0_24px_40px_rgba(90,70,180,0.35)]">
              <defs><linearGradient id="pvg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8B7BE8" /><stop offset="1" stopColor="#5C46B4" /></linearGradient></defs>
              <path d="M75 6 138 30v52c0 46-63 80-63 80S12 128 12 82V30Z" fill="url(#pvg)" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
              <rect x="58" y="78" width="34" height="28" rx="5" fill="#fff" />
              <path d="M63 78v-8a12 12 0 0 1 24 0v8" stroke="#fff" strokeWidth="6" fill="none" />
              <circle cx="75" cy="90" r="4.5" fill="#5C46B4" />
            </svg>
            {[
              { c: 'top-5 right-[2%]', t: 'Your data is safe', i: <><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></> },
              { c: 'top-[44%] right-[-2%]', t: 'Transparent practices', i: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></> },
              { c: 'bottom-6 right-[6%]', t: "You're in control", i: <><path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7Z" /><path d="M9 12l2 2 4-4" /></> },
            ].map((chip) => (
              <div key={chip.t} className={`absolute ${chip.c} flex items-center gap-2 rounded-full border border-border bg-bg-surface py-2 pl-2.5 pr-3.5 text-[12px] font-semibold text-text-primary shadow-[0_14px_30px_rgba(20,40,80,0.14)]`}>
                <span className="flex h-5.5 w-5.5 items-center justify-center rounded-md bg-purple-tint text-purple-text" style={{ height: '22px', width: '22px' }}>
                  <S width="12" height="12">{chip.i}</S>
                </span>
                {chip.t}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* body */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1fr_300px]">
        <div>
          <Section n={1} title="Information we collect" icon={<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>}>
            <p className="text-[14px] leading-[1.7] text-text-body">We collect information you give us directly, and some that's gathered automatically as you use the platform.</p>
            <p className="mt-3.5 text-[13.5px] font-bold text-text-primary">Information you provide</p>
            <Bullets items={['Account details: your name, email address and password', 'Profile information: location, skills, and an optional photo', 'Applications: the CV you upload or the form you fill in']} />
            <p className="mt-3.5 text-[13.5px] font-bold text-text-primary">Information collected automatically</p>
            <Bullets items={['Usage data such as the pages you visit and features you use', 'Basic device and browser information', 'Cookies used to keep you signed in']} />
          </Section>

          <Section n={2} title="How we use it" icon={<><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.6a7 7 0 0 0 .1-1Z" /></>}>
            <p className="text-[14px] leading-[1.7] text-text-body">Your information is used to run the service:</p>
            <Bullets items={['Sign you in and maintain your profile', 'Read your CV and match it to a job so recruiters see a score and ranking', 'Keep the platform secure and improve how it works']} />
            <p className="mt-2 text-[14px] leading-[1.7] text-text-body">Scoring is done automatically by the system. The final hiring decision is always made by the recruiter, not the tool.</p>
          </Section>

          <Section n={3} title="How we share it" icon={<><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>}>
            <p className="text-[14px] leading-[1.7] text-text-body">We do not sell your personal information. We share it only when needed to run the service:</p>
            <Bullets items={['With the recruiter for a role you apply to', 'With trusted providers that host or power the platform', 'When required by law']} />
          </Section>

          <Section n={4} title="Data security" icon={<><path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7Z" /><path d="M9 12l2 2 4-4" /></>}>
            <p className="text-[14px] leading-[1.7] text-text-body">We protect your information with standard security measures: encryption in transit, access controls and hashed passwords. No system is ever perfectly secure, but keeping your data safe is a priority.</p>
          </Section>

          <Section n={5} title="Your rights" icon={<><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.4 3-5 6.5-5s6.5 1.6 6.5 5" /><circle cx="18" cy="9" r="2.2" /><path d="M16.5 20c0-2.5 1-4 4-4" /></>}>
            <p className="text-[14px] leading-[1.7] text-text-body">You're in control of your data. You can:</p>
            <Bullets items={['View and edit your profile at any time', 'Delete your account, which removes your account and the application it created', 'Contact us with any question about your data']} />
          </Section>

          <Section n={6} title="Ghana Data Protection Act, 2012" icon={<><path d="M3 6l9-3 9 3" /><path d="M4 10h16v9H4z" /><path d="M9 14h6" /></>}>
            <p className="text-[14px] leading-[1.7] text-text-body">
              Canvett is designed to operate in line with Ghana's Data Protection Act, 2012 (Act 843).
              Under the Act you are a data subject, and you have the right to know what personal data we
              hold about you, to have inaccurate data corrected, and to have your data deleted.
            </p>
            <p className="mt-2 text-[14px] leading-[1.7] text-text-body">
              We process personal data on the basis of your consent and to provide the service you
              request. Where a recruiter uploads a candidate's CV on that candidate's behalf, the
              recruiter is responsible for having obtained that candidate's consent to do so, in keeping
              with the Act. For any request relating to your rights under the Act, contact us at{' '}
              <a href={`mailto:${CONTACT}`} className="font-semibold text-accent hover:underline">{CONTACT}</a>.
            </p>
          </Section>

          <Section n={7} title="Changes to this policy" icon={<><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>}>
            <p className="text-[14px] leading-[1.7] text-text-body">
              We may update this policy from time to time. When we do, we'll post the updated version here with a new date. Questions? Email{' '}
              <a href={`mailto:${CONTACT}`} className="font-semibold text-accent hover:underline">{CONTACT}</a>.
            </p>
          </Section>
        </div>

        {/* sticky aside */}
        <div className="hidden flex-col gap-4 self-start md:sticky md:top-6 md:flex">
          <div className="rounded-[16px] border border-border bg-bg-surface p-4.5" style={{ padding: '18px' }}>
            <h4 className="mb-3 font-outfit text-[14px] font-bold text-text-primary">On this page</h4>
            {NAV.map((label, i) => (
              <a key={label} href={`#s${i + 1}`}
                className={`mb-0.5 flex items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-[13px] transition-colors ${i === 0 ? 'bg-accent-tint font-semibold text-accent' : 'text-text-muted hover:bg-bg-subtle'}`}>
                <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-md text-[11px] font-bold ${i === 0 ? 'bg-accent text-white' : 'bg-bg-subtle text-text-muted'}`}>{i + 1}</span>
                {label}
              </a>
            ))}
          </div>
          <div className="rounded-[16px] border border-border bg-bg-surface p-4.5" style={{ padding: '18px' }}>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[11px] bg-purple-tint text-purple-text">
              <S width="20" height="20"><path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7Z" /></S>
            </div>
            <h4 className="mb-1.5 font-outfit text-[16px] font-bold text-text-primary">Questions?</h4>
            <p className="text-[12.5px] leading-[1.6] text-text-muted">If you have any question about your data or this policy, get in touch.</p>
            <a href={`mailto:${CONTACT}`} className="mt-3.5 flex h-10 items-center justify-center gap-2 rounded-[10px] bg-accent-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover">
              <S width="15" height="15"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></S>
              Contact us
            </a>
          </div>
        </div>
      </div>
    </PublicPage>
  )
}
