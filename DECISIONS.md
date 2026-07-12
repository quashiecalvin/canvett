# Canvett — Engineering Decisions Log

A record of the significant design decisions taken while building Canvett, the reasoning behind each, and the trade-offs accepted. This documents the *final* state of each decision.

---

## 1. Scoring Engine

### 1.1 Hybrid skill matching (exact match + semantic fallback)

**Decision.** A required skill is counted as matched if it appears verbatim in the resume text (case-insensitive). If it does not, the system falls back to semantic comparison against individual lines of the resume, counting the skill as matched if the best line clears a similarity threshold of 0.5.

**Reasoning.** Comparing a single short skill (e.g. "React") against an entire resume produced almost no signal: the specific mention was diluted by hundreds of unrelated words, so the similarity fell below any usable threshold and every skill came back unmatched. This is a granularity problem — comparing objects of very different sizes gives poor results.

The exact-match check handles the common case reliably, since technical skills are usually stated as precise terms. The semantic fallback against smaller chunks catches near-misses that exact matching would wrongly reject (for example, a resume saying "Postgres" against a requirement for "PostgreSQL").

**Trade-off.** The threshold (0.5) is a tunable parameter. Too high and genuine near-misses are missed; too low and unrelated skills are wrongly matched.

### 1.2 Section segmentation of the resume

**Decision.** Before scoring, the resume text is segmented into sections (experience, education, skills, projects) by detecting section headings. Headings are recognised by matching lines against a keyword list, ignoring any line longer than 40 characters.

**Reasoning.** The experience and education dimensions should measure the relevant part of a candidate's background, not the whole document. Segmentation makes it possible to compare the experience section against experience requirements and the education section against education requirements.

The 40-character guard distinguishes real headings (short) from body text (long), reducing false positives.

**Trade-off.** Segmentation depends on resumes using recognisable section headings. Resumes with unconventional or missing headings fall back to whole-document comparison.

### 1.3 Best-line matching rather than whole-section comparison

**Decision.** The experience and education dimensions are scored by comparing the requirement against *every line* of the relevant section and taking the **highest** similarity, rather than comparing the requirement against the section as a single block.

**Reasoning.** Even after segmentation, comparing a requirement against a whole section still diluted the signal. An experience section contains job titles, company names, dates, and multiple bullet points; a candidate's single strongest, most relevant statement was averaged away among all the surrounding text.

Testing made this concrete: a candidate whose experience section contained "5 years building responsive web applications" scored only moderately against a matching requirement, because that one strong line was buried among unrelated content. Matching against the single best line removes the dilution and lets the candidate's strongest relevant claim carry the score.

**Trade-off.** The score reflects the candidate's best matching statement rather than the overall breadth of their section. This is appropriate for answering "does this candidate have relevant experience?" but does not reward depth across many entries.

### 1.4 Score calibration

**Decision.** Raw cosine similarity values are rescaled to a 0–100 range using a linear calibration with a floor of 0.2 and a ceiling of 0.65. Values at or below the floor map to 0; values at or above the ceiling map to 100; values in between are scaled proportionally.

**Reasoning.** Cosine similarity between related-but-not-identical text does not spread across the full 0–1 range. In practice, similarity for resume–requirement pairs sits in a narrow band roughly between 0.25 and 0.7, with values above 0.75 essentially requiring near-identical wording.

This meant that a genuinely strong match would produce a raw score of around 0.5, which — presented directly as "50%" — reads to a human as a mediocre result when the model actually considers it a strong signal. Calibration stretches the meaningful band across the interpretable 0–100 range so the numbers align with human intuition.

**Trade-off.** The floor and ceiling are tunable parameters chosen against observed similarity distributions. They affect the absolute numbers presented, though not the relative ordering of candidates.

### 1.5 Dedicated experience and education requirement fields on jobs

**Decision.** Each job posting carries two dedicated fields — `experience_requirement` and `education_requirement` — in addition to the general job description. The experience dimension is scored against the experience requirement, and the education dimension against the education requirement.

**Reasoning.** Originally both dimensions were scored against the whole job description, which produced misleading results for education in particular. A job description describes day-to-day work (technologies, responsibilities), while an education section describes qualifications. The two share little vocabulary even when the qualification is entirely appropriate for the role, so a well-matched degree scored low simply because "Bachelor of Science in Information Technology" does not textually resemble "build responsive web interfaces with React."

