import { getToken } from "./authStorage"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

function authHeaders() {
  const token = getToken()
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

/**
 * Single entry point for every backend call.
 *
 * @param path      endpoint path, appended to the API base URL
 * @param fallback  error message used when the backend sends no detail
 * @param method    HTTP method, defaults to GET
 * @param json      request body sent as JSON
 * @param body      request body sent as-is (e.g. FormData)
 * @param auth      attach the stored bearer token, defaults to true
 * @param parse     parse the response as JSON, defaults to true
 */
async function request(path, fallback, { method = "GET", json, body, auth = true, parse = true } = {}) {
  const headers = {
    ...(auth ? authHeaders() : {}),
    ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(errorMessage(err) || fallback)
  }

  return parse ? res.json() : undefined
}

function formData(entries) {
  const data = new FormData()
  for (const [key, value] of Object.entries(entries)) data.append(key, value)
  return data
}

// ---------- Jobs ----------

export function getJobs() {
  return request("/jobs", "Failed to fetch jobs")
}

export function createJob(jobData) {
  return request("/jobs", "Failed to create job", { method: "POST", json: jobData })
}

export function updateJob(jobId, jobData) {
  return request(`/jobs/${jobId}`, "Failed to update job", { method: "PUT", json: jobData })
}

export function deleteJob(jobId) {
  return request(`/jobs/${jobId}`, "Failed to delete job", { method: "DELETE" })
}

// ---------- Candidates ----------

export function getRanking(jobId) {
  return request(`/candidates/ranking/${jobId}`, "Failed to fetch ranking")
}

export function uploadResume(jobId, file) {
  return request("/candidates/upload", "Failed to upload resume", {
    method: "POST",
    body: formData({ job_id: jobId, file }),
  })
}

export function rerankJob(jobId) {
  return request(`/candidates/rerank/${jobId}`, "Failed to re-rank", { method: "POST" })
}

export function deleteCandidate(candidateId) {
  return request(`/candidates/${candidateId}`, "Failed to delete candidate", { method: "DELETE" })
}

export function getCandidateDetail(candidateId) {
  return request(`/candidates/${candidateId}/detail`, "Failed to fetch candidate details")
}

// ---------- Stats ----------

export function getStats() {
  return request("/stats", "Failed to fetch stats")
}

export function getTopCandidates() {
  return request("/stats/top-candidates", "Failed to fetch top candidates")
}

export function getActivity() {
  return request("/stats/activity", "Failed to fetch activity")
}

export function getAnalytics() {
  return request("/stats/analytics", "Failed to fetch analytics")
}

// ---------- Settings ----------

export function getSettings() {
  return request("/settings", "Failed to fetch settings")
}

export function updateSettings(settings) {
  return request("/settings", "Failed to update settings", { method: "PUT", json: settings })
}

// ---------- Authentication ----------

export function register(details) {
  return request("/auth/register", "Registration failed", { method: "POST", json: details, auth: false })
}

export function login(email, password) {
  return request("/auth/login", "Login failed", {
    method: "POST",
    json: { email, password },
    auth: false,
  })
}

export function getMe() {
  return request("/auth/me", "Not authenticated")
}

// ---------- Seeker: public job board ----------

export function getPublicJobs() {
  return request("/public/jobs/", "Failed to fetch jobs", { auth: false })
}

export function getPublicJob(jobId) {
  return request(`/public/jobs/${jobId}`, "This job is no longer available", { auth: false })
}

// ---------- Seeker: applications ----------

export function applyWithUpload(jobId, file) {
  return request(`/applications/upload/${jobId}`, "Failed to submit application", {
    method: "POST",
    body: formData({ file }),
  })
}

export function applyWithForm(jobId, details) {
  return request(`/applications/form/${jobId}`, "Failed to submit application", {
    method: "POST",
    json: details,
  })
}

export function getMyApplications() {
  return request("/applications/mine", "Failed to fetch your applications")
}

// ---------- Profile ----------

export function updateProfile(details) {
  return request("/auth/me", "Failed to update profile", { method: "PATCH", json: details })
}

export function changePassword(details) {
  return request("/auth/change-password", "Failed to change password", {
    method: "POST",
    json: details,
    parse: false,
  })
}
