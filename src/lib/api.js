const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const NETWORK_MESSAGE = "Could not reach the server. Check your connection and try again."

function authHeaders() {
  const token = localStorage.getItem("canvett_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function errorMessage(err) {
  if (!err || !err.detail) return null
  if (typeof err.detail === "string") return err.detail
  if (Array.isArray(err.detail) && err.detail[0]?.msg) {
    return err.detail[0].msg.replace(/^Value error, /, "")
  }
  return null
}

function apiError(message, status, cause) {
  const error = new Error(message)
  error.status = status
  if (cause) error.cause = cause
  return error
}

async function failureFor(res, fallback) {
  let body
  try {
    body = await res.json()
  } catch (cause) {
    return apiError(fallback, res.status, cause)
  }
  return apiError(errorMessage(body) || fallback, res.status)
}

/**
 * Performs a request and turns every failure mode — network error, non-2xx
 * response, unparseable body — into an Error carrying the server's `detail`
 * when there is one, and the HTTP status on `error.status`.
 */
async function request(path, { method = "GET", json, body, auth = true, fallback } = {}) {
  const headers = auth ? { ...authHeaders() } : {}
  let payload = body
  if (json !== undefined) {
    headers["Content-Type"] = "application/json"
    payload = JSON.stringify(json)
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload })
  } catch (cause) {
    throw apiError(NETWORK_MESSAGE, null, cause)
  }

  if (!res.ok) throw await failureFor(res, fallback)
  if (res.status === 204) return null

  try {
    return await res.json()
  } catch (cause) {
    throw apiError("The server returned a response we could not read.", res.status, cause)
  }
}

export async function getJobs() {
  return request("/jobs", { fallback: "Failed to fetch jobs" })
}

export async function getRanking(jobId) {
  return request(`/candidates/ranking/${jobId}`, { fallback: "Failed to fetch ranking" })
}

export async function uploadResume(jobId, file) {
  const formData = new FormData()
  formData.append("job_id", jobId)
  formData.append("file", file)

  return request("/candidates/upload", {
    method: "POST",
    body: formData,
    fallback: "Failed to upload resume",
  })
}

export async function getStats() {
  return request("/stats", { fallback: "Failed to fetch stats" })
}

export async function createJob(jobData) {
  return request("/jobs", { method: "POST", json: jobData, fallback: "Failed to create job" })
}

export async function getTopCandidates() {
  return request("/stats/top-candidates", { fallback: "Failed to fetch top candidates" })
}

export async function getActivity() {
  return request("/stats/activity", { fallback: "Failed to fetch activity" })
}

export async function deleteJob(jobId) {
  return request(`/jobs/${jobId}`, { method: "DELETE", fallback: "Failed to delete job" })
}

export async function updateJob(jobId, jobData) {
  return request(`/jobs/${jobId}`, { method: "PUT", json: jobData, fallback: "Failed to update job" })
}

export async function rerankJob(jobId) {
  return request(`/candidates/rerank/${jobId}`, { method: "POST", fallback: "Failed to re-rank" })
}

export async function deleteCandidate(candidateId) {
  return request(`/candidates/${candidateId}`, {
    method: "DELETE",
    fallback: "Failed to delete candidate",
  })
}

export async function getCandidateDetail(candidateId) {
  return request(`/candidates/${candidateId}/detail`, {
    fallback: "Failed to fetch candidate details",
  })
}

export async function getAnalytics() {
  return request("/stats/analytics", { fallback: "Failed to fetch analytics" })
}

export async function getSettings() {
  return request("/settings", { fallback: "Failed to fetch settings" })
}

export async function updateSettings(settings) {
  return request("/settings", {
    method: "PUT",
    json: settings,
    fallback: "Failed to update settings",
  })
}

// ---------- Authentication ----------

export async function register(details) {
  return request("/auth/register", {
    method: "POST",
    json: details,
    auth: false,
    fallback: "Registration failed",
  })
}

export async function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    json: { email, password },
    auth: false,
    fallback: "Login failed",
  })
}

export async function getMe() {
  return request("/auth/me", { fallback: "Not authenticated" })
}

// ---------- Seeker: public job board ----------

export async function getPublicJobs() {
  return request("/public/jobs/", { auth: false, fallback: "Failed to fetch jobs" })
}

export async function getPublicJob(jobId) {
  return request(`/public/jobs/${jobId}`, {
    auth: false,
    fallback: "This job is no longer available",
  })
}

// ---------- Seeker: applications ----------

export async function applyWithUpload(jobId, file) {
  const formData = new FormData()
  formData.append("file", file)

  return request(`/applications/upload/${jobId}`, {
    method: "POST",
    body: formData,
    fallback: "Failed to submit application",
  })
}

export async function applyWithForm(jobId, details) {
  return request(`/applications/form/${jobId}`, {
    method: "POST",
    json: details,
    fallback: "Failed to submit application",
  })
}

export async function getMyApplications() {
  return request("/applications/mine", { fallback: "Failed to fetch your applications" })
}

// ---------- Profile ----------

export async function updateProfile(details) {
  return request("/auth/me", {
    method: "PATCH",
    json: details,
    fallback: "Failed to update profile",
  })
}

export async function changePassword(details) {
  await request("/auth/change-password", {
    method: "POST",
    json: details,
    fallback: "Failed to change password",
  })
}
