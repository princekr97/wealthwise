/**
 * Lending Service
 * Handles all API calls for personal lending (money given/taken)
 */

import { apiClient as api } from './api';

const API_BASE = '/lending';

export const lendingService = {
  // Get all lending records
  getLendings: async (status = null) => {
    const { data } = await api.get(`${API_BASE}`, {
      params: status ? { status } : {}
    });
    return data;
  },

  // Create new lending record
  createLending: async (lendingData) => {
    const { data } = await api.post(`${API_BASE}`, lendingData);
    return data;
  },

  // Update lending record
  updateLending: async (lendingId, lendingData) => {
    const { data } = await api.put(`${API_BASE}/${lendingId}`, lendingData);
    return data;
  },

  // Delete lending record
  deleteLending: async (lendingId) => {
    const { data } = await api.delete(`${API_BASE}/${lendingId}`);
    return data;
  },

  // Record partial payment
  recordPayment: async (lendingId, paymentData) => {
    const { data } = await api.post(`${API_BASE}/${lendingId}/payment`, paymentData);
    return data;
  },

  // Get summary (to receive vs to pay)
  getSummary: async () => {
    const { data } = await api.get(`${API_BASE}/summary`);
    return data;
  }
};

export default lendingService;
