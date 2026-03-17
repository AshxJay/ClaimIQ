import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getPaginated } from '@/lib/api'
import { useNotifStore } from '@/store/notifStore'
import type { AppNotification } from '@/store/notifStore'

const POLL_INTERVAL = 30_000

export function useNotifications(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options
  const { setNotifications } = useNotifStore()

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await getPaginated<AppNotification>('/notifications', { pageSize: 50 })
      return response.data
    },
    enabled,
    staleTime: POLL_INTERVAL,
    refetchInterval: POLL_INTERVAL,
  })

  useEffect(() => {
    if (query.data) {
      setNotifications(query.data)
    }
  }, [query.data, setNotifications])

  return query
}
