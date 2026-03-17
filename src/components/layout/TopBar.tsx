import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, X, Command } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useNotifStore } from '@/store/notifStore'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { unreadCount } = useNotifStore()
  const { toggleNotificationPanel } = useUIStore()
  const { user } = useAuthStore()
  const prevUnread = useRef(unreadCount)

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((p) => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const hadNewNotif = unreadCount > prevUnread.current
  useEffect(() => { prevUnread.current = unreadCount }, [unreadCount])

  return (
    <header className="h-16 flex items-center gap-4 px-6 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-sm shrink-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative flex items-center"
            >
              <Search size={15} className="absolute left-3 text-text-muted" />
              <input
                ref={searchRef}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search claims, policies, documents…"
                className="w-full bg-bg-card border border-brand-blue rounded-xl py-2 pl-9 pr-9 text-sm text-text-primary placeholder-text-muted outline-none shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { setSearchOpen(false); setSearchValue('') }
                  if (e.key === 'Enter' && searchValue) {
                    navigate(`/my-claims?search=${encodeURIComponent(searchValue)}`)
                    setSearchOpen(false)
                    setSearchValue('')
                  }
                }}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchValue('') }}
                className="absolute right-3 text-text-muted hover:text-text-primary"
              >
                <X size={14} />
              </button>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-card border border-border-subtle text-text-muted hover:text-text-primary hover:border-border-DEFAULT transition-all text-sm w-full max-w-xs"
              aria-label="Open search"
            >
              <Search size={14} />
              <span className="flex-1 text-left">Search…</span>
              <div className="flex items-center gap-0.5 bg-bg-elevated px-1.5 py-0.5 rounded-md border border-border-subtle">
                <Command size={10} />
                <span className="text-xs">K</span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notification bell */}
        <motion.button
          onClick={toggleNotificationPanel}
          className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label={`Notifications (${unreadCount} unread)`}
          whileTap={{ scale: 0.9 }}
        >
          <Bell size={20} />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key={unreadCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: hadNewNotif ? [1.4, 1] : 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-status-danger text-white text-2xs flex items-center justify-center px-1 font-bold"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* User avatar */}
        {user && (
          <Avatar name={user.fullName} size="sm" className="cursor-pointer" />
        )}
      </div>
    </header>
  )
}
