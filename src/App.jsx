import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { JobProvider } from './context/JobContext'
import { ActivityProvider } from './context/ActivityContext'
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
import SeekerLayout from './components/layout/SeekerLayout'
import JobBoard from './pages/seeker/JobBoard'
import JobDetail from './pages/seeker/JobDetail'
import ApplyToJob from './pages/seeker/ApplyToJob'
import MyApplications from './pages/seeker/MyApplications'
import SeekerProfile from './pages/seeker/SeekerProfile'
import SavedJobs from './pages/seeker/SavedJobs'
import RecruiterProfile from './pages/RecruiterProfile'
import About from './pages/About'
import Privacy from './pages/Privacy'

function RecruiterApp() {
  return (
    <SettingsProvider>
      <JobProvider>
        <ActivityProvider>
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="jobs" element={<JobPostings />} />
              <Route path="upload" element={<UploadResumes />} />
              <Route path="ranking" element={<CandidateRanking />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<RecruiterProfile />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AppLayout>
        </ActivityProvider>
      </JobProvider>
    </SettingsProvider>
  )
}

function SeekerApp() {
  return (
    <SeekerLayout>
      <Routes>
        <Route path="jobs" element={<JobBoard />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="jobs/:id/apply" element={<ApplyToJob />} />
        <Route path="saved" element={<SavedJobs />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="profile" element={<SeekerProfile />} />
        <Route path="*" element={<Navigate to="jobs" replace />} />
      </Routes>
    </SeekerLayout>
  )
}

// Every navigation lands at the top of the page, on every route in the app.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'recruiter' ? '/dashboard' : '/seeker/jobs'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route
            path="/seeker/*"
            element={
              <ProtectedRoute role="seeker">
                <SeekerApp />
              </ProtectedRoute>
            }
          />
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
