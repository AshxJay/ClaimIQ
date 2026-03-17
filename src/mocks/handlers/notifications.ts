import { http, HttpResponse, delay } from 'msw'
import { mockNotifications } from '../data/notifications'
import type { AppNotification } from '@/store/notifStore'

const notifications = [...mockNotifications]

export const notificationsHandlers = [
  http.get('*/notifications', async () => {
    await delay(200)
    return HttpResponse.json({
      data: notifications,
      total: notifications.length,
      page: 1,
      pageSize: 50,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    })
  }),

  http.patch('*/notifications/:id/read', async ({ params }) => {
    await delay(100)
    const notif = notifications.find((n) => n.id === params.id)
    if (notif) notif.read = true
    return HttpResponse.json({ success: true, timestamp: new Date().toISOString() })
  }),

  http.patch('*/notifications/read-all', async () => {
    await delay(100)
    notifications.forEach((n) => (n.read = true))
    return HttpResponse.json({ success: true, timestamp: new Date().toISOString() })
  }),

  http.delete('*/notifications/:id', async ({ params }) => {
    await delay(100)
    const idx = notifications.findIndex((n) => n.id === params.id)
    if (idx !== -1) notifications.splice(idx, 1)
    return HttpResponse.json({ success: true, timestamp: new Date().toISOString() })
  }),

  // Server-sent notification (for demo purposes — called by UI to simulate a new notif)
  http.post('*/notifications/simulate', async () => {
    await delay(100)
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'in_app',
      severity: 'info',
      title: 'Update on your claim',
      body: 'Your claim status has been updated by the adjuster.',
      timestamp: new Date().toISOString(),
      read: false,
    }
    notifications.unshift(newNotif)
    return HttpResponse.json({
      data: newNotif,
      success: true,
      timestamp: new Date().toISOString(),
    })
  }),
]
