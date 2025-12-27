/**
 * Auth Service
 *
 * Wrapper functions around auth-related API endpoints.
 */

import { apiClient } from './api';

export const authService = {
  /**
   * Register a new user.
   */
  register: async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  /**
   * Login existing user.
   */
  login: async (payload) => {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },

  /**
   * Fetch current user's profile.
   */
  getProfile: async () => {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  },

  /**
   * Request password reset.
   */
  forgotPassword: async (email) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  /**
   * Send OTP to phone number.
   */
  sendOTP: async (phoneNumber) => {
    const { data } = await apiClient.post('/auth/send-otp', { phoneNumber });
    return data;
  },

  /**
   * Verify OTP and login.
   */
  verifyOTP: async (payload) => {
    const { data } = await apiClient.post('/auth/verify-otp', payload);
    return data;
  },

  /**
   * Delete user account.
   */
  deleteAccount: async () => {
    const { data } = await apiClient.delete('/auth/profile');
    return data;
  },

  /**
   * Reset password with token.
   */
  resetPassword: async (payload) => {
    const { data } = await apiClient.post('/auth/reset-password', payload);
    return data;
  }
};