export type UserRole = 'policyholder' | 'adjuster' | 'admin'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: UserRole
  avatarUrl?: string
  phone?: string
  policyNumbers?: string[]
  department?: string
  teamId?: string
  createdAt: string
  lastLoginAt?: string
  mfaEnabled: boolean
  preferences: UserPreferences
}

export interface UserPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  inAppNotifications: boolean
  theme: 'dark' | 'light' | 'system'
  sidebarCollapsed: boolean
  tableRowDensity: 'compact' | 'comfortable' | 'spacious'
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: UserRole
  token: string
  refreshToken: string
  expiresAt: number
  avatarUrl?: string
  mfaRequired?: boolean
  mfaSessionToken?: string
}

export interface JWTClaims {
  sub: string
  email: string
  given_name: string
  family_name: string
  'custom:role': UserRole
  iat: number
  exp: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface MFACredentials {
  sessionToken: string
  code: string
}

export interface AdjusterStats {
  reviewedToday: number
  queueSize: number
  avgResolutionTimeDays: number
  approvalRate: number
  fraudFlagsToday: number
}

export interface TeamMember {
  id: string
  fullName: string
  email: string
  avatarUrl?: string
  queueSize: number
  reviewedToday: number
}
