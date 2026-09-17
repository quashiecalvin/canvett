import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import FilterDropdown from '../components/ui/FilterDropdown'
import { initialsFromName } from '../lib/initials'
import { scoreToneClass } from '../lib/scoreColor'
import { getRanking, getCandidateDetail, rerankJob, deleteCandidate, updateCandidateStatus } from '../lib/api'
import { useJob } from '../context/JobContext'
import { exportToCsv } from '../lib/csv'
import { RefreshCw, Download, Trash2, ChevronRight, ChevronLeft, ChevronDown, Search, AlertTriangle, Sparkles, Check, FileText, Info, Bookmark, BookmarkCheck, MoreVertical, Filter } from 'lucide-react'

const STATUS_OPTIONS = ['New', 'In review', 'Shortlisted', 'Rejected']
const PAGE_SIZE = 8

const AVATAR_COLORS = ['#3E6FB0', '#2E9E8F', '#7A5CC0', '#C98A2E', '#C05F6E', '#3E9E63', '#4C7FC0', '#A85BB0']
function avatarColor(name) {
  let h = 0
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function Avatar({ name, photo, size = 'w-10 h-10', text = 'text-[12px]' }) {
  if (photo) return <img src={photo} alt={name} className={`${size} rounded-full object-cover shrink-0`} />
  return (
    <div className={`${size} ${text} rounded-full flex items-center justify-center font-semibold text-white shrink-0`} style={{ background: avatarColor(name) }}>
      {initialsFromName(name)}
    </div>
  )
}

function matchLabel(score) {
  if (score >= 85) return 'Excellent match'
  if (score >= 70) return 'Strong match'
  if (score >= 50) return 'Good match'
  return 'Weak match'
}
function barColor(v) { if (v >= 75) return '#185FA5'; if (v >= 50) return '#3D7AC0'; return '#7CA6D4' }
function ringColor(v) { if (v >= 75) return 'var(--color-success)'; if (v >= 50) return 'var(--color-accent)'; return 'var(--color-danger)' }
function bandText(v) { if (v >= 75) return 'text-success'; if (v >= 50) return 'text-accent'; return 'text-danger-text' }
function statusStyle(s) {
  if (s === 'Shortlisted') return 'bg-success-tint text-success-text border-success/40'
  if (s === 'In review') return 'bg-warning-tint text-warning-text border-warning-text/30'
  if (s === 'Rejected') return 'bg-danger-tint text-danger-text border-danger/40'
  return 'bg-bg-subtle text-text-muted border-border-strong'
}
function expLabel(years) {
  if (years == null) return null
  const y = Math.floor(years)
  return y < 1 ? '<1 yr exp' : `${y}+ yrs exp`
}
function metaLine(c) {
  const bits = []
  const e = expLabel(c.years_experience)
  if (e) bits.push(e)
  if (c.location) bits.push(c.location)
  return bits.join(' · ')
}
function inExpBucket(years, bucket) {
  if (bucket === 'All') return true
  if (years == null) return false
  if (bucket === '0–2 yrs') return years <= 2
  if (bucket === '3–5 yrs') return years > 2 && years <= 5
  if (bucket === '5+ yrs') return years > 5
  return true
}

function Donut({ score, size = 46, color = 'var(--color-accent)' }) {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c * (1 - score / 100)
  const mid = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="var(--color-bg-subtle)" strokeWidth={stroke} />
      <circle cx={mid} cy={mid} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${mid} ${mid})`} />
      <text x="50%" y="53%" textAnchor="middle" dominantBaseline="middle"
        fontFamily="'IBM Plex Mono', monospace" fontSize={size * 0.26} fontWeight="600" fill="var(--color-text-primary)">{score}%</text>
    </svg>
  )
}
function Bar({ label, value, thick = false }) {
  const v = Math.round(value)
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-[12px] ${thick ? 'font-semibold text-text-primary' : 'text-text-body'}`}>{label}</span>
        <span className={`text-[12px] font-medium ${thick ? 'text-text-primary' : 'text-text-body'}`}>{v}%</span>
      </div>
      <div className={`${thick ? 'h-3' : 'h-1.5'} rounded-pill bg-bg-subtle overflow-hidden`}>
        <div className="h-full rounded-pill" style={{ width: `${v}%`, background: barColor(v) }} />
      </div>
    </div>
  )
}
function buildSummary(c) {
  const first = c.name.split(' ')[0]
  const dims = [[c.skills_score, 'skills alignment'], [c.experience_score, 'experience'], [c.education_score, 'education']]
  const strong = dims.filter(([v]) => v >= 75).map(([, l]) => l)
  const weak = dims.filter(([v]) => v < 50).map(([, l]) => l)
  const skills = c.matched_skills.slice(0, 4).join(', ')
  let s = `${first} scores ${Math.round(c.overall_score)}% overall for this role`
  if (strong.length) s += `, with strong ${strong.join(' and ')}`
  s += '.'
  if (skills) s += ` Matched on ${skills}.`
  if (weak.length) s += ` Lower on ${weak.join(' and ')}${!c.duration_verified ? ' (experience duration unverified)' : ''}.`
  return s
}
function fitNote(score) {
  if (score >= 80) return 'Strong overall fit for this role.'
  if (score >= 60) return 'Solid fit — worth a closer look.'
  if (score >= 45) return 'Partial fit — review the gaps before proceeding.'
  return 'Limited fit against this role’s requirements.'
}

