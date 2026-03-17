import { useEffect, useRef, useCallback } from 'react'
import type { Claim } from '@/types/claim'

type ClaimUpdateHandler = (claim: Partial<Claim>) => void

const POLLING_INTERVAL = 10_000

/**
 * websocket.ts — WebSocket + polling fallback.
 *
 * Connects to VITE_WS_URL if available.
 * Falls back to polling GET /claims/:id every 10s.
 * Ready to wire to AWS API Gateway WebSocket or SNS → Lambda → WS push.
 */

export function useClaimUpdates(claimId: string, onUpdate: ClaimUpdateHandler) {
  const wsRef = useRef<WebSocket | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  const startPolling = useCallback(() => {
    if (pollingRef.current) return
    pollingRef.current = setInterval(async () => {
      try {
        const { get } = await import('@/lib/api')
        const response = await get<Partial<Claim>>(`/claims/${claimId}/status`)
        onUpdateRef.current(response.data)
      } catch {
        // silent fail
      }
    }, POLLING_INTERVAL)
  }, [claimId])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL
    if (!wsUrl) {
      startPolling()
      return
    }

    try {
      const ws = new WebSocket(`${wsUrl}/claims/${claimId}`)
      wsRef.current = ws

      ws.onopen = () => {
        stopPolling()
        ws.send(JSON.stringify({ action: 'subscribe', claimId }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as Partial<Claim>
          onUpdateRef.current(data)
        } catch {
          // ignore malformed messages
        }
      }

      ws.onerror = () => {
        startPolling()
      }

      ws.onclose = () => {
        startPolling()
      }
    } catch {
      startPolling()
    }

    return () => {
      wsRef.current?.close()
      stopPolling()
    }
  }, [claimId, startPolling, stopPolling])
}

// Notification WebSocket
type NotificationHandler = (notification: Record<string, unknown>) => void

export function useNotificationSocket(userId: string, onNotification: NotificationHandler) {
  const wsRef = useRef<WebSocket | null>(null)
  const handlerRef = useRef(onNotification)
  handlerRef.current = onNotification

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL
    if (!wsUrl) return

    try {
      const ws = new WebSocket(`${wsUrl}/notifications/${userId}`)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as Record<string, unknown>
          handlerRef.current(data)
        } catch {
          // ignore
        }
      }
    } catch {
      // WS not available
    }

    return () => wsRef.current?.close()
  }, [userId])
}
