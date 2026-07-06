import { useState } from 'react'
import { X } from 'lucide-react'

export default function SkillsInput({ skills, setSkills }) {
  const [input, setInput] = useState('')

  function addSkill() {
    const trimmed = input.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
    }
    setInput('')
  }

  function removeSkill(skill) {
    setSkills(skills.filter((s) => s !== skill))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    } else if (e.key === 'Backspace' && !input && skills.length > 0) {
      removeSkill(skills[skills.length - 1])
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 min-h-10 px-3 py-2 rounded-btn border border-border-strong focus-within:border-accent focus-within:border-[1.5px]">
      {skills.map((skill) => (
        <span key={skill} className="flex items-center gap-1 text-[11px] font-medium text-accent bg-accent-tint px-2 py-0.5 rounded-subtle">
          {skill}
          <button type="button" onClick={() => removeSkill(skill)} className="hover:text-accent-2">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addSkill}
        placeholder={skills.length === 0 ? 'Type a skill and press Enter' : ''}
        className="flex-1 min-w-[120px] text-[13px] text-text-body placeholder:text-text-hint focus:outline-none bg-transparent"
      />
    </div>
  )
}
