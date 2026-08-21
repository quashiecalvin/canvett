import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getSettings } from '../lib/api'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [settingsError, setSettingsError] = useState(null)

  const refreshSettings = useCallback(() => {
    return getSettings()
      .then((data) => {
        setSettingsError(null)
        setSettings(data)
      })
      .catch((err) => {
        setSettingsError(err.message)
      })
  }, [])

  useEffect(() => {
    refreshSettings()
  }, [refreshSettings])

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings, settingsError }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
