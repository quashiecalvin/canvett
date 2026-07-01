import Sidebar from './Sidebar'

export default function AppLayout({ activePage, onNavigate, children }) {
  return (
    <div className="flex h-screen bg-bg-page overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}