import { http, HttpResponse, delay } from 'msw'

export const authHandlers = [
  http.post('*/auth/login', async ({ request }) => {
    await delay(600)
    const body = await request.json() as { email: string; password: string }

    if (!body.email || !body.password) {
      return HttpResponse.json(
        { error: 'Email and password are required', code: 'MISSING_CREDENTIALS' },
        { status: 400 },
      )
    }

    if (body.password.length < 6) {
      return HttpResponse.json(
        { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 },
      )
    }

    const isAdjuster =
      body.email.toLowerCase().includes('adjuster') ||
      body.email.toLowerCase().includes('divak')

    const token = isAdjuster
      ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTAwMiIsImVtYWlsIjoiZGl2YWtAZ21haWwuY29tIiwiZ2l2ZW5fbmFtZSI6IkRpdmFrIiwiZmFtaWx5X25hbWUiOiIiLCJjdXN0b206cm9sZSI6ImFkanVzdGVyIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.mock'
      : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTAwMSIsImVtYWlsIjoiYXNodXRvc2hAZ21haWwuY29tIiwiZ2l2ZW5fbmFtZSI6IkFzaHV0b3NoIiwiZmFtaWx5X25hbWUiOiIiLCJjdXN0b206cm9sZSI6InBvbGljeWhvbGRlciIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ==.mock'

    return HttpResponse.json({
      data: {
        token,
        refreshToken: `refresh-${Date.now()}`,
        mfaRequired: false,
      },
      success: true,
      timestamp: new Date().toISOString(),
    })
  }),

  http.post('*/auth/mfa/verify', async () => {
    await delay(500)
    return HttpResponse.json({
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTAwMSIsImVtYWlsIjoiYXNodXRvc2hAZ21haWwuY29tIiwiZ2l2ZW5fbmFtZSI6IkFzaHV0b3NoIiwiZmFtaWx5X25hbWUiOiIiLCJjdXN0b206cm9sZSI6InBvbGljeWhvbGRlciIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ==.mock',
        refreshToken: `refresh-${Date.now()}`,
      },
      success: true,
      timestamp: new Date().toISOString(),
    })
  }),

  http.post('*/auth/refresh', async () => {
    await delay(200)
    return HttpResponse.json({
      data: {
        token: `mock-refreshed-token-${Date.now()}`,
      },
      success: true,
      timestamp: new Date().toISOString(),
    })
  }),

  http.post('*/auth/logout', async () => {
    await delay(100)
    return HttpResponse.json({ success: true, timestamp: new Date().toISOString() })
  }),
]
