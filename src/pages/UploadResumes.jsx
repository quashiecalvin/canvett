import { useState, useRef } from 'react'
import { CloudUpload, Folder, CheckCircle2, File, X } from 'lucide-react'
import { uploadResume } from '../lib/api'
import { useJob } from '../context/JobContext'
import JobSelector from '../components/ui/JobSelector'

function formatTime(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}



export default function UploadResumes() {
  const { selectedJobId } = useJob()
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)

  async function handleFiles(selectedFiles) {
    const fileArray = Array.from(selectedFiles)

    for (const file of fileArray) {
      const type = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx'
      const entry = {
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        type,
        status: 'uploading',
        uploadedAt: new Date(),
      }

      setFiles((prev) => [...prev, entry])

      try {
        await uploadResume(selectedJobId, file)
        setFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, status: 'parsed' } : f))
        )
      } catch {
        setFiles((prev) =>
          prev.map((f) => (f.id === entry.id ? { ...f, status: 'error' } : f))
        )
      }
    }
  }

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const parsedCount = files.filter((f) => f.status === 'parsed').length

  return (
    <div className="p-6">
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-medium text-text-primary leading-[1.2]">Upload resumes</h1>
          <p className="text-[13px] text-text-muted mt-1">Add candidate resumes to rank against a job posting</p>
        </div>
        <JobSelector />
      </header>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        className="bg-bg-surface border-[1.5px] border-dashed border-accent-light rounded-modal p-10 flex flex-col items-center text-center mb-6 cursor-pointer hover:border-accent transition-colors"
      >
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
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-medium text-text-primary leading-[1.4]">Uploaded files</h2>
            <span className="text-[12px] text-text-muted">{parsedCount} of {files.length} parsed</span>
          </div>

          <div className="flex flex-col gap-3">
            {files.map(({ id, name, size, type, status, uploadedAt }) => (
              <div key={id} className="bg-bg-surface border border-border rounded-card p-4 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-btn flex items-center justify-center shrink-0
                  ${type === 'pdf' ? 'bg-danger-tint text-danger-text' : 'bg-accent-tint text-accent'}`}>
                  <File size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-medium text-text-primary leading-[1.4] truncate">{name}</h3>
                  <p className="text-[11px] text-text-muted mt-0.5">{type.toUpperCase()} • {size} • uploaded {formatTime(uploadedAt)}</p>
                </div>
                {status === 'parsed' && (
                  <div className="flex items-center gap-1.5 text-success shrink-0">
                    <CheckCircle2 size={14} />
                    <span className="text-[12px] font-medium">Parsed</span>
                  </div>
                )}
                {status === 'uploading' && (
                  <span className="text-[12px] text-text-muted shrink-0">Uploading...</span>
                )}
                {status === 'error' && (
                  <span className="text-[12px] text-danger-text shrink-0">Failed</span>
                )}
                <button onClick={() => removeFile(id)} className="text-text-hint hover:text-text-body transition-colors shrink-0">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
