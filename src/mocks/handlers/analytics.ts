import { http, HttpResponse, delay } from 'msw'
import { mockAnalytics, mockPolicyholderStats, mockCloudWatchMetrics } from '../data/analytics'

export const analyticsHandlers = [
  http.get('*/analytics/dashboard', async () => {
    await delay(300)
    return HttpResponse.json({
      data: mockAnalytics,
      success: true,
      timestamp: new Date().toISOString(),
    })
  }),

  http.get('*/analytics/policyholder', async () => {
    await delay(300)
    return HttpResponse.json({
      data: mockPolicyholderStats,
      success: true,
      timestamp: new Date().toISOString(),
    })
  }),

  http.get('*/analytics/cloudwatch', async () => {
    await delay(150)
    return HttpResponse.json({
      data: {
        ...mockCloudWatchMetrics,
        apiLatencyMs: 120 + Math.floor(Math.random() * 60),
        rdsConnectionCount: 20 + Math.floor(Math.random() * 10),
        timestamp: new Date().toISOString(),
      },
      success: true,
      timestamp: new Date().toISOString(),
    })
  }),
]
