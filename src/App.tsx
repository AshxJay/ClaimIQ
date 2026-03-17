import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/authStore'
import { AppShell } from '@/components/layout/AppShell'
import type { UserRole } from '@/types/user'

// Lazy-loaded pages
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'))
const MFAPage = React.lazy(() => import('@/pages/auth/MFAPage'))
const OnboardingPage = React.lazy(() => import('@/pages/auth/OnboardingPage'))

// Policyholder
const PHDashboard = React.lazy(() => import('@/pages/policyholder/DashboardPage'))
const SubmitClaim = React.lazy(() => import('@/pages/policyholder/SubmitClaimPage'))
const ClaimList = React.lazy(() => import('@/pages/policyholder/ClaimListPage'))
const ClaimDetail = React.lazy(() => import('@/pages/policyholder/ClaimDetailPage'))

// Adjuster
const AdjDashboard = React.lazy(() => import('@/pages/adjuster/DashboardPage'))
const ClaimQueue = React.lazy(() => import('@/pages/adjuster/ClaimQueuePage'))
const ClaimReview = React.lazy(() => import('@/pages/adjuster/ClaimReviewPage'))
const Reports = React.lazy(() => import('@/pages/adjuster/ReportsPage'))

// Shared
const SettingsPage = React.lazy(() => import('@/pages/shared/SettingsPage'))
const HelpPage = React.lazy(() => import('@/pages/shared/HelpPage'))

// Loading fallback
function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-deep">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-blue animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

// Shared placeholder
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      <p className="text-text-muted mt-2">This module is under construction.</p>
    </div>
  )
}

// Route guard
function RequireAuth({ children, allowedRole }: { children: React.ReactNode; allowedRole?: UserRole }) {
  const { isAuthenticated, role } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRole && role !== allowedRole && role !== 'admin') {
    return <Navigate to={role === 'adjuster' ? '/adjuster/dashboard' : '/dashboard'} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoading />}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/mfa" element={<MFAPage />} />
              
              <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />

              {/* Protected — all roles */}
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                {/* Default redirect */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Policyholder routes */}
                <Route path="dashboard" element={<PHDashboard />} />
                <Route path="submit-claim" element={<SubmitClaim />} />
                <Route path="my-claims" element={<ClaimList />} />
                <Route path="my-claims/:id" element={<ClaimDetail />} />
                <Route path="claims/:id" element={<ClaimDetail />} />
                <Route path="documents" element={<PlaceholderPage title="Documents" />} />
                <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />

                {/* Adjuster routes */}
                <Route path="adjuster">
                  <Route path="dashboard" element={<RequireAuth allowedRole="adjuster"><AdjDashboard /></RequireAuth>} />
                  <Route path="queue" element={<RequireAuth allowedRole="adjuster"><ClaimQueue /></RequireAuth>} />
                  <Route path="review/:id" element={<RequireAuth allowedRole="adjuster"><ClaimReview /></RequireAuth>} />
                  <Route path="review" element={<RequireAuth allowedRole="adjuster"><ClaimQueue /></RequireAuth>} />
                  <Route path="reports" element={<RequireAuth allowedRole="adjuster"><Reports /></RequireAuth>} />
                  <Route path="analytics" element={<RequireAuth allowedRole="adjuster"><PlaceholderPage title="Analytics" /></RequireAuth>} />
                  <Route path="team" element={<RequireAuth allowedRole="adjuster"><PlaceholderPage title="Team Management" /></RequireAuth>} />
                </Route>

                {/* Shared catch-all */}
                <Route path="settings" element={<SettingsPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Unmatched public routes */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A2442',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#F1F5F9',
          },
        }}
      />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
