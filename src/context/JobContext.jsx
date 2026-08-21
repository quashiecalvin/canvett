import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getJobs } from '../lib/api'

const JobContext = createContext(null)

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [jobsError, setJobsError] = useState(null)

  const refreshJobs = useCallback(() => {
    return getJobs()
      .then((data) => {
        setJobsError(null)
        setJobs(data)
        setSelectedJobId((current) => {
          if (data.length === 0) return null
          const stillExists = data.some((j) => j.id === current)
          return stillExists ? current : data[0].id
        })
      })
      .catch((err) => {
        setJobsError(err.message)
      })
  }, [])

  useEffect(() => {
    refreshJobs()
  }, [refreshJobs])

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null

  return (
    <JobContext.Provider value={{ jobs, selectedJobId, setSelectedJobId, selectedJob, refreshJobs, jobsError }}>
      {children}
    </JobContext.Provider>
  )
}

export function useJob() {
  return useContext(JobContext)
}
