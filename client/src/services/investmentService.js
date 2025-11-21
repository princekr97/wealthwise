/**
 * Investment Service
 * Handles all API calls for investment portfolio management
 */

import { apiClient as api } from './api';

const API_BASE = '/investments';

export const investmentService = {
  // Get all investments
  getInvestments: async () => {
    const { data } = await api.get(`${API_BASE}`);
    return data;
  },

  // Create new investment
  createInvestment: async (investmentData) => {
    const { data } = await api.post(`${API_BASE}`, investmentData);
    return data;
  },

  // Update investment
  updateInvestment: async (investmentId, investmentData) => {
    const { data } = await api.put(`${API_BASE}/${investmentId}`, investmentData);
    return data;
  },

  // Delete investment
  deleteInvestment: async (investmentId) => {
    const { data } = await api.delete(`${API_BASE}/${investmentId}`);
    return data;
  },

  // Get portfolio summary with returns
  getPortfolio: async () => {
    const { data } = await api.get(`${API_BASE}/portfolio`);
    return data;
  },

  // Get investments by type
  getByType: async () => {
    const { data } = await api.get(`${API_BASE}/by-type`);
    return data;
  }
};

export default investmentService;
