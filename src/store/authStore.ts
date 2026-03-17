import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, UserRole } from '@/types/user'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  role: UserRole | null
  token: string | null
  refreshToken: string | null

  setUser: (user: AuthUser) => void
  clearUser: () => void
  updateToken: (token: string) => void
  updateProfile: (data: { fullName: string }) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      token: null,
      refreshToken: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          role: user.role,
          token: user.token,
          refreshToken: user.refreshToken,
        }),

      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          role: null,
          token: null,
          refreshToken: null,
        }),

      updateToken: (token) =>
        set((state) => ({
          token,
          user: state.user ? { ...state.user, token } : null,
        })),

      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, fullName: data.fullName, firstName: data.fullName.split(' ')[0], lastName: data.fullName.split(' ').slice(1).join(' ') } : null,
        })),
    }),
    {
      name: 'claimiq-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    },
  ),
)
