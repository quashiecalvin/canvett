import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { JobProvider } from './context/JobContext'
import { ActivityProvider } from './context/ActivityContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Register from './pages/Register'
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
import AppLayout from './components/layout/AppLayout'
const Dashboard = lazy(() => import('./pages/Dashboard'))
const JobPostings = lazy(() => import('./pages/JobPostings'))
const UploadResumes = lazy(() => import('./pages/UploadResumes'))
const CandidateRanking = lazy(() => import('./pages/CandidateRanking'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Settings = lazy(() => import('./pages/Settings'))
import SeekerLayout from './components/layout/SeekerLayout'
const JobBoard = lazy(() => import('./pages/seeker/JobBoard'))
const JobDetail = lazy(() => import('./pages/seeker/JobDetail'))
const ApplyToJob = lazy(() => import('./pages/seeker/ApplyToJob'))
const MyApplications = lazy(() => import('./pages/seeker/MyApplications'))
const SeekerProfile = lazy(() => import('./pages/seeker/SeekerProfile'))
const SavedJobs = lazy(() => import('./pages/seeker/SavedJobs'))
const RecruiterProfile = lazy(() => import('./pages/RecruiterProfile'))
const About = lazy(() => import('./pages/About'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
import NotFound from './pages/NotFound'

function PageFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <span className="h-6 w-6 rounded-full border-2 border-accent/30 border-t-accent animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

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
              <Route path="*" element={<NotFound />} />
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
        <Route path="*" element={<NotFound />} />
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

// A readable <title> per route so browser tabs, history and shared links are
// meaningful (e.g. "Jobs · Canvett").
const TITLES = [
  ['/login', 'Sign in'],
  ['/register', 'Create account'],
  ['/forgot-password', 'Forgot password'],
  ['/reset-password', 'Reset password'],
  ['/about', 'About'],
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Use'],
  ['/dashboard', 'Dashboard'],
  ['/jobs', 'Job postings'],
  ['/upload', 'Upload resumes'],
  ['/ranking', 'Candidates'],
  ['/analytics', 'Analytics'],
  ['/settings', 'Settings'],
  ['/profile', 'Profile'],
  ['/seeker/jobs', 'Jobs'],
  ['/seeker/saved', 'Saved jobs'],
  ['/seeker/applications', 'My applications'],
  ['/seeker/profile', 'Profile'],
]
function DocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    let label = null
    if (pathname.startsWith('/seeker/jobs/') && pathname.endsWith('/apply')) label = 'Apply'
    else if (pathname.startsWith('/seeker/jobs/')) label = 'Job details'
    else {
      const match = TITLES.filter(([prefix]) => pathname === prefix || pathname.startsWith(prefix + '/'))
        .sort((a, b) => b[0].length - a[0].length)[0]
      label = match ? match[1] : null
    }
    document.title = label ? `${label} · Canvett` : 'Canvett — AI-Powered Resume Ranking'
  }, [pathname])
  return null
}

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Landing />
  return <Navigate to={user.role === 'recruiter' ? '/dashboard' : '/seeker/jobs'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <DocumentTitle />
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
