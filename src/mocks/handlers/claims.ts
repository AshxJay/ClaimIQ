import { http, HttpResponse, delay } from 'msw'
import { mockClaims, mockClaimsSummary } from '../data/claims'
import type { Claim, ClaimStatus } from '@/types/claim'

const randomDelay = () => delay(200 + Math.random() * 600)

export const claimsHandlers = [
  // GET /claims — paginated list
  http.get('*/claims', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const search = url.searchParams.get('search')?.toLowerCase()
    const statusFilter = url.searchParams.get('status')?.split(',').filter(Boolean)

    let filtered = [...mockClaims]

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.claimNumber.toLowerCase().includes(search) ||
          c.policyHolderName.toLowerCase().includes(search) ||
          c.title.toLowerCase().includes(search),
      )
    }

    if (statusFilter?.length) {
      filtered = filtered.filter((c) => statusFilter.includes(c.status))
    }

    const start = (page - 1) * pageSize
    const paginated = filtered.slice(start, start + pageSize)

    return HttpResponse.json({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
      hasNext: start + pageSize < filtered.length,
      hasPrev: page > 1,
    })
  }),

  // GET /claims/:id
  http.get('*/claims/:id', async ({ params }) => {
    await randomDelay()
    const claim = mockClaims.find((c) => c.id === params.id)
    if (!claim) {
      return HttpResponse.json({ error: 'Claim not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: claim, success: true, timestamp: new Date().toISOString() })
  }),

  // POST /claims — submit new claim
  http.post('*/claims', async ({ request }) => {
    await randomDelay()
    const body = await request.json() as Partial<Claim>
    const newClaim: Claim = {
      id: `clm-${Date.now()}`,
      claimNumber: `CLM-2024-${String(mockClaims.length + 1).padStart(3, '0')}`,
      policyNumber: (body as Claim).policyNumber || '',
      policyHolderId: 'user-001',
      policyHolderName: 'Ashutosh',
      type: (body as Claim).type || 'auto',
      status: 'submitted',
      priority: 'medium',
      title: (body as Claim).title || 'New Claim',
      description: (body as Claim).description || '',
      incidentDate: (body as Claim).incidentDate || new Date().toISOString(),
      incidentLocation: (body as Claim).incidentLocation || '',
      claimedAmount: (body as Claim).claimedAmount || 0,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      injuryInvolved: (body as Claim).injuryInvolved || false,
      fraudScore: Math.floor(Math.random() * 20),
    }
    mockClaims.unshift(newClaim)
    return HttpResponse.json({ data: newClaim, success: true, timestamp: new Date().toISOString() }, { status: 201 })
  }),

  // PATCH /claims/:id/status — update status
  http.patch('*/claims/:id/status', async ({ params, request }) => {
    await randomDelay()
    const body = await request.json() as { status: ClaimStatus; approvedAmount?: number; notes?: string }
    const claimIdx = mockClaims.findIndex((c) => c.id === params.id)
    if (claimIdx === -1) {
      return HttpResponse.json({ error: 'Claim not found' }, { status: 404 })
    }
    const updated = {
      ...mockClaims[claimIdx],
      ...body,
      updatedAt: new Date().toISOString(),
      resolvedAt: ['approved', 'rejected'].includes(body.status) ? new Date().toISOString() : undefined,
    }
    mockClaims[claimIdx] = updated
    return HttpResponse.json({ data: updated, success: true, timestamp: new Date().toISOString() })
  }),

  // GET /claims/:id/status — for polling
  http.get('*/claims/:id/status', async ({ params }) => {
    await delay(100)
    const claim = mockClaims.find((c) => c.id === params.id)
    if (!claim) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    return HttpResponse.json({ data: { status: claim.status, updatedAt: claim.updatedAt }, success: true, timestamp: new Date().toISOString() })
  }),

  // POST /claims/:id/documents
  http.post('*/claims/:id/documents', async () => {
    await delay(800 + Math.random() * 1200) // Simulate S3 upload time
    return HttpResponse.json({
      data: {
        documentId: `doc-${Date.now()}`,
        s3Key: `uploads/${Date.now()}/document.pdf`,
        signedUrl: 'https://via.placeholder.com/800x1100',
      },
      success: true,
      timestamp: new Date().toISOString(),
    }, { status: 201 })
  }),

  // GET /policies/:number — policy lookup
  http.get('*/policies/:number', async ({ params }) => {
    await delay(400)
    const validPolicies: Record<string, { holderName: string; type: string; active: boolean }> = {
      'POL-AUTO-45821': { holderName: 'Ashutosh', type: 'Auto Insurance', active: true },
      'POL-HOME-78234': { holderName: 'Ashutosh', type: 'Home Insurance', active: true },
      'POL-HEALTH-12345': { holderName: 'Ashutosh', type: 'Health Insurance', active: true },
      'POL-TRAVEL-99001': { holderName: 'Marcus Johnson', type: 'Travel Insurance', active: false },
    }
    const policy = validPolicies[params.number as string]
    if (!policy) {
      return HttpResponse.json({ error: 'Policy not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: policy, success: true, timestamp: new Date().toISOString() })
  }),
]
