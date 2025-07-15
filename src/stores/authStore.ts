import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StaffInfo } from '@/types/business';

interface AuthState {
  // State
  isAuthenticated: boolean;
  staff: StaffInfo | null;
  token: string | null;
  refreshToken: string | null;
  sessionExpiry: number | null;

  // Actions
  login: (
    staff: StaffInfo,
    token: string,
    refreshToken: string,
    expiresIn: number
  ) => void;
  logout: () => void;
  updateToken: (token: string, expiresIn: number) => void;
  updateStaff: (staff: Partial<StaffInfo>) => void;

  // Getters
  isSessionValid: () => boolean;
  hasPermission: (permission: string) => boolean;
  getTimeUntilExpiry: () => number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      staff: null,
      token: null,
      refreshToken: null,
      sessionExpiry: null,

      // Actions
      login: (staff, token, refreshToken, expiresIn) => {
        const sessionExpiry = Date.now() + expiresIn * 1000;
        set({
          isAuthenticated: true,
          staff,
          token,
          refreshToken,
          sessionExpiry,
        });
      },

      logout: () => {
        set({
          isAuthenticated: false,
          staff: null,
          token: null,
          refreshToken: null,
          sessionExpiry: null,
        });
      },

      updateToken: (token, expiresIn) => {
        const sessionExpiry = Date.now() + expiresIn * 1000;
        set({ token, sessionExpiry });
      },

      updateStaff: staffUpdate => {
        const currentStaff = get().staff;
        if (currentStaff) {
          set({ staff: { ...currentStaff, ...staffUpdate } });
        }
      },

      // Getters
      isSessionValid: () => {
        const { sessionExpiry } = get();
        return sessionExpiry ? Date.now() < sessionExpiry : false;
      },

      hasPermission: permission => {
        const { staff } = get();
        return staff?.permissions.includes(permission) ?? false;
      },

      getTimeUntilExpiry: () => {
        const { sessionExpiry } = get();
        return sessionExpiry ? Math.max(0, sessionExpiry - Date.now()) : 0;
      },
    }),
    {
      name: 'vampire-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        staff: state.staff,
        token: state.token,
        refreshToken: state.refreshToken,
        sessionExpiry: state.sessionExpiry,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
