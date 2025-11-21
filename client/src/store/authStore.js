/**
 * Auth Store (Zustand)
 *
 * Manages authentication state, token, and user profile.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,

      /**
       * Login and store token+user.
       */
      login: async (credentials) => {
        set({ loading: true });
        try {
          const data = await authService.login(credentials);
          set({ token: data.token, user: data.user, loading: false });
          return { success: true };
        } catch (error) {
          set({ loading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed'
          };
        }
      },

      /**
       * Register and auto-login.
       */
      register: async (payload) => {
        set({ loading: true });
        try {
          const data = await authService.register(payload);
          set({ token: data.token, user: data.user, loading: false });
          return { success: true };
        } catch (error) {
          set({ loading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed'
          };
        }
      },

      /**
       * Fetch current profile (if token exists).
       */
      fetchProfile: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const profile = await authService.getProfile();
          set({ user: profile });
        } catch {
          // token might be invalid -> logout
          set({ token: null, user: null });
        }
      },

      logout: () => {
        set({ token: null, user: null });
      }
    }),
    {
      name: 'wealthwise-auth'
    }
  )
);