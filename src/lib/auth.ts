/**
 * auth.ts — Cognito-ready authentication abstraction.
 *
 * Currently uses mock JWT. To switch to real AWS Cognito:
 * 1. npm install aws-amplify
 * 2. Replace the body of each function with the corresponding
 *    Amplify Auth call (signIn, signOut, fetchAuthSession, etc.)
 * 3. Zero UI components change.
 */

import { jwtDecode } from 'jwt-decode'
import type { AuthUser, LoginCredentials, MFACredentials, JWTClaims } from '@/types/user'
import { post } from '@/lib/api'

const MOCK_TOKENS = {
  policyholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTAwMSIsImVtYWlsIjoiamFuZS5kb2VAZXhhbXBsZS5jb20iLCJnaXZlbl9uYW1lIjoiSmFuZSIsImZhbWlseV9uYW1lIjoiRG9lIiwiY3VzdG9tOnJvbGUiOiJwb2xpY3lob2xkZXIiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX0.mock',
  adjuster: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTAwMiIsImVtYWlsIjoiYWxleC5jaGVuQGNsYWltaXEuY29tIiwiZ2l2ZW5fbmFtZSI6IkFsZXgiLCJmYW1pbHlfbmFtZSI6IkNoZW4iLCJjdXN0b206cm9sZSI6ImFkanVzdGVyIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.mock',
}

function decodeMockToken(token: string): JWTClaims {
  try {
    // Real JWT decode
    return jwtDecode<JWTClaims>(token)
  } catch {
    // Fallback for mock tokens
    const parts = token.split('.')
    const payload = JSON.parse(atob(parts[1]))
    return payload as JWTClaims
  }
}

function tokenToAuthUser(token: string, refreshToken: string, claims: JWTClaims): AuthUser {
  return {
    id: claims.sub,
    email: claims.email,
    firstName: claims.given_name,
    lastName: claims.family_name,
    fullName: `${claims.given_name} ${claims.family_name}`,
    role: claims['custom:role'],
    token,
    refreshToken,
    expiresAt: claims.exp * 1000,
  }
}

export async function signIn(credentials: LoginCredentials): Promise<AuthUser> {
  if (import.meta.env.VITE_MOCK === 'true') {
    // Mock: adjuster login if email contains "adjuster" or "alex"
    const isAdjuster =
      credentials.email.toLowerCase().includes('adjuster') ||
      credentials.email.toLowerCase().includes('alex')
    const token = isAdjuster ? MOCK_TOKENS.adjuster : MOCK_TOKENS.policyholder
    const claims = decodeMockToken(token)
    return tokenToAuthUser(token, `refresh-${claims.sub}`, claims)
  }

  // Real Cognito: swap this call with aws-amplify signIn
  const response = await post<{ token: string; refreshToken: string }>('/auth/login', credentials)
  const { token, refreshToken } = response.data
  const claims = jwtDecode<JWTClaims>(token)
  return tokenToAuthUser(token, refreshToken, claims)
}

export async function signInWithMFA(credentials: MFACredentials): Promise<AuthUser> {
  if (import.meta.env.VITE_MOCK === 'true') {
    const claims = decodeMockToken(MOCK_TOKENS.policyholder)
    return tokenToAuthUser(MOCK_TOKENS.policyholder, `refresh-${claims.sub}`, claims)
  }

  const response = await post<{ token: string; refreshToken: string }>('/auth/mfa/verify', credentials)
  const { token, refreshToken } = response.data
  const claims = jwtDecode<JWTClaims>(token)
  return tokenToAuthUser(token, refreshToken, claims)
}

export async function signOut(): Promise<void> {
  if (import.meta.env.VITE_MOCK === 'true') {
    return
  }
  // Cognito: amplify signOut
  await post('/auth/logout', {})
}

export async function refreshToken(): Promise<string> {
  const raw = localStorage.getItem('claimiq-auth')
  if (!raw) throw new Error('No auth state')

  const parsed = JSON.parse(raw)
  const storedRefreshToken: string = parsed?.state?.refreshToken

  if (import.meta.env.VITE_MOCK === 'true') {
    const role = parsed?.state?.role || 'policyholder'
    return MOCK_TOKENS[role as keyof typeof MOCK_TOKENS] || MOCK_TOKENS.policyholder
  }

  // Cognito: amplify fetchAuthSession
  const response = await post<{ token: string }>('/auth/refresh', { refreshToken: storedRefreshToken })
  return response.data.token
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const raw = localStorage.getItem('claimiq-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const state = parsed?.state
    if (!state?.token || !state?.isAuthenticated) return null
    return state as AuthUser
  } catch {
    return null
  }
}
