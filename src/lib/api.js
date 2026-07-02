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
