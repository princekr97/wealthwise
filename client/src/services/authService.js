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
  }
};