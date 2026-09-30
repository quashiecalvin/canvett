import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Shown for any unknown route instead of silently redirecting. Renders inside
// whichever layout is active, so it inherits the app chrome for signed-in users.
export default function NotFound() {
  const { isAuthenticated, isRecruiter } = useAuth()
  const home = !isAuthenticated ? '/login' : isRecruiter ? '/dashboard' : '/seeker/jobs'
  const homeLabel = !isAuthenticated ? 'Go to sign in' : 'Back to home'

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-16">
      <p className="font-outfit text-[64px] leading-none font-bold text-accent/80">404</p>
      <h1 className="font-outfit text-[22px] font-semibold text-text-body mt-4">Page not found</h1>
      <p className="text-[14px] text-text-muted mt-2 max-w-sm">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to={home}
        className="mt-7 inline-flex items-center justify-center h-11 px-6 rounded-btn bg-[#2563EB] text-white text-[14px] font-semibold hover:bg-[#1D4ED8] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
      >
        {homeLabel}
      </Link>
    </div>
  )
}
