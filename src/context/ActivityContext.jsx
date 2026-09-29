import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getActivity } from '../lib/api'

const ActivityContext = createContext(null)

// Shared activity feed. Both the notification bell (AppLayout) and the dashboard
// need the same recent-activity list, so it is fetched once here and consumed in
// both places instead of each fetching /stats/activity independently.
export function ActivityProvider({ children }) {
  const [activity, setActivity] = useState([])

  const refreshActivity = useCallback(() => {
    return getActivity()
      .then((data) => {
        setActivity(data)
        return data
      })
      .catch(() => {
        // A failed activity fetch should not break the page; leave the last
        // known list in place.
      })
  }, [])

  useEffect(() => {
    refreshActivity()
  }, [refreshActivity])

  return (
    <ActivityContext.Provider value={{ activity, refreshActivity }}>
      {children}
    </ActivityContext.Provider>
  )
}

export function useActivity() {
  return useContext(ActivityContext)
}
