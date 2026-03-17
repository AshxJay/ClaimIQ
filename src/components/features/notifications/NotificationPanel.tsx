import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, BellOff, Mail, Phone, Check, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useUIStore } from '@/store/uiStore'
import { useNotifStore } from '@/store/notifStore'
import type { AppNotification, NotificationType } from '@/store/notifStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const typeIcons: Record<NotificationType, React.ReactNode> = {
  email: <Mail size={14} />,
  sms: <Phone size={14} />,
  in_app: <Bell size={14} />,
  system: <Bell size={14} />,
}

const severityStyles = {
  info: 'bg-brand-blue/10 text-brand-blue',
  success: 'bg-status-success/10 text-status-success',
  warning: 'bg-status-warning/10 text-status-warning',
  error: 'bg-status-danger/10 text-status-danger',
}

function NotifItem({ notif, onRead, onDelete }: { notif: AppNotification; onRead: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'relative flex gap-3 p-4 rounded-xl border transition-all duration-150 group',
        notif.read
          ? 'bg-bg-card border-border-subtle'
          : 'bg-brand-blue/5 border-brand-blue/15',
      )}
    >
      {/* Type icon */}
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', severityStyles[notif.severity])}>
        {typeIcons[notif.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm font-medium', notif.read ? 'text-text-secondary' : 'text-text-primary')}>
            {notif.title}
          </p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {!notif.read && (
              <button onClick={() => onRead(notif.id)} className="p-1 rounded-md hover:bg-bg-elevated text-text-muted hover:text-status-success" title="Mark as read">
                <Check size={12} />
              </button>
            )}
            <button onClick={() => onDelete(notif.id)} className="p-1 rounded-md hover:bg-bg-elevated text-text-muted hover:text-status-danger" title="Delete">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{notif.body}</p>
        <p className="text-2xs text-text-muted mt-1 font-mono">{format(new Date(notif.timestamp), 'MMM d, h:mm a')}</p>
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-brand-blue" />
      )}
    </motion.div>
  )
}

export function NotificationPanel() {
  const { notificationPanelOpen, closeNotificationPanel } = useUIStore()
  const { notifications, markRead, markAllRead, deleteNotification } = useNotifStore()

  const today = notifications.filter(
    (n) => new Date(n.timestamp).toDateString() === new Date().toDateString(),
  )
  const earlier = notifications.filter(
    (n) => new Date(n.timestamp).toDateString() !== new Date().toDateString(),
  )

  return (
    <AnimatePresence>
      {notificationPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={closeNotificationPanel}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-40 bg-bg-surface border-l border-border-subtle flex flex-col shadow-floating"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
              <div>
                <h2 className="font-display font-semibold text-text-primary">Notifications</h2>
                <p className="text-xs text-text-muted">{notifications.filter(n => !n.read).length} unread</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={markAllRead} leftIcon={<BellOff size={14} />}>
                  Mark all read
                </Button>
                <button onClick={closeNotificationPanel} className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {today.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Today</p>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {today.map((n) => (
                        <NotifItem key={n.id} notif={n} onRead={markRead} onDelete={deleteNotification} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {earlier.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Earlier</p>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {earlier.map((n) => (
                        <NotifItem key={n.id} notif={n} onRead={markRead} onDelete={deleteNotification} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Bell size={32} className="text-text-muted mb-3" />
                  <p className="text-text-secondary font-medium text-sm">No notifications yet</p>
                  <p className="text-text-muted text-xs mt-1">You're all caught up!</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
