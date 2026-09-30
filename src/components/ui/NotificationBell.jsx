import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../lib/api'

function timeAgo(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  const load = useCallback(async () => {
    try {
      const data = await getNotifications()
      setItems(data.items || [])
      setUnread(data.unread || 0)
    } catch {
      /* stay quiet on a transient fetch failure */
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [load])

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function openPanel() {
    const next = !open
    setOpen(next)
  }

  async function handleClick(n) {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      setUnread((u) => Math.max(0, u - 1))
      try { await markNotificationRead(n.id) } catch { /* ignore */ }
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })))
    setUnread(0)
    try { await markAllNotificationsRead() } catch { /* ignore */ }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openPanel}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-bg-subtle hover:text-text-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[320px] max-w-[calc(100vw-32px)] rounded-card border border-border bg-bg-surface shadow-xl z-30 anim-pop overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-[13px] font-semibold text-text-primary">Notifications</span>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="flex items-center gap-1 text-[11.5px] font-medium text-accent hover:underline focus-visible:outline-none focus-visible:underline">
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={22} className="mx-auto text-text-hint" />
                <p className="mt-2 text-[13px] text-text-muted">No notifications yet</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex w-full gap-2.5 px-4 py-3 text-left border-b border-border last:border-0 transition-colors hover:bg-bg-subtle ${n.read ? '' : 'bg-accent-tint/40'}`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-accent'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-semibold text-text-primary">{n.title}</span>
                    {n.body && <span className="block text-[12px] leading-snug text-text-muted mt-0.5">{n.body}</span>}
                    <span className="block text-[11px] text-text-hint mt-1">{timeAgo(n.created_at)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
