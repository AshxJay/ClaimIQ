import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/api'
import type { Claim } from '@/types/claim'
import { mapClaim } from '@/lib/claimMapper'

export function useClaimDetail(
  claimId: string | undefined,
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  const { enabled = true, staleTime = 30_000 } = options
  return useQuery<Claim>({
    queryKey: ['claim', claimId],
    queryFn: async () => {
      const response = await get<Record<string, unknown>>(`/claims/${claimId}`)
      return mapClaim(response.data)
    },
    enabled: enabled && !!claimId,
    staleTime,
  })
}