Comparing education against a stated educational requirement ("BSc in Computer Science, Information Technology, or a related field") is a like-for-like comparison and produces sensible results. The same reasoning applies to experience.

**Trade-off.** Recruiters must supply these fields when creating a job. For backward compatibility, jobs without them fall back to comparing against the general job description.

### 1.6 Weighted overall score

**Decision.** The overall match score is a weighted blend: skills 50%, experience 30%, education 20%.

**Reasoning.** Skills matching is the most concrete and reliable dimension — it is a direct, verifiable check of whether the candidate has what the role requires — so it carries the greatest weight. Experience is the next strongest signal of fit. Education is weighted lowest, as it is typically a baseline qualification rather than a differentiator between candidates.

**Trade-off.** The weights are an explicit design choice rather than a learned parameter. They are stated openly so a recruiter can understand and challenge how an overall score was composed, which supports the system's explainability goal.

---

## 2. Experience Duration — the Central Limitation and its Solution

### 2.1 The problem: semantic similarity is blind to magnitude

**Finding.** Controlled testing revealed a significant limitation. A candidate with six months of experience, tested against a requirement of two years, received an experience score of approximately 100%. Raising the requirement to 1.5 years, then 2 years, did not change the result.

The cause is fundamental to the approach: embedding-based semantic similarity measures **topical relatedness**, not **numerical or logical satisfaction**. The model sees "6 months building web applications with React" and "2+ years building web applications with React" as nearly identical in meaning — same domain, same technologies. It has no concept that six months is less than two years; the durations are simply tokens, and no arithmetic or comparison is performed.

This is the same class of problem that affects education: the model cannot reason that a BSc in Information Technology *satisfies* a requirement for a BSc in Computer Science or a related field. Semantic models measure resemblance, not requirement satisfaction.

### 2.2 The solution: structured duration extraction via a standard CV template

**Decision.** The system extracts experience durations from date ranges in the resume (e.g. "January 2023 - March 2025", "June 2025 - Present"), sums them, and compares the total against a duration parsed from the job's experience requirement. To make this reliable, applicants are asked to follow a **standard CV template** which mandates a date range on every experience and education entry, in the format `Month Year - Month Year` (or `Month Year - Present`).

**Reasoning.** Duration extraction from free-form resumes is unreliable precisely because resumes are unstructured and inconsistent. Imposing a template converts an unstructured-extraction problem (fragile) into a structured-parsing problem (tractable).

This is not a workaround but a recognised industry practice: applicant tracking systems and job platforms routinely impose structure on submissions precisely so that information can be extracted reliably. The template is provided to applicants as a completed example CV with dummy data, rather than a blank skeleton, because people reproduce a working pattern more reliably than they follow written instructions.

**Trade-off.** The system depends on applicant compliance with the template, which is an organisational rather than a technical control.

### 2.3 Blending relevance with duration

**Decision.** When both the candidate's total experience and the required duration can be extracted, the experience score is:

```
experience_score = relevance × min(candidate_years / required_years, 1.0)
```

**Reasoning.** The score should reflect *both* whether the candidate's experience is topically relevant *and* whether they have enough of it. Multiplying relevance by the proportion of the requirement met achieves this: a candidate who is topically perfect but has only half the required duration receives half the relevance score.

The ratio is capped at 1.0 so that exceeding the requirement earns full credit but does not inflate the score beyond it — meeting the bar is what matters, and a candidate with ten years should not out-score one with three when the requirement is two.

A proportional reduction was chosen over a hard cut-off, which would be unduly harsh: a candidate with 1.8 years against a 2-year requirement is nearly qualified and should not be reduced to zero.

### 2.4 Handling non-compliant CVs: flag rather than gate

**Decision.** When a duration cannot be extracted, the system does not reject or zero the candidate. It falls back to a relevance-based score, applies a conservative discount factor of 0.7, and sets a `duration_verified` flag to false. This flag is surfaced in the interface as a visible warning next to the candidate's experience score.

**Reasoning.** Two competing fairness concerns had to be balanced.

Enforcing the template strictly (heavily penalising non-compliance) risks excluding strong candidates for administrative reasons — precisely the failure mode this project criticises, where automated screening tools wrongly exclude qualified applicants.

Excusing non-compliance entirely (falling back to pure relevance with no adjustment) proved to be worse. In testing, a candidate whose CV could not be parsed scored *higher* on experience than a properly templated candidate who was honestly penalised for having less than the required duration. This creates a perverse incentive: ignoring the template would be rewarded, making compliance irrational and unfair to those who followed it.

