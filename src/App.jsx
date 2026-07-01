import { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <AppLayout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' && <Dashboard />}
    </AppLayout>
  )
}