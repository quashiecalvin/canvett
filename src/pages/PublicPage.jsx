import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppLayout from '../components/layout/AppLayout'
import SeekerLayout from '../components/layout/SeekerLayout'
import PublicLayout from '../components/layout/PublicLayout'

// About / Privacy adapt to who's viewing:
//  - a signed-in recruiter or seeker gets the full app shell - their familiar
//    top bar (theme, notifications, profile menu) and the sidebar to navigate
//    back to the dashboard / job board - so nothing feels stripped-down.
//  - a logged-out visitor gets a slim public header (logo + theme + Sign in).
export default function PublicPage({ children }) {
  const { loading, isRecruiter, isSeeker } = useAuth()
  const { pathname } = useLocation()

  // Always open these pages at the top, even when the footer link that brought
  // you here sat at the bottom of the previous page.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (loading) return null
  if (isRecruiter) return <AppLayout>{children}</AppLayout>
  if (isSeeker) return <SeekerLayout>{children}</SeekerLayout>
  return <PublicLayout>{children}</PublicLayout>
}
