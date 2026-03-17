import { subDays, format } from 'date-fns'
import type { ClaimsAnalytics, PolicyholderStats } from '@/types/api'
import { mockClaims } from './claims'

function generateDailyMetrics(days: number, baseValue: number, variance: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd'),
    value: Math.max(0, baseValue + Math.floor((Math.random() - 0.5) * variance)),
  }))
}

export const mockAnalytics: ClaimsAnalytics = {
  totalClaims: 247,
  activeClaims: 89,
  resolvedThisMonth: 34,
  avgResolutionDays: 8.4,
  approvalRate: 72.3,
  totalApprovedAmount: 1_450_000,
  claimsByType: {
    auto: 87,
    home: 64,
    health: 48,
    life: 12,
    travel: 22,
    business: 10,
    liability: 4,
  },
  claimsByStatus: {
    draft: 5,
    submitted: 32,
    under_review: 89,
    pending_info: 18,
    approved: 89,
    rejected: 12,
    closed: 2,
  },
  dailySubmissions: generateDailyMetrics(90, 4, 6),
  dailyResolutions: generateDailyMetrics(90, 3, 5),
  resolutionTrend: generateDailyMetrics(90, 8, 4),
  fraudFlagged: 14,
  avgFraudScore: 18.7,
}

export const mockPolicyholderStats: PolicyholderStats = {
  activeClaims: 2,
  underReview: 1,
  totalClaimed: 66350,
  lifetimeApproved: 16700,
  recentClaims: mockClaims.slice(0, 4),
}

export const mockCloudWatchMetrics = {
  apiLatencyMs: 145,
  s3UploadSuccessRate: 99.8,
  ecsHealthy: true,
  rdsConnectionCount: 23,
  timestamp: new Date().toISOString(),
}
