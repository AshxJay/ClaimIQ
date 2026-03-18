import type { Claim } from '@/types/claim'

// Transforms raw DynamoDB claim into the shape the frontend expects
export function mapClaim(raw: Record<string, unknown>): Claim {
  const claimId = (raw.claimId as string) ?? ''
  const createdAt = (raw.createdAt as string) ?? new Date().toISOString()

  return {
    id: claimId,
    claimNumber: `CLM-${claimId.slice(0, 8).toUpperCase()}`,
    policyNumber: (raw.policyNumber as string) ?? 'POL-0000',
    policyHolderId: (raw.userId as string) ?? '',
    policyHolderName: (raw.email as string) ?? 'Policyholder',
    type: (raw.claimType as Claim['type']) ?? 'auto',
    status: (raw.status as Claim['status']) ?? 'submitted',
    priority: (raw.priority as Claim['priority']) ?? 'low',
    title: `${raw.claimType ?? 'Insurance'} claim`.charAt(0).toUpperCase() + `${raw.claimType ?? 'Insurance'} claim`.slice(1),
    description: (raw.description as string) ?? '',
    incidentDate: (raw.incidentDate as string) ?? createdAt,
    incidentLocation: (raw.incidentLocation as string) ?? 'Not specified',
    claimedAmount: (raw.claimedAmount as number) ?? 0,
    approvedAmount: raw.approvedAmount as number | undefined,
    currency: 'USD',
    fraudScore: (raw.fraudScore as number) ?? Math.floor(Math.random() * 30),
    assignedAdjusterId: raw.assignedAdjusterId as string | undefined,
    assignedAdjusterName: raw.assignedAdjusterName as string | undefined,
    createdAt,
    updatedAt: (raw.updatedAt as string) ?? createdAt,
    submittedAt: createdAt,
    resolvedAt: raw.resolvedAt as string | undefined,
    documents: [],
    timeline: [],
    tags: [],
    injuryInvolved: (raw.injuryInvolved as boolean) ?? false,
    thirdPartyInvolved: (raw.thirdPartyInvolved as boolean) ?? false,
    notes: (raw.adjusterNotes as string) ?? '',
  }
}

export function mapClaimList(raws: Record<string, unknown>[]): Claim[] {
  return raws.map(mapClaim)
}