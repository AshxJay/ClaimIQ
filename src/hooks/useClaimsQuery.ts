import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/api'
import type { Claim, ClaimFilters } from '@/types/claim'
import type { PaginatedResponse } from '@/types/api'
import { mapClaimList } from '@/lib/claimMapper'

export function useClaimsQuery(
  filters: ClaimFilters = {},
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  const { enabled = true, staleTime = 30_000 } = options
  return useQuery<PaginatedResponse<Claim>>({
    queryKey: ['claims', filters],
    queryFn: async () => {
      const response = await get<Record<string, unknown>[]>('/claims')
      const claims = mapClaimList(response.data ?? [])
      return {
        success: true,
        data: claims,
        total: claims.length,
        page: 1,
        pageSize: claims.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        message: 'OK',
      }
    },
    enabled,
    staleTime,
    placeholderData: (prev) => prev,
  })
}