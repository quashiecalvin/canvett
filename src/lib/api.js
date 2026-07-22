const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

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

export async function getTopCandidates() {
  const res = await fetch(`${BASE_URL}/stats/top-candidates`)
  if (!res.ok) throw new Error("Failed to fetch top candidates")
  return res.json()
}

export async function getActivity() {
  const res = await fetch(`${BASE_URL}/stats/activity`)
  if (!res.ok) throw new Error("Failed to fetch activity")
  return res.json()
}

export async function deleteJob(jobId) {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete job")
  return res.json()
}

export async function updateJob(jobId, jobData) {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  })
  if (!res.ok) throw new Error("Failed to update job")
  return res.json()
}

export async function rerankJob(jobId) {
  const res = await fetch(`${BASE_URL}/candidates/rerank/${jobId}`, {
    method: "POST",
  })
  if (!res.ok) throw new Error("Failed to re-rank")
  return res.json()
}

export async function deleteCandidate(candidateId) {
  const res = await fetch(`${BASE_URL}/candidates/${candidateId}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete candidate")
  return res.json()
}

export async function getCandidateDetail(candidateId) {
  const res = await fetch(`${BASE_URL}/candidates/${candidateId}/detail`)
  if (!res.ok) throw new Error("Failed to fetch candidate details")
  return res.json()
}

export async function getAnalytics() {
  const res = await fetch(`${BASE_URL}/stats/analytics`)
  if (!res.ok) throw new Error("Failed to fetch analytics")
  return res.json()
}

export async function getSettings() {
  const res = await fetch(`${BASE_URL}/settings`)
  if (!res.ok) throw new Error("Failed to fetch settings")
  return res.json()
}

export async function updateSettings(settings) {
  const res = await fetch(`${BASE_URL}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || "Failed to update settings")
  }
  return res.json()
}

// ---------- Authentication ----------

function authHeaders() {
  const token = localStorage.getItem("canvett_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function register(details) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(errorMessage(err) || "Registration failed")
  }
  return res.json()
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(errorMessage(err) || "Login failed")
  }
  return res.json()
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, { headers: authHeaders() })
  if (!res.ok) throw new Error("Not authenticated")
  return res.json()
}

function errorMessage(err) {
  if (!err || !err.detail) return null
  if (typeof err.detail === "string") return err.detail
  if (Array.isArray(err.detail) && err.detail[0]?.msg) {
    return err.detail[0].msg.replace(/^Value error, /, "")
  }
  return null
}
