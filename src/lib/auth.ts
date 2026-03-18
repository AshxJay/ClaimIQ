import { signIn as amplifySignIn, signOut as amplifySignOut, fetchAuthSession, getCurrentUser as amplifyGetCurrentUser } from 'aws-amplify/auth'
import { jwtDecode } from 'jwt-decode'
import type { AuthUser, LoginCredentials, JWTClaims } from '@/types/user'
import '@/lib/cognito'

export async function signIn(credentials: LoginCredentials): Promise<AuthUser> {
  await amplifySignIn({
    username: credentials.email,
    password: credentials.password,
  })

  const session = await fetchAuthSession()
  const token = session.tokens?.accessToken?.toString()
  const idToken = session.tokens?.idToken?.toString()

  if (!token || !idToken) {
    throw new Error('No tokens returned from Cognito — check your user pool app client settings')
  }

  const claims = jwtDecode<JWTClaims>(idToken)
  const groups: string[] = ((claims as unknown as Record<string, unknown>)['cognito:groups'] as string[]) ?? []
  const role = groups.includes('adjuster') ? 'adjuster' : 'policyholder'

  return {
    id: claims.sub,
    email: claims.email,
    firstName: claims.given_name ?? '',
    lastName: claims.family_name ?? '',
    fullName: `${claims.given_name ?? ''} ${claims.family_name ?? ''}`.trim(),
    role,
    token,
    refreshToken: '',
    expiresAt: (claims.exp ?? 0) * 1000,
  }
}

export async function signOut(): Promise<void> {
  await amplifySignOut()
  localStorage.removeItem('claimiq-auth')
}

export async function refreshToken(): Promise<string> {
  const session = await fetchAuthSession({ forceRefresh: true })
  return session.tokens?.accessToken?.toString() ?? ''
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    await amplifyGetCurrentUser()
    const session = await fetchAuthSession()

    const token = session.tokens?.accessToken?.toString()
    const idToken = session.tokens?.idToken?.toString()

    if (!token || !idToken) return null

    const claims = jwtDecode<JWTClaims>(idToken)
    const groups: string[] = ((claims as unknown as Record<string, unknown>)['cognito:groups'] as string[]) ?? []
    const role = groups.includes('adjuster') ? 'adjuster' : 'policyholder'

    return {
      id: claims.sub,
      email: claims.email,
      firstName: claims.given_name ?? '',
      lastName: claims.family_name ?? '',
      fullName: `${claims.given_name ?? ''} ${claims.family_name ?? ''}`.trim(),
      role,
      token,
      refreshToken: '',
      expiresAt: (claims.exp ?? 0) * 1000,
    }
  } catch {
    return null
  }
}

export async function signInWithMFA(_credentials: { sessionToken: string; code: string }): Promise<AuthUser> {
  throw new Error('MFA not implemented')
}