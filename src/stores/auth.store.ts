import { create } from 'zustand';
import { UserModel } from '../core/models';

interface AuthState {
  user: UserModel | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: UserModel | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
}));
