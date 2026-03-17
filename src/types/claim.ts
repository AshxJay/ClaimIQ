export type ClaimStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'pending_info'
  | 'approved'
  | 'rejected'
  | 'closed'

export type ClaimType =
  | 'auto'
  | 'home'
  | 'health'
  | 'life'
  | 'travel'
  | 'business'
  | 'liability'

export type ClaimPriority = 'low' | 'medium' | 'high' | 'critical'

export interface ClaimTimeline {
  id: string
  claimId: string
  event: string
  description: string
  actor: string
  actorRole: 'policyholder' | 'adjuster' | 'system'
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface ClaimDocument {
  id: string
  claimId: string
  name: string
  type: string
  size: number
  s3Key: string
  signedUrl: string
  uploadedAt: string
  uploadedBy: string
  encrypted: boolean
  thumbnailUrl?: string
}

export interface Claim {
  id: string
  claimNumber: string
  policyNumber: string
  policyHolderId: string
  policyHolderName: string
  type: ClaimType
  status: ClaimStatus
  priority: ClaimPriority
  title: string
  description: string
  incidentDate: string
  incidentLocation: string
  claimedAmount: number
  approvedAmount?: number
  currency: string
  fraudScore?: number
  assignedAdjusterId?: string
  assignedAdjusterName?: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
  resolvedAt?: string
  documents?: ClaimDocument[]
  timeline?: ClaimTimeline[]
  tags?: string[]
  injuryInvolved?: boolean
  thirdPartyInvolved?: boolean
  notes?: string
}

export interface ClaimFilters {
  status?: ClaimStatus[]
  type?: ClaimType[]
  priority?: ClaimPriority[]
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  search?: string
  assignedAdjusterId?: string
  page?: number
  pageSize?: number
  sortBy?: keyof Claim
  sortOrder?: 'asc' | 'desc'
}

export interface ClaimDraft {
  policyNumber?: string
  type?: ClaimType
  incidentDate?: string
  incidentLocation?: string
  description?: string
  claimedAmount?: number
  injuryInvolved?: boolean
  documents?: File[]
  savedAt?: string
  step?: number
}

export type DecisionReason =
  | 'valid_claim'
  | 'policy_coverage'
  | 'insufficient_documentation'
  | 'policy_exclusion'
  | 'fraud_suspected'
  | 'duplicate_claim'
  | 'claim_limit_exceeded'
  | 'out_of_coverage_period'
  | 'requires_additional_info'
