import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { JobProvider } from './context/JobContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'

import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import JobPostings from './pages/JobPostings'
import UploadResumes from './pages/UploadResumes'
import CandidateRanking from './pages/CandidateRanking'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function RecruiterApp() {
  return (
    <SettingsProvider>
      <JobProvider>
        <AppLayout>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="jobs" element={<JobPostings />} />
            <Route path="upload" element={<UploadResumes />} />
            <Route path="ranking" element={<CandidateRanking />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </AppLayout>
      </JobProvider>
    </SettingsProvider>
  )
}

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'recruiter' ? '/dashboard' : '/jobs'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute role="recruiter">
                <RecruiterApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
