import { createContext, useContext, useState, useEffect } from 'react'
import { getJobs } from '../lib/api'

const JobContext = createContext(null)

export function JobProvider({ children }) {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(null)

  useEffect(() => {
    getJobs()
      .then((data) => {
        setJobs(data)
        if (data.length > 0) {
          setSelectedJobId(data[0].id)
        }
      })
      .catch(() => {})
  }, [])

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null

  return (
    <JobContext.Provider value={{ jobs, selectedJobId, setSelectedJobId, selectedJob }}>
      {children}
    </JobContext.Provider>
  )
}

export function useJob() {
  return useContext(JobContext)
}
