import { ChevronDown, CloudUpload, Folder, CheckCircle2, File, X } from 'lucide-react'

export default function UploadResumes() {
  return (
    <div className="p-6">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Upload resumes</h1>
          <p className="text-[13px] text-text-muted mt-1">Add candidate resumes to rank against a job posting</p>
        </div>
        <button className="flex items-center gap-2 h-10 px-4 rounded-btn border border-border-strong text-[13px] text-text-body hover:bg-bg-subtle transition-colors">
          Software Engineer - Backend
          <ChevronDown size={14} className="text-text-hint" />
        </button>
      </header>

      <div className="bg-bg-surface border-[1.5px] border-dashed border-accent-light rounded-modal p-10 flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-accent-tint flex items-center justify-center text-accent mb-4">
          <CloudUpload size={28} />
        </div>
        <h3 className="text-[15px] font-medium text-text-primary leading-[1.4]">Drag and drop resumes here</h3>
        <p className="text-[13px] text-text-muted mt-1">or click to browse your files</p>
        <button className="mt-4 flex items-center gap-2 h-10 px-4 rounded-btn bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors">
          <Folder size={14} />
          Browse files
        </button>
        <p className="text-[11px] text-text-hint mt-4">Supported formats: PDF, DOCX • Max 10MB per file</p>
      </div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-medium text-text-primary leading-[1.4]">Uploaded files</h2>
        <span className="text-[12px] text-text-muted">4 of 4 parsed</span>
      </div>

      <div className="flex flex-col gap-3">
        {[
          { name: 'Eric_Ntow_Resume.pdf', size: '248 KB', time: 'uploaded just now', type: 'pdf', status: 'parsed' },
          { name: 'Kelly_Nartey_CV.docx', size: '186 KB', time: 'uploaded just now', type: 'docx', status: 'parsed' },
          { name: 'Lawrence_Mensah_Resume.pdf', size: '312 KB', time: 'parsing...', type: 'pdf', status: 'progress', progress: 65 },
          { name: 'Roland_Asante_CV.docx', size: '208 KB', time: 'uploaded 1 min ago', type: 'docx', status: 'parsed' },
        ].map(({ name, size, time, type, status, progress }) => (
          <div key={name} className="bg-bg-surface border border-border rounded-card p-4 flex items-center gap-4">
            <div className={`w-9 h-9 rounded-btn flex items-center justify-center shrink-0
              ${type === 'pdf' ? 'bg-danger-tint text-danger-text' : 'bg-accent-tint text-accent'}`}>
              <File size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-medium text-text-primary leading-[1.4] truncate">{name}</h3>
             <p className="text-[11px] text-text-muted mt-0.5">{type.toUpperCase()} • {size} • {time}</p>
            </div>
            {status === 'parsed' ? (
              <div className="flex items-center gap-1.5 text-success shrink-0">
                <CheckCircle2 size={14} />
                <span className="text-[12px] font-medium">Parsed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-20 h-1 rounded-full bg-disabled-bg overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[11px] text-text-muted">{progress}%</span>
              </div>
            )}
            <button className="text-text-hint hover:text-text-body transition-colors shrink-0">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}