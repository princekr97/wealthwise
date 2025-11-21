/**
 * Axios API Instance
 *
 * Centralized HTTP client with auth token handling and error interception.
 */

import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Adjust baseURL for local vs production (Vercel) later via env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 15000
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error || {};
    if (response?.status === 401) {
      // Token invalid/expired -> logout
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);