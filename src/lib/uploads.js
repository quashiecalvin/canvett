// Shared client-side rules for resume uploads. Mirrors the backend limits in
// services/parser.py (5 MB, PDF/DOCX) so bad files are caught before the round
// trip; the server still re-validates and checks the file signature.
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const MAX_UPLOAD_LABEL = '5 MB'
export const ACCEPTED_UPLOAD_LABEL = 'PDF or DOCX, up to 5 MB'

export function validateUploadFile(file) {
  const name = (file?.name || '').toLowerCase()
  if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
    return 'Unsupported file type. Please upload a PDF or DOCX.'
  }
  if (!file.size) {
    return 'This file appears to be empty.'
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That file is too large. The maximum size is ${MAX_UPLOAD_LABEL}.`
  }
  return null
}
