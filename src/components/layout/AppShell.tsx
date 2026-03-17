import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ModalProvider } from '@/components/ui/Modal'
import { NotificationPanel } from '@/components/features/notifications/NotificationPanel'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export function AppShell() {
  const { sidebarCollapsed } = useUIStore()
  const location = useLocation()

  return (
    <ModalProvider>
      <div className="flex h-screen w-full bg-bg-deep overflow-hidden font-sans selection:bg-brand-blue/30 selection:text-text-primary">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar />

          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="min-h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Notification panel (slide-in from right) */}
        <NotificationPanel />
      </div>
    </ModalProvider>
  )
}