The chosen middle path resolves this. A modest 0.7 discount ensures that an unverified candidate cannot out-score a verified and fully-qualified one, removing the perverse incentive, while remaining far from punitive. The visible flag means the system neither silently punishes nor silently excuses: it surfaces the ambiguity to the recruiter, who makes the human judgement. This is consistent with the project's positioning as a decision-support tool rather than a decision-maker.

**Trade-off.** The discount factor (0.7) is an explicit, tunable parameter representing a conservative assumption in the absence of verifiable information.

### 2.5 Documented limitation: verification detects presence, not completeness

**Limitation.** The `duration_verified` flag indicates that *at least one* parseable date range was found in the experience section. It does not confirm that *every* entry was dated. A CV in which only one of three roles carries a date range will be treated as verified, and its extracted duration will understate the candidate's true experience.

**Why this was not "fixed."** Detecting full template compliance would require determining how many distinct role entries exist in the section — which, in extracted plain text (where formatting such as bold is lost), can only be done by guessing at document structure with rules such as "a short capitalised line is probably a job title." Such rules are fragile: they work on the resumes they were tested against and misfire on formats not anticipated, producing false flags.

A false flag is worse than no flag. Telling a recruiter that a compliant CV failed the template — or that a non-compliant one passed — actively misleads the person making the decision, and reintroduces the unfair-exclusion problem the system is designed to reduce.

There is a deliberate irony worth noting: the template was adopted specifically to *escape* fragile free-text parsing. Building heuristics to detect template violations would reintroduce exactly the fragility it was meant to eliminate.

**Mitigation.** The extraction rule used is deliberately robust and unambiguous — it searches for a well-defined date pattern, which is either present or absent, and never guesses at structure. The residual gap is addressed organisationally: recruiters are advised to communicate and emphasise strict adherence to the template at the point of application.

---

## 3. System Architecture

### 3.1 Counts computed live rather than cached

**Decision.** A job's applicant and ranked counts are computed from the database each time jobs are fetched, rather than being stored and incremented.

**Reasoning.** A cached counter must be kept in sync with reality on every insert and delete, and drifts out of sync as soon as any code path forgets to update it. Deriving the count from the source data means it can never be wrong.

**Trade-off.** A small additional query per job on each fetch, which is negligible at this scale.

### 3.2 React Context for shared job selection

**Decision.** The currently selected job is held in a React Context provider, so the Upload and Ranking screens share a single selection.

**Reasoning.** A recruiter works on one job at a time. Selecting a job on one screen and having it reflected on another matches that mental model. Context avoids passing the selection down through every intermediate component.

### 3.3 A single form component for both create and edit

**Decision.** The job form is one component that operates in create or edit mode depending on whether an existing job is passed to it.

**Reasoning.** The two forms require identical fields. Maintaining two near-identical components would mean every future change to the job schema must be made twice, with the risk of them diverging.

### 3.4 Client-side CSV export

**Decision.** The ranking export is generated in the browser from data already loaded on the page, rather than by a backend endpoint.

**Reasoning.** The ranking data is already present in the client. Generating the file there avoids an unnecessary round-trip and keeps the export logic simple.

### 3.5 Explicit cascade on delete

**Decision.** Deleting a job explicitly removes its dependent scores and candidates before removing the job itself. Deleting a candidate removes its score first.

**Reasoning.** Dependent records hold foreign keys to their parent. Removing them explicitly, in order, respects referential integrity and makes the deletion behaviour visible in the code rather than relying on implicit database configuration.

---

## 4. Deferred Work and Known Limitations

The following were consciously scoped out rather than overlooked:

- **Time-based statistical comparisons** (e.g. "2 more postings this week", "6% higher than last month"). These require time-series tracking — timestamp columns on candidates and scores, and date-range queries. Presenting such figures without the underlying data would have meant displaying values that were not genuinely computed.

- **Candidate detail view and shortlisting.** Both require additional interface and persistence work for modest benefit relative to the core ranking workflow.

- **Role and years-of-experience extraction for display on candidate cards.** The card currently shows the source filename, which serves as traceability back to the uploaded document.

- **Analytics and settings screens.** These fall outside the scope defined for the project, which centres on the ranking workflow: create a posting, upload resumes, review an explainable ranking.
