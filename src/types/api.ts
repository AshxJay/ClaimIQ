export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
  statusCode: number
  timestamp: string
  requestId?: string
}

export interface AnalyticsMetric {
  label: string
  value: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'flat'
  sparkline?: number[]
}

export interface DailyMetric {
  date: string
  value: number
}

export interface ClaimsAnalytics {
  totalClaims: number
  activeClaims: number
  resolvedThisMonth: number
  avgResolutionDays: number
  approvalRate: number
  totalApprovedAmount: number
  claimsByType: Record<string, number>
  claimsByStatus: Record<string, number>
  dailySubmissions: DailyMetric[]
  dailyResolutions: DailyMetric[]
  resolutionTrend: DailyMetric[]
  fraudFlagged: number
  avgFraudScore: number
}

export interface PolicyholderStats {
  activeClaims: number
  underReview: number
  totalClaimed: number
  lifetimeApproved: number
  recentClaims: import('./claim').Claim[]
}

export interface CloudWatchMetrics {
  apiLatencyMs: number
  s3UploadSuccessRate: number
  ecsHealthy: boolean
  rdsConnectionCount: number
  timestamp: string
}
