const BASE_URL = "http://localhost:8000"

export async function getJobs() {
  const res = await fetch(`${BASE_URL}/jobs`)
  if (!res.ok) throw new Error("Failed to fetch jobs")
  return res.json()
}

export async function getRanking(jobId) {
  const res = await fetch(`${BASE_URL}/candidates/ranking/${jobId}`)
  if (!res.ok) throw new Error("Failed to fetch ranking")
  return res.json()
}

export async function uploadResume(jobId, file) {
  const formData = new FormData()
  formData.append("job_id", jobId)
  formData.append("file", file)

  const res = await fetch(`${BASE_URL}/candidates/upload`, {
    method: "POST",
    body: formData,
  })
  if (!res.ok) throw new Error("Failed to upload resume")
  return res.json()
}

export async function getStats() {
  const res = await fetch(`${BASE_URL}/stats`)
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}

export async function createJob(jobData) {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  })
  if (!res.ok) throw new Error("Failed to create job")
  return res.json()
}
