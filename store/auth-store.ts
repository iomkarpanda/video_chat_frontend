import { create } from 'zustand';
import {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  isAuthenticated,
  onAuthChange,
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

export const useAuthStore = create<AuthState>()((set) => ({
  isLoggedIn: isAuthenticated(),
  isLoading: false,
  login: async (data: LoginRequest) => {
    set({ isLoading: true });
    try {
      await authLogin(data);
      set({ isLoggedIn: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
  logout: async () => {
    set({ isLoading: true });
    try {
      await authLogout();
    } finally {
      set({ isLoggedIn: false, isLoading: false });
    }
  },
  register: async (data: RegisterRequest) => {
    set({ isLoading: true });
    try {
      await authRegister(data);
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
}));

if (typeof window !== 'undefined') {
  onAuthChange((authenticated) => {
    useAuthStore.setState({ isLoggedIn: authenticated });
  });
}
