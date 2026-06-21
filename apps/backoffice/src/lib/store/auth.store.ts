import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiPost } from '../api/client';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roleId: string;
  tenantId: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await apiPost<{
            tokens: { accessToken: string; refreshToken: string; expiresIn: number };
            user: AuthUser;
          }>('/auth/login', { email, password });

          // Persist token for axios client
          if (typeof window !== 'undefined') {
            localStorage.setItem('vs_access_token', result.tokens.accessToken);
          }

          set({
            user: result.user,
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : 'Invalid credentials';
          set({ isLoading: false, error: message, isAuthenticated: false });
          throw err;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('vs_access_token');
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'vs-auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