function RowMenu({ candidate, onStatus, onRemove }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }} title="More"
        className="w-8 h-8 rounded-btn border border-border flex items-center justify-center text-text-muted hover:bg-bg-subtle transition-colors">
        <MoreVertical size={15} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-bg-surface border border-border rounded-card shadow-lg py-1 z-30" onClick={(e) => e.stopPropagation()}>
          <p className="px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-text-hint">Set status</p>
          {STATUS_OPTIONS.map((st) => (
            <button key={st} onClick={() => { onStatus(st); setOpen(false) }}
              className={`flex items-center justify-between w-full text-left px-3 py-2 text-[13px] hover:bg-bg-subtle transition-colors ${candidate.status === st ? 'text-accent font-medium' : 'text-text-body'}`}>
              {st} {candidate.status === st && <Check size={13} />}
            </button>
          ))}
          <div className="my-1 border-t border-border" />
          <button onClick={() => { onRemove(); setOpen(false) }}
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-[13px] text-danger-text hover:bg-danger-tint transition-colors">
            <Trash2 size={14} /> Remove
          </button>
        </div>
      )}
    </div>
  )
}

function FiltersMenu({ statusFilter, setStatusFilter, expFilter, setExpFilter, locFilter, setLocFilter, locNames, activeFilters, onClear }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const rows = [
    ['Status', statusFilter, ['All', ...STATUS_OPTIONS], setStatusFilter],
    ['Experience', expFilter, ['All', '0\u20132 yrs', '3\u20135 yrs', '5+ yrs'], setExpFilter],
    ['Location', locFilter, ['All', ...locNames], setLocFilter],
  ]
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-btn border border-border-strong text-[12.5px] text-text-body hover:bg-bg-subtle transition-colors">
        <Filter size={14} /> Filters
        {activeFilters > 0 && <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-accent text-white text-[10.5px] font-semibold flex items-center justify-center">{activeFilters}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-64 bg-bg-surface border border-border rounded-card shadow-lg p-3 z-30">
          {rows.map(([label, value, options, onChange]) => (
            <div key={label} className="flex items-center justify-between gap-3 py-1.5">
              <span className="text-[12px] text-text-muted">{label}</span>
              <select value={value} onChange={(e) => onChange(e.target.value)}
                className="h-8 rounded-btn border border-border bg-bg-surface text-[12.5px] text-text-body px-2 focus:outline-none focus:border-accent max-w-37.5">
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex justify-end">
            <button onClick={onClear} className="text-[12px] font-medium text-accent hover:underline">Clear all</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CandidateRanking() {
  const { jobs, selectedJobId, selectedJob, setSelectedJobId } = useJob()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('Match score')
  const [statusFilter, setStatusFilter] = useState('All')
  const [expFilter, setExpFilter] = useState('All')
  const [locFilter, setLocFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [tab, setTab] = useState('overview')
  const [notes, setNotes] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const jobParam = searchParams.get('job')
    const candParam = searchParams.get('candidate')
    if (jobParam) setSelectedJobId(Number(jobParam))
    if (candParam) setSelectedId(Number(candParam))
    if (jobParam || candParam) setSearchParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadRanking = useCallback(() => {
    if (!selectedJobId) { setCandidates([]); setLoading(false); return }
    setLoading(true)
    getRanking(selectedJobId)
      .then((data) => {
        setError(null)
        setCandidates(data)
        setLoading(false)
        setSelectedId((cur) => (cur && data.some((d) => d.candidate_id === cur)) ? cur : (data[0]?.candidate_id ?? null))
      })
      .catch((err) => { setError(err.message); setLoading(false) })
  }, [selectedJobId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRanking()
  }, [loadRanking])

  useEffect(() => {
    if (!selectedId) { setDetail(null); return }
    setDetailLoading(true)
    setTab('overview')
    try { setNotes(localStorage.getItem(`canvett_notes_${selectedId}`) || '') } catch { setNotes('') }
    getCandidateDetail(selectedId)
      .then((d) => { setDetail(d); setDetailLoading(false) })
      .catch(() => { setDetail(null); setDetailLoading(false) })
  }, [selectedId])

  useEffect(() => { setPage(1) }, [search, statusFilter, expFilter, locFilter, sortOrder])

  function saveNotes(v) {
    setNotes(v)
    try { localStorage.setItem(`canvett_notes_${selectedId}`, v) } catch { /* ignore */ }
  }
  async function setStatus(id, status) {
    setCandidates((prev) => prev.map((c) => c.candidate_id === id ? { ...c, status } : c))
    try { await updateCandidateStatus(id, status) }
    catch (err) { setError(`Could not update status: ${err.message}`); loadRanking() }
  }
  async function handleRerank() {
    if (!selectedJobId) return
    setLoading(true); setError(null)
    try { await rerankJob(selectedJobId); loadRanking() }
    catch (err) { setError(`Could not re-rank the candidates: ${err.message}`); setLoading(false) }
  }
  async function handleDeleteCandidate(candidateId) {
    if (!confirm('Remove this candidate from the ranking?')) return
    try {
      await deleteCandidate(candidateId)
      if (selectedId === candidateId) setSelectedId(null)
      loadRanking()
    } catch (err) { setError(`Could not remove the candidate: ${err.message}`) }
  }
  function handleExport() {
    const rows = candidates.map((c, i) => ({
      rank: i + 1, name: c.name, filename: c.filename, status: c.status,
      years_experience: c.years_experience ?? '', location: c.location ?? '',
      overall_score: c.overall_score, skills_score: c.skills_score,
      experience_score: c.experience_score, education_score: c.education_score,
      matched_skills: c.matched_skills.join('; '), unmatched_skills: c.unmatched_skills.join('; '),
    }))
    const jobName = selectedJob ? selectedJob.title.replace(/\s+/g, '_') : 'ranking'
    exportToCsv(`${jobName}_ranking.csv`, rows)
  }
  function clearFilters() { setStatusFilter('All'); setExpFilter('All'); setLocFilter('All'); setSearch('') }

  const locNames = Array.from(new Set(candidates.map((c) => c.location).filter(Boolean)))
  const activeFilters = [statusFilter !== 'All', expFilter !== 'All', locFilter !== 'All'].filter(Boolean).length

  const filtered = candidates
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => statusFilter === 'All' || c.status === statusFilter)
    .filter((c) => inExpBucket(c.years_experience, expFilter))
    .filter((c) => locFilter === 'All' || c.location === locFilter)
    .slice()
    .sort((a, b) => {
      if (sortOrder === 'Name A–Z') return a.name.localeCompare(b.name)
      return (
        b.overall_score - a.overall_score ||
        b.skills_score - a.skills_score ||
        b.experience_score - a.experience_score ||
        b.education_score - a.education_score ||
        (b.years_experience ?? -1) - (a.years_experience ?? -1) ||
        a.candidate_id - b.candidate_id
      )
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageC = Math.min(page, totalPages)
  const paged = filtered.slice((pageC - 1) * PAGE_SIZE, pageC * PAGE_SIZE)
  const rangeStart = filtered.length === 0 ? 0 : (pageC - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(pageC * PAGE_SIZE, filtered.length)

  const selected = candidates.find((c) => c.candidate_id === selectedId) || null
  const hasList = candidates.length > 0

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'skills', label: 'Skills Match' },
    { key: 'experience', label: 'Experience' },
    { key: 'resume', label: 'Resume' },
    { key: 'notes', label: 'Notes' },
  ]

  return (
    <div className="p-6">
      <div className={`grid grid-cols-1 gap-5 items-start ${hasList ? 'xl:grid-cols-[1fr_360px]' : ''}`}>
        {/* ── LEFT ── */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[12px] text-text-muted mb-3">
            <Link to="/jobs" className="hover:text-text-body transition-colors">Job Postings</Link>
            <ChevronRight size={13} className="text-text-hint" />
            <span className="text-text-body font-medium">{selectedJob ? selectedJob.title : 'Ranking'}</span>
          </div>

          {jobs.length > 0 && (
            <div className="relative inline-block mb-4">
              <select
                value={selectedJobId ?? ''}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                aria-label="Select a job to view its candidates"
                className="appearance-none h-10 max-w-85 truncate pl-3.5 pr-10 rounded-btn border border-border-strong bg-bg-surface text-[14px] font-medium text-text-primary cursor-pointer focus:outline-none focus:border-accent transition-colors"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-hint pointer-events-none" />
            </div>
          )}

          <header className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-outfit text-[22px] font-semibold text-text-primary leading-[1.2]">Candidate ranking</h1>
              <p className="text-[13px] text-text-muted mt-1">
                {candidates.length} candidate{candidates.length === 1 ? '' : 's'} scored and ranked by relevance{selectedJob ? ` to ${selectedJob.title}` : ''}.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={handleRerank}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-btn border border-border-strong text-[13px] text-text-body hover:bg-bg-subtle transition-colors">
                <RefreshCw size={14} /> Re-rank
              </button>
              <button onClick={handleExport} disabled={candidates.length === 0}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors disabled:opacity-50">
                <Download size={14} /> Export
              </button>
            </div>
          </header>

          {loading && <p className="text-[13px] text-text-muted">Loading candidates...</p>}
          {error && <p className="text-[13px] text-danger-text">Error: {error}</p>}
          {!loading && !error && !selectedJobId && (
            <p className="text-[13px] text-text-muted">No job postings yet. Create a job posting first, then upload resumes to see candidates ranked here.</p>
          )}
          {!loading && !error && selectedJobId && candidates.length === 0 && (
            <p className="text-[13px] text-text-muted">No candidates ranked yet for this job. Upload some resumes to get started.</p>
          )}

          {hasList && (
            <>
              {/* toolbar — one line, its own section */}
              <div className="bg-bg-surface border border-border rounded-card p-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-35">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-hint" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates..."
                      className="w-full h-9 pl-9 pr-3 rounded-btn border border-border text-[12.5px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent focus:border-[1.5px]" />
                  </div>
                  <FilterDropdown label="Sort" value={sortOrder} options={['Match score', 'Name A–Z']} onChange={setSortOrder} compact />
                  <FiltersMenu
                    statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                    expFilter={expFilter} setExpFilter={setExpFilter}
                    locFilter={locFilter} setLocFilter={setLocFilter}
                    locNames={locNames} activeFilters={activeFilters} onClear={clearFilters}
                  />
                </div>
              </div>

              {/* table */}
              <div className="bg-bg-surface border border-border rounded-card p-2">
                <div className="hidden md:flex items-center gap-3 px-3 py-2 mb-1 border-b border-border text-[11px] font-semibold uppercase tracking-wider text-text-hint">
                  <span className="w-6 text-center">#</span>
                  <span className="flex-1">Candidate</span>
                  <span className="w-28 flex items-center justify-center gap-1">Match score <Info size={12} className="text-text-hint" /></span>
                  <span className="hidden lg:block w-32.5">Key skills</span>
                  <span className="w-26 text-center">Status</span>
                  <span className="w-18 text-right">Actions</span>
                </div>

                {paged.map((c) => {
                  const rank = candidates.indexOf(c) + 1
                  const isSel = c.candidate_id === selectedId
                  const score = Math.round(c.overall_score)
                  const shortlisted = c.status === 'Shortlisted'
                  return (
                    <div key={c.candidate_id} role="button" tabIndex={0} onClick={() => setSelectedId(c.candidate_id)}
                      className={`flex items-center gap-3 px-3 py-3 mb-1 last:mb-0 rounded-lg cursor-pointer transition-colors ${isSel ? 'bg-accent-tint ring-1 ring-inset ring-accent/50' : 'hover:bg-bg-subtle'}`}>
                      <span className={`w-6 text-center font-mono text-[13px] shrink-0 ${rank === 1 ? 'text-accent font-semibold' : 'text-text-hint'}`}>{rank}</span>
                      <Avatar name={c.name} photo={c.photo} size="w-10 h-10" text="text-[12px]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-medium text-text-primary leading-[1.3] truncate">{c.name}</h3>
                          {rank === 1 && <span className="text-[10px] font-medium text-accent bg-bg-surface border border-accent/30 px-1.5 py-0.5 rounded-pill shrink-0">Top match</span>}
                        </div>
                        <p className="text-[11.5px] text-text-muted mt-0.5 truncate">{metaLine(c) || (c.source === 'portal' ? 'Applied online' : 'Added by you')}</p>
                        <p className="text-[11px] text-text-hint mt-0.5 flex items-center gap-1 min-w-0">
                          <FileText size={11} className="shrink-0" /><span className="truncate">{c.filename}</span>
                        </p>
                      </div>
                      <div className="w-16 sm:w-28 flex flex-col items-center shrink-0">
                        <Donut score={score} color={ringColor(score)} />
                        <span className={`hidden sm:block text-[10.5px] font-medium mt-1 ${bandText(score)}`}>{matchLabel(score)}</span>
                      </div>
                      <div className="hidden lg:flex flex-wrap gap-1.5 w-32.5 shrink-0">
                        {c.matched_skills.slice(0, 2).map((sk) => (
                          <span key={sk} className="text-[10.5px] font-medium text-text-body bg-bg-subtle px-2 py-0.5 rounded-subtle">{sk}</span>
                        ))}
                        {c.matched_skills.length > 2 && <span className="text-[10.5px] text-text-muted bg-bg-subtle px-2 py-0.5 rounded-subtle">+{c.matched_skills.length - 2}</span>}
                        {c.matched_skills.length === 0 && <span className="text-[11px] text-text-hint">—</span>}
                      </div>
                      <div className="hidden md:flex w-26 justify-center shrink-0">
                        <span className={`text-[10.5px] font-medium px-2.5 py-1 rounded-pill border whitespace-nowrap ${statusStyle(c.status)}`}>{c.status}</span>
                      </div>
                      <div className="w-18 flex items-center justify-end gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setStatus(c.candidate_id, shortlisted ? 'New' : 'Shortlisted')} title={shortlisted ? 'Remove from shortlist' : 'Shortlist'}
                          className={`w-8 h-8 rounded-btn border flex items-center justify-center transition-colors ${shortlisted ? 'border-accent/40 bg-accent-tint text-accent' : 'border-border text-text-muted hover:bg-bg-subtle'}`}>
                          {shortlisted ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                        </button>
                        <RowMenu candidate={c} onStatus={(st) => setStatus(c.candidate_id, st)} onRemove={() => handleDeleteCandidate(c.candidate_id)} />
                      </div>
                    </div>
                  )
                })}
                {filtered.length === 0 && <p className="px-4 py-6 text-[13px] text-text-muted text-center">No candidates match your filters.</p>}
              </div>

              <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
                <p className="text-[12px] text-text-muted">Showing {rangeStart}–{rangeEnd} of {filtered.length} candidate{filtered.length === 1 ? '' : 's'}</p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageC === 1}
                      className="w-8 h-8 rounded-btn border border-border flex items-center justify-center text-text-muted hover:bg-bg-subtle transition-colors disabled:opacity-40"><ChevronLeft size={15} /></button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button key={n} onClick={() => setPage(n)}
                        className={`min-w-8 h-8 px-2 rounded-btn text-[12.5px] font-medium transition-colors ${n === pageC ? 'bg-accent text-white' : 'border border-border text-text-body hover:bg-bg-subtle'}`}>{n}</button>
                    ))}
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageC === totalPages}
                      className="w-8 h-8 rounded-btn border border-border flex items-center justify-center text-text-muted hover:bg-bg-subtle transition-colors disabled:opacity-40"><ChevronRight size={15} /></button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        {hasList && (
          <aside className="xl:sticky xl:top-6 self-start">
            {!selected ? (
              <div className="bg-bg-surface border border-border rounded-card p-8 text-center text-[13px] text-text-muted">Select a candidate to see their full breakdown.</div>
            ) : (
              <div className="bg-bg-surface border border-border rounded-card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={selected.name} photo={selected.photo} size="w-12 h-12" text="text-[14px]" />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-[16px] font-semibold text-text-primary leading-[1.3] truncate">{selected.name}</h2>
                      <p className="text-[12px] text-text-muted mt-0.5 truncate">{selectedJob ? selectedJob.title : 'Candidate'}</p>
                      {metaLine(selected) && <p className="text-[11.5px] text-text-hint mt-0.5 truncate">{metaLine(selected)}</p>}
                    </div>
                    <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-pill shrink-0 ${scoreToneClass(Math.round(selected.overall_score))}`}>{Math.round(selected.overall_score)}% match</span>
                  </div>

                  <div className="flex items-center gap-4 mt-4 -mb-5 -mx-5 px-5 border-b border-border overflow-x-auto">
                    {TABS.map((t) => (
                      <button key={t.key} onClick={() => setTab(t.key)}
                        className={`pb-2.5 text-[12.5px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${tab === t.key ? 'text-accent border-accent' : 'text-text-muted border-transparent hover:text-text-body'}`}>{t.label}</button>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  {tab === 'overview' && (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-card border border-border shadow-sm p-4">
                        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-text-hint mb-3">Match breakdown</h4>
                        <div className="flex flex-col gap-3.5">
                          <Bar label="Skills" value={selected.skills_score} />
                          <Bar label="Experience" value={selected.experience_score} />
                          <Bar label="Education" value={selected.education_score} />
                        </div>
                      </div>
                      <div className="rounded-card border border-border shadow-sm p-4">
                        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-text-hint mb-2">Top matched skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.matched_skills.length === 0 && <span className="text-[12px] text-text-muted">None</span>}
                          {selected.matched_skills.map((s) => (
                            <span key={s} className="inline-flex items-center gap-1 text-[11px] font-medium text-success-text bg-success-tint px-2 py-0.5 rounded-subtle"><Check size={11} /> {s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-card border border-border shadow-sm p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles size={14} className="text-accent" fill="currentColor" strokeWidth={1.5} />
                          <h4 className="text-[12px] font-semibold uppercase tracking-wider text-text-hint">AI summary</h4>
                        </div>
                        <p className="text-[12.5px] text-text-body leading-relaxed">{buildSummary(selected)}</p>
                        {(() => {
                          const sc = Math.round(selected.overall_score)
                          const good = sc >= 75, ok = sc >= 50
                          const box = good ? 'bg-success-tint' : ok ? 'bg-warning-tint' : 'bg-danger-tint'
                          const ic = good ? 'text-success-text' : ok ? 'text-warning-text' : 'text-danger-text'
                          const Ico = good ? Check : AlertTriangle
                          return (
                            <div className={`mt-3 flex items-start gap-2 rounded-btn px-3 py-2.5 ${box}`}>
                              <Ico size={14} className={`${ic} shrink-0 mt-0.5`} />
                              <p className={`text-[12px] ${ic}`}>{fitNote(sc)}</p>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                  {tab === 'skills' && (
                    <div className="flex flex-col gap-5">
                      <Bar label="Skills match" value={selected.skills_score} />
                      <div>
                        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-text-hint mb-2">Matched skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.matched_skills.length === 0 && <span className="text-[12px] text-text-muted">None</span>}
                          {selected.matched_skills.map((s) => (
                            <span key={s} className="inline-flex items-center gap-1 text-[11px] font-medium text-success-text bg-success-tint px-2 py-0.5 rounded-subtle"><Check size={11} /> {s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[12px] font-semibold uppercase tracking-wider text-text-hint mb-2">Missing skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.unmatched_skills.length === 0 && <span className="text-[12px] text-text-muted">None — all required skills matched.</span>}
                          {selected.unmatched_skills.map((s) => (
                            <span key={s} className="text-[11px] text-text-muted bg-bg-subtle px-2 py-0.5 rounded-subtle">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {tab === 'experience' && (
                    <div className="flex flex-col gap-4">
                      <Bar label="Experience alignment" value={selected.experience_score} />
                      {selected.years_experience != null && (
                        <p className="text-[12.5px] text-text-body">Detected experience: <span className="font-medium">{expLabel(selected.years_experience)?.replace(' exp', '')}</span>{selected.location ? ` · ${selected.location}` : ''}.</p>
                      )}
                      <div className={`flex items-start gap-2 rounded-btn px-3 py-2.5 ${selected.duration_verified ? 'bg-success-tint' : 'bg-bg-subtle'}`}>
                        {selected.duration_verified ? <Check size={14} className="text-success-text shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="text-text-muted shrink-0 mt-0.5" />}
                        <p className="text-[12px] text-text-body">
                          {selected.duration_verified
                            ? 'Experience duration was verified from the CV, so this score reflects both relevance and length.'
                            : 'Experience duration couldn’t be verified — this CV didn’t follow the standard template, so the score reflects relevance only.'}
                        </p>
                      </div>
                      <p className="text-[12px] text-text-muted leading-relaxed">Open the Resume tab to read the full experience section as parsed from the uploaded file.</p>
                    </div>
                  )}
                  {tab === 'resume' && (
                    <div>
                      {detailLoading && <p className="text-[13px] text-text-muted">Loading resume…</p>}
                      {!detailLoading && detail && (
                        <>
                          <div className="bg-bg-subtle rounded-btn p-4 max-h-105 overflow-y-auto">
                            <pre className="text-[11px] text-text-body whitespace-pre-wrap font-sans leading-relaxed">{detail.resume_text}</pre>
                          </div>
                          <p className="text-[11px] text-text-hint mt-2">Text extracted from {detail.filename} and used for scoring.</p>
                        </>
                      )}
                      {!detailLoading && !detail && <p className="text-[13px] text-text-muted">Could not load the resume.</p>}
                    </div>
                  )}
                  {tab === 'notes' && (
                    <div>
                      <textarea value={notes} onChange={(e) => saveNotes(e.target.value)} placeholder="Add private notes about this candidate…"
                        className="w-full min-h-45 rounded-btn border border-border bg-bg-subtle p-3 text-[13px] text-text-body placeholder:text-text-hint focus:outline-none focus:border-accent resize-y leading-relaxed" />
                      <p className="text-[10.5px] text-text-hint mt-2">Saved in this browser. A shared notes feature can be added later.</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3.5 border-t border-border flex items-center gap-3">
                  <button onClick={() => setTab('resume')} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-btn border border-border-strong text-[13px] font-medium text-text-body hover:bg-bg-subtle transition-colors">
                    <FileText size={14} /> View full resume
                  </button>
                  {selected.status === 'Shortlisted' ? (
                    <button onClick={() => setStatus(selected.candidate_id, 'In review')}
                      className="flex items-center justify-center gap-2 h-10 px-4 rounded-btn bg-success-tint text-success-text text-[13px] font-medium">
                      <BookmarkCheck size={14} /> Shortlisted
                    </button>
                  ) : (
                    <button onClick={() => setStatus(selected.candidate_id, 'Shortlisted')}
                      className="flex items-center justify-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors">
                      <Bookmark size={14} /> Shortlist
                    </button>
                  )}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}
