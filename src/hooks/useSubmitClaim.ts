import { useMutation, useQueryClient } from '@tanstack/react-query'
import { post } from '@/lib/api'
import type { Claim, ClaimDraft } from '@/types/claim'
import { toast } from 'sonner'

interface SubmitClaimPayload {
  policyNumber: string
  type: string
  incidentDate: string
  incidentLocation: string
  description: string
  claimedAmount: number
  injuryInvolved: boolean
  thirdPartyInvolved?: boolean
  documentIds?: string[]
}

export function useSubmitClaim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SubmitClaimPayload) => {
      const response = await post<Claim>('/claims', payload)
      return response.data
    },
    onSuccess: (newClaim) => {
      // Optimistic: invalidate claims list
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.setQueryData(['claim', newClaim.id], newClaim)
      toast.success('Claim submitted successfully', {
        description: `Claim #${newClaim.claimNumber} has been created.`,
      })
      // Clear draft
      localStorage.removeItem('claimiq-draft')
    },
    onError: (error) => {
      console.error('[useSubmitClaim] API Error:', error)
      toast.error('Failed to submit claim', {
        description: 'Please try again or contact support.',
      })
    },
  })
}

// Draft auto-save utility
export function saveDraft(draft: ClaimDraft): void {
  localStorage.setItem(
    'claimiq-draft',
    JSON.stringify({ ...draft, savedAt: new Date().toISOString() }),
  )
}

export function loadDraft(): ClaimDraft | null {
  try {
    const raw = localStorage.getItem('claimiq-draft')
    return raw ? (JSON.parse(raw) as ClaimDraft) : null
  } catch {
    return null
  }
}

export function clearDraft(): void {
  localStorage.removeItem('claimiq-draft')
}
