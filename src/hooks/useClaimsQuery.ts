import { useQuery } from '@tanstack/react-query'
import { getPaginated } from '@/lib/api'
import type { Claim, ClaimFilters } from '@/types/claim'
import type { PaginatedResponse } from '@/types/api'

export function useClaimsQuery(
  filters: ClaimFilters = {},
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  const { enabled = true, staleTime = 30_000 } = options

  return useQuery<PaginatedResponse<Claim>>({
    queryKey: ['claims', filters],
    queryFn: () =>
      getPaginated<Claim>('/claims', {
        ...filters,
        status: filters.status?.join(','),
        type: filters.type?.join(','),
        priority: filters.priority?.join(','),
      }),
    enabled,
    staleTime,
    placeholderData: (prev) => prev,
  })
}
