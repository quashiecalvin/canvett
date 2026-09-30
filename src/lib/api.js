import { getToken, clearSession } from "./authStorage"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const NETWORK_MESSAGE = "Could not reach the server. Check your connection and try again."

// When an authenticated request comes back 401, the stored token is missing,
// expired, or otherwise invalid. Rather than leaving the user on an empty page
// whose data silently failed to load, clear the session and send them to the
// login screen with a notice. Guarded so it only redirects once.
let redirectingToLogin = false
function handleUnauthorized() {
  clearSession()
  if (redirectingToLogin) return
  if (typeof window === "undefined") return
  if (window.location.pathname === "/login") return
  redirectingToLogin = true
  const here = window.location.pathname + window.location.search
  const params = new URLSearchParams({ expired: "1", next: here })
  window.location.replace(`/login?${params.toString()}`)
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function apiError(message, status, cause) {
  const error = new Error(message)
  error.status = status
  if (cause) error.cause = cause
  return error
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
 *
 * Every failure mode — network error, non-2xx response, unreadable body —
 * arrives as an Error carrying the backend's `detail` when there is one, with
 * the HTTP status on `error.status` (null when the request never reached the
 * server).
 */
async function request(path, fallback, { method = "GET", json, body, auth = true, parse = true } = {}) {
  const headers = {
    ...(auth ? authHeaders() : {}),
    ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: json !== undefined ? JSON.stringify(json) : body,
    })
  } catch (cause) {
    throw apiError(NETWORK_MESSAGE, null, cause)
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    // An authenticated request rejected with 401 means the session is no longer
    // valid; send the user to sign in again instead of failing silently.
    if (res.status === 401 && auth) {
      handleUnauthorized()
    }
    throw apiError(errorMessage(err) || fallback, res.status)
  }

  if (!parse || res.status === 204) return undefined

  try {
    return await res.json()
  } catch (cause) {
    throw apiError("The server returned a response we could not read.", res.status, cause)
  }
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

export function forgotPassword(email) {
  return request("/auth/forgot-password", "Could not start the reset", {
    method: "POST",
    json: { email },
    auth: false,
  })
}

export function resetPassword(token, new_password) {
  return request("/auth/reset-password", "Could not reset your password", {
    method: "POST",
    json: { token, new_password },
    auth: false,
  })
}

export function googleAuth(credential, role, company_name) {
  const body = { credential }
  if (role) body.role = role
  if (company_name) body.company_name = company_name
  return request("/auth/google", "Google sign-in failed", {
    method: "POST",
    json: body,
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

export function getApplicationStatus(jobId) {
  return request(`/applications/status/${jobId}`, "Failed to check application status")
}

// ---------- Notifications ----------

export function getNotifications() {
  return request("/notifications", "Failed to fetch notifications")
}

export function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, "Failed to update notification", { method: "POST", parse: false })
}

export function markAllNotificationsRead() {
  return request("/notifications/read-all", "Failed to update notifications", { method: "POST", parse: false })
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

export function getApplicationsTimeline() {
  return request("/stats/applications-timeline", "Failed to fetch applications timeline")
}

export function searchAll(q) {
  return request(`/stats/search?q=${encodeURIComponent(q)}`, "Search failed")
}

export function updateCandidateNotes(candidateId, notes) {
  return request(`/candidates/${candidateId}/notes`, "Failed to save notes", {
    method: "PATCH", json: { notes }, parse: false,
  })
}

export function updateCandidateStatus(candidateId, status) {
  return request(`/candidates/${candidateId}/status`, "Failed to update candidate status", { method: "PATCH", json: { status } })
}

export function getSavedJobs() {
  return request("/saved-jobs/", "Failed to fetch saved jobs")
}
export function saveJob(jobId) {
  return request(`/saved-jobs/${jobId}`, "Failed to save job", { method: "POST" })
}
export function unsaveJob(jobId) {
  return request(`/saved-jobs/${jobId}`, "Failed to remove saved job", { method: "DELETE" })
}

export function deleteAccount(password) {
  return request("/auth/delete-account", "Failed to delete account", {
    method: "POST",
    json: { password },
    parse: false,
  })
}

export function completeOnboarding(details) {
  return request("/auth/onboarding", "Failed to save onboarding", { method: "POST", json: details })
}
