import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  farmerId: string | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string, role: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      role: null,
      farmerId: null,
      isAuthenticated: false,
      setTokens: (access, refresh, role) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('km_access_token', access);
          localStorage.setItem('km_refresh_token', refresh);
        }
        set({ accessToken: access, refreshToken: refresh, role, isAuthenticated: true });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('km_access_token');
          localStorage.removeItem('km_refresh_token');
        }
        set({ accessToken: null, refreshToken: null, role: null, farmerId: null, isAuthenticated: false });
      },
    }),
    { name: 'km-auth', partialize: (state) => ({ accessToken: state.accessToken, refreshToken: state.refreshToken, role: state.role }) }
  )
);
