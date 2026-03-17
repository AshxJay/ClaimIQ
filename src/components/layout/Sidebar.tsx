import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FolderOpen,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  BarChart3,
  Users,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useNotifStore } from '@/store/notifStore'
import { signOut } from '@/lib/auth'
import { Avatar } from '@/components/ui/Avatar'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const policyholderNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/my-claims', label: 'My Claims', icon: <FileText size={18} /> },
  { to: '/submit-claim', label: 'Submit Claim', icon: <PlusCircle size={18} /> },
  { to: '/documents', label: 'Documents', icon: <FolderOpen size={18} /> },
  { to: '/notifications', label: 'Notifications', icon: <Bell size={18} /> },
]

const adjusterNav: NavItem[] = [
  { to: '/adjuster/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/adjuster/queue', label: 'Claim Queue', icon: <ClipboardList size={18} /> },
  { to: '/adjuster/review', label: 'Review', icon: <Eye size={18} /> },
  { to: '/adjuster/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { to: '/adjuster/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
  { to: '/adjuster/team', label: 'Team', icon: <Users size={18} /> },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user, role } = useAuthStore()
  const { unreadCount } = useNotifStore()
  const navigate = useNavigate()

  const navItems = role === 'adjuster' ? adjusterNav : policyholderNav

  const handleLogout = async () => {
    await signOut()
    const { clearUser } = useAuthStore.getState()
    clearUser()
    navigate('/login')
  }

  return (
    <motion.aside
      layout
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col flex-shrink-0 bg-bg-surface border-r border-border-subtle z-20"
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border-subtle shrink-0',
        sidebarCollapsed ? 'justify-center' : 'gap-3',
      )}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center shrink-0 shadow-glow">
          <Shield size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="font-display font-bold text-base text-text-primary whitespace-nowrap"
            >
              ClaimIQ
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute top-[72px] -right-3 w-6 h-6 rounded-full bg-bg-elevated border border-border-DEFAULT',
          'text-text-muted hover:text-text-primary transition-colors z-30 flex items-center justify-center shadow-card',
        )}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Role badge */}
      <AnimatePresence>
        {!sidebarCollapsed && role && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pt-3 pb-1"
          >
            <span className={cn(
              'text-2xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md',
              role === 'adjuster' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-blue/10 text-brand-blue',
            )}>
              {role === 'adjuster' ? 'Adjuster Portal' : 'My Portal'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav items */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden" aria-label="Main navigation">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isBell = item.to.includes('notifications') && unreadCount > 0
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                      'transition-all duration-150 relative group',
                      isActive
                        ? 'bg-brand-blue/10 text-brand-blue'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
                      sidebarCollapsed && 'justify-center px-0',
                    )
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                  aria-label={item.label}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-xl bg-brand-blue/10"
                        />
                      )}
                      <span className="relative z-10 shrink-0">{item.icon}</span>
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative z-10 whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isBell && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            'relative z-10 ml-auto h-5 min-w-5 rounded-full bg-status-danger text-white text-xs flex items-center justify-center px-1',
                            sidebarCollapsed && 'absolute -top-1 -right-1 h-4 min-w-4 text-2xs',
                          )}
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border-subtle py-2 px-2 space-y-0.5">
        {[
          { icon: <Settings size={16} />, label: 'Settings', to: '/settings' },
          { icon: <HelpCircle size={16} />, label: 'Help', to: '/help' },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors',
              sidebarCollapsed && 'justify-center px-0',
            )}
            title={sidebarCollapsed ? item.label : undefined}
          >
            {item.icon}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}

        {/* User row */}
        <div className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2 mt-1 bg-bg-elevated border border-border-subtle',
          sidebarCollapsed && 'justify-center px-2',
        )}>
          <Avatar name={user?.fullName || 'User'} size="sm" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{user?.fullName}</p>
                <p className="text-2xs text-text-muted truncate capitalize">{role}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleLogout}
                className="p-1 rounded-lg text-text-muted hover:text-status-danger transition-colors"
                aria-label="Log out"
              >
                <LogOut size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
