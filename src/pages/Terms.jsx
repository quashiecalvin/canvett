import PublicPage from './PublicPage'

const CONTACT = 'quashiecalvin13@gmail.com'

function Section({ n, title, children }) {
  return (
    <div id={`t${n}`} className="mb-8">
      <h2 className="mb-2 font-outfit text-[20px] font-bold text-text-primary">{n}. {title}</h2>
      <div className="text-[14px] leading-[1.7] text-text-body space-y-2">{children}</div>
    </div>
  )
}

export default function Terms() {
  return (
    <PublicPage>
      <div className="bg-gradient-to-b from-accent-tint to-transparent">
        <section className="mx-auto max-w-3xl px-6 py-14">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent">Terms</p>
          <h1 className="mt-3 font-outfit text-[34px] font-bold leading-[1.05] tracking-[-0.5px] text-text-primary md:text-[42px]">
            Terms of Use
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-[1.7] text-text-muted">
            These terms govern your use of Canvett. By creating an account or using the platform,
            you agree to them.
          </p>
          <p className="mt-4 text-[12.5px] text-text-muted">Last updated: September 2026</p>
        </section>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <Section n={1} title="Using Canvett">
          <p>Canvett is an AI-assisted recruitment platform that lets job seekers apply to roles and
          recruiters rank and vet candidates. You agree to use it lawfully and to provide accurate
          information about yourself.</p>
        </Section>
        <Section n={2} title="Your account">
          <p>You are responsible for keeping your login details secure and for activity on your
          account. Choose a strong password and do not share it.</p>
        </Section>
        <Section n={3} title="Content you provide">
          <p>You keep ownership of the CVs, profile details and job postings you submit. You grant
          Canvett permission to process this content to provide the service — parsing, matching and
          ranking. Recruiters who upload a candidate's CV confirm they have that candidate's consent
          to do so.</p>
        </Section>
        <Section n={4} title="Automated ranking">
          <p>Match scores are generated automatically and are intended as decision support only. The
          final hiring decision rests with the recruiter, not with Canvett.</p>
        </Section>
        <Section n={5} title="Availability">
          <p>Canvett is provided on an "as is" basis as a final-year research project. We aim to keep
          it available and accurate but cannot guarantee uninterrupted or error-free operation.</p>
        </Section>
        <Section n={6} title="Privacy">
          <p>Our handling of personal data is described in the Privacy Policy, which forms part of
          these terms and reflects Ghana's Data Protection Act, 2012 (Act 843).</p>
        </Section>
        <Section n={7} title="Contact">
          <p>Questions about these terms? Email{' '}
            <a href={`mailto:${CONTACT}`} className="font-semibold text-accent hover:underline">{CONTACT}</a>.
          </p>
        </Section>
      </div>
    </PublicPage>
  )
}
