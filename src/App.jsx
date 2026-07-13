import { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import JobPostings from './pages/JobPostings'
import UploadResumes from './pages/UploadResumes'
import CandidateRanking from './pages/CandidateRanking'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import { JobProvider } from './context/JobContext'
import { SettingsProvider } from './context/SettingsContext'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <SettingsProvider>
      <JobProvider>
        <AppLayout activePage={activePage} onNavigate={setActivePage}>
          {activePage === 'dashboard' && <Dashboard />}
          {activePage === 'jobs' && <JobPostings onNavigate={setActivePage} />}
          {activePage === 'upload' && <UploadResumes />}
          {activePage === 'ranking' && <CandidateRanking />}
          {activePage === 'analytics' && <Analytics />}
          {activePage === 'settings' && <Settings />}
        </AppLayout>
      </JobProvider>
    </SettingsProvider>
  )
}
