import { useMutation, useQueryClient } from '@tanstack/react-query'
import { patch } from '@/lib/api'
import type { Claim, ClaimStatus, DecisionReason } from '@/types/claim'
import { toast } from 'sonner'

interface UpdateClaimStatusPayload {
  claimId: string
  status: ClaimStatus
  approvedAmount?: number
  reason?: DecisionReason
  notes?: string
}

export function useUpdateClaimStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateClaimStatusPayload) => {
      const { claimId, ...body } = payload
      const response = await patch<Claim>(`/claims/${claimId}/status`, body)
      return response.data
    },

    onMutate: async (payload) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['claim', payload.claimId] })
      const prev = queryClient.getQueryData<Claim>(['claim', payload.claimId])

      queryClient.setQueryData<Claim>(['claim', payload.claimId], (old) =>
        old
          ? {
              ...old,
              status: payload.status,
              approvedAmount: payload.approvedAmount ?? old.approvedAmount,
              updatedAt: new Date().toISOString(),
            }
          : old,
      )

      return { prev }
    },

    onError: (_err, payload, context) => {
      // Rollback optimistic update
      if (context?.prev) {
        queryClient.setQueryData(['claim', payload.claimId], context.prev)
      }
      toast.error('Failed to update claim status')
    },

    onSuccess: (updatedClaim) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.setQueryData(['claim', updatedClaim.id], updatedClaim)

      const statusMessages: Partial<Record<ClaimStatus, string>> = {
        approved: 'Claim approved and policyholder notified.',
        rejected: 'Claim rejected and policyholder notified.',
        pending_info: 'Additional information requested from policyholder.',
        under_review: 'Claim moved back to review queue.',
      }

      toast.success(`Status updated to ${updatedClaim.status}`, {
        description: statusMessages[updatedClaim.status],
      })
    },
  })
}
