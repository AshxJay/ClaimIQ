import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/api'
import type { ClaimsAnalytics, PolicyholderStats } from '@/types/api'

export function useAnalytics(options: { enabled?: boolean; staleTime?: number } = {}) {
  const { enabled = true, staleTime = 60_000 } = options

  return useQuery<ClaimsAnalytics>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await get<ClaimsAnalytics>('/analytics/dashboard')
      return response.data
    },
    enabled,
    staleTime,
  })
}

export function usePolicyholderStats(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options

  return useQuery<PolicyholderStats>({
    queryKey: ['analytics', 'policyholder'],
    queryFn: async () => {
      const response = await get<PolicyholderStats>('/analytics/policyholder')
      return response.data
    },
    enabled,
    staleTime: 30_000,
  })
}
