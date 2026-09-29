import { useState, useRef, useEffect, useMemo } from 'react'
import { X, Search } from 'lucide-react'
import { SKILLS_TAXONOMY } from '../../lib/skillsTaxonomy'

// The full skill list sorted alphabetically once, so the dropdown reads like a
// course selector: browse the whole range in order, or type to narrow it.
const SORTED_SKILLS = [...SKILLS_TAXONOMY].sort((a, b) => a.localeCompare(b))

// Searchable, cross-industry skills selector. Users type to filter a broad list
// and pick with the mouse or keyboard; anything not in the list can still be
// added via the "Add ‘…’" option, so no field is ever a dead end. Props are the
// same (skills, setSkills) so it is a drop-in wherever the old input was used.
export default function SkillsInput({ skills, setSkills }) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapRef = useRef(null)
  const listRef = useRef(null)

  const selectedLower = useMemo(
    () => new Set(skills.map((s) => s.toLowerCase())),
    [skills],
  )

  const query = input.trim().toLowerCase()
  const suggestions = useMemo(() => {
    const pool = SORTED_SKILLS.filter((s) => !selectedLower.has(s.toLowerCase()))
    if (!query) return pool
    const starts = pool.filter((s) => s.toLowerCase().startsWith(query))
    const contains = pool.filter(
      (s) => !s.toLowerCase().startsWith(query) && s.toLowerCase().includes(query),
    )
    return [...starts, ...contains]
  }, [query, selectedLower])

  // Whether the typed text is an exact (case-insensitive) match already offered.
  const exactExists =
    query &&
    (selectedLower.has(query) ||
      SKILLS_TAXONOMY.some((s) => s.toLowerCase() === query))
  const showAddCustom = query && !exactExists
  const options = showAddCustom ? [...suggestions, { custom: input.trim() }] : suggestions

  useEffect(() => { setActive(0) }, [input, open])

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function addSkill(value) {
    const trimmed = (value || '').trim()
    if (trimmed && !selectedLower.has(trimmed.toLowerCase())) {
      setSkills([...skills, trimmed])
    }
    setInput('')
    setActive(0)
  }

  function removeSkill(skill) {
    setSkills(skills.filter((s) => s !== skill))
  }

  function chooseActive() {
    const opt = options[active]
    if (opt == null) {
      if (input.trim()) addSkill(input)
      return
    }
    addSkill(typeof opt === 'string' ? opt : opt.custom)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault(); setOpen(true)
      setActive((a) => Math.min(a + 1, Math.max(options.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault(); chooseActive()
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Backspace' && !input && skills.length > 0) {
      removeSkill(skills[skills.length - 1])
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex flex-wrap items-center gap-1.5 min-h-10 px-3 py-2 rounded-btn border border-border-strong focus-within:border-accent focus-within:border-[1.5px]">
        {skills.map((skill) => (
          <span key={skill} className="flex items-center gap-1 text-[11px] font-medium text-accent bg-accent-tint px-2 py-0.5 rounded-subtle">
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-accent-2" aria-label={`Remove ${skill}`}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? 'Search skills, or type your own…' : ''}
          className="flex-1 min-w-[140px] text-[13px] text-text-body placeholder:text-text-hint focus:outline-none bg-transparent"
        />
      </div>

      {open && options.length > 0 && (
        <ul ref={listRef} className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-btn border border-border bg-bg-surface shadow-lg shadow-black/5 py-1">
          {options.map((opt, i) => {
            const isCustom = typeof opt !== 'string'
            const label = isCustom ? opt.custom : opt
            return (
              <li key={isCustom ? '__custom' : opt}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => addSkill(label)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] transition-colors ${
                    i === active ? 'bg-accent-tint text-accent' : 'text-text-body hover:bg-bg-subtle'
                  }`}
                >
                  {isCustom
                    ? <><Search size={13} className="shrink-0 text-text-hint" />Add “{label}”</>
                    : label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
