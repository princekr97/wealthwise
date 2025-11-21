/**
 * useAuth Hook
 *
 * Thin wrapper over auth store to expose auth helpers.
 */

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { token, user, loading, login, register, logout, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, [token, user, fetchProfile]);

  return {
    isAuthenticated: Boolean(token),
    user,
    loading,
    login,
    register,
    logout
  };
};