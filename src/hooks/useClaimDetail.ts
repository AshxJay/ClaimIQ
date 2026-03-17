import { useQuery } from '@tanstack/react-query'
import { get } from '@/lib/api'
import type { Claim } from '@/types/claim'

export function useClaimDetail(
  claimId: string | undefined,
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  const { enabled = true, staleTime = 30_000 } = options

  return useQuery<Claim>({
    queryKey: ['claim', claimId],
    queryFn: async () => {
      const response = await get<Claim>(`/claims/${claimId}`)
      return response.data
    },
    enabled: enabled && !!claimId,
    staleTime,
  })
}
