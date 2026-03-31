import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  isAuthenticated,
  getAccessToken,
  setTokens,
  clearTokens,
  type LoginRequest,
  type RegisterRequest,
} from '@/lib/auth-api';

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: isAuthenticated(),
      isLoading: false,
      login: async (data: LoginRequest) => {
        set({ isLoading: true });
        const res = await authLogin(data);
        setTokens(res.token, res.refresh);
        set({ isLoggedIn: true, isLoading: false });
      },
      logout: async () => {
        set({ isLoading: true });
        await authLogout();
        set({ isLoggedIn: false, isLoading: false });
      },
      register: async (data: RegisterRequest) => {
        set({ isLoading: true });
        await authRegister(data);
        set({ isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn }),
    }
  )
);
