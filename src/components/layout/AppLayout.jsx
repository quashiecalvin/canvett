import Sidebar from './Sidebar'

export default function AppLayout({ activePage, onNavigate, children }) {
  return (
    <div className="flex min-h-screen bg-bg-page">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}