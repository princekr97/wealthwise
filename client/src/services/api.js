/**
 * Axios API Instance
 *
 * Centralized HTTP client with auth token handling, error interception, and retry logic.
 * Includes automatic retry for Render.com free tier cold starts with user-friendly notifications.
 */

import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

// Adjust baseURL for local vs production (Vercel) later via env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: 30000 // Increased timeout for cold starts
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

// Track active toast IDs to prevent duplicates
let activeToastId = null;

// Custom event for connection error dialog
export const CONNECTION_ERROR_EVENT = 'connection-error';

// Response interceptor with retry logic and user notifications
apiClient.interceptors.response.use(
  (response) => {
    // Dismiss loading toast on success
    if (activeToastId) {
      toast.dismiss(activeToastId);
      activeToastId = null;
    }
    return response;
  },
  async (error) => {
    const { config, response } = error || {};
    
    // Handle 401 - Token expired
    if (response?.status === 401) {
      if (activeToastId) {
        toast.dismiss(activeToastId);
        activeToastId = null;
      }
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    // Retry logic for network errors or 5xx errors (Render cold start)
    const shouldRetry = 
      !response || // Network error
      response.status >= 500 || // Server error
      error.code === 'ECONNABORTED' || // Timeout
      error.code === 'ERR_NETWORK'; // Network failure

    if (shouldRetry && config && !config.__retryCount) {
      config.__retryCount = 0;
    }

    if (shouldRetry && config && config.__retryCount < 3) {
      config.__retryCount += 1;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, config.__retryCount - 1) * 1000;
      
      // Show user-friendly notification
      if (config.__retryCount === 1) {
        // First retry - likely cold start
        activeToastId = toast.loading('🚀 Waking up server... This may take a moment', {
          duration: Infinity,
        });
      } else {
        // Subsequent retries
        if (activeToastId) {
          toast.dismiss(activeToastId);
        }
        activeToastId = toast.loading(`⏳ Retrying... (Attempt ${config.__retryCount}/3)`, {
          duration: Infinity,
        });
      }
      
      console.log(`Retrying request (attempt ${config.__retryCount}/3) after ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(config);
    }

    // All retries failed - trigger connection error dialog
    if (shouldRetry && config && config.__retryCount >= 3) {
      if (activeToastId) {
        toast.dismiss(activeToastId);
        activeToastId = null;
      }
      
      // Dispatch custom event to show dialog
      window.dispatchEvent(new CustomEvent(CONNECTION_ERROR_EVENT));
    }

    // Dismiss loading toast on final error
    if (activeToastId) {
      toast.dismiss(activeToastId);
      activeToastId = null;
    }

    return Promise.reject(error);
  }
);