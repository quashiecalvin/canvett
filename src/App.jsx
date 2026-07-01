import { useState } from 'react'
import AppLayout from './components/layout/AppLayout'

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <AppLayout activePage={activePage} onNavigate={setActivePage}>
      <div className="p-8 text-text-primary">
        Active page: {activePage}
      </div>
    </AppLayout>
  )
}