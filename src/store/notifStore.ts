import { create } from 'zustand'

export type NotificationType = 'email' | 'sms' | 'in_app' | 'system'
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error'

export interface AppNotification {
  id: string
  type: NotificationType
  severity: NotificationSeverity
  title: string
  body: string
  timestamp: string
  read: boolean
  claimId?: string
  actionUrl?: string
}

interface NotifState {
  notifications: AppNotification[]
  unreadCount: number

  setNotifications: (notifications: AppNotification[]) => void
  addNotification: (n: AppNotification) => void
  markRead: (id: string) => void
  markAllRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
}

export const useNotifStore = create<NotifState>()((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),

  addNotification: (n) =>
    set((state) => {
      const updated = [n, ...state.notifications]
      return {
        notifications: updated,
        unreadCount: updated.filter((x) => !x.read).length,
      }
    }),

  markRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      )
      return { notifications: updated, unreadCount: updated.filter((n) => !n.read).length }
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  deleteNotification: (id) =>
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id)
      return { notifications: updated, unreadCount: updated.filter((n) => !n.read).length }
    }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))
