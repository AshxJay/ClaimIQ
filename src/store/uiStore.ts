import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type RowDensity = 'compact' | 'comfortable' | 'spacious'

interface UIState {
  sidebarCollapsed: boolean
  activeModal: string | null
  modalData: Record<string, unknown>
  rowDensity: RowDensity
  notificationPanelOpen: boolean

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openModal: (id: string, data?: Record<string, unknown>) => void
  closeModal: () => void
  setRowDensity: (density: RowDensity) => void
  toggleNotificationPanel: () => void
  closeNotificationPanel: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      activeModal: null,
      modalData: {},
      rowDensity: 'comfortable',
      notificationPanelOpen: false,

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      openModal: (id, data = {}) => set({ activeModal: id, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: {} }),
      setRowDensity: (density) => set({ rowDensity: density }),
      toggleNotificationPanel: () =>
        set((state) => ({ notificationPanelOpen: !state.notificationPanelOpen })),
      closeNotificationPanel: () => set({ notificationPanelOpen: false }),
    }),
    {
      name: 'claimiq-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        rowDensity: state.rowDensity,
      }),
    },
  ),
)
