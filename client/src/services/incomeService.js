/**
 * Income Service
 * Handles all API calls for income management
 */

import { apiClient as api } from './api';

const API_BASE = '/income';

export const incomeService = {
  // Get all incomes with pagination
  getIncomes: async (page = 1, limit = 20, filters = {}) => {
    const { from, to, sourceType } = filters;
    const { data } = await api.get(`${API_BASE}`, {
      params: {
        page,
        limit,
        ...(from && { from }),
        ...(to && { to }),
        ...(sourceType && { sourceType })
      }
    });
    return data;
  },

  // Get income summary for a date range
  getSummary: async (from, to) => {
    const { data } = await api.get(`${API_BASE}/summary`, {
      params: { from, to }
    });
    return data;
  },

  // Create new income
  createIncome: async (incomeData) => {
    const { data } = await api.post(`${API_BASE}`, incomeData);
    return data;
  },

  // Update income
  updateIncome: async (incomeId, incomeData) => {
    const { data } = await api.put(`${API_BASE}/${incomeId}`, incomeData);
    return data;
  },

  // Delete income
  deleteIncome: async (incomeId) => {
    const { data } = await api.delete(`${API_BASE}/${incomeId}`);
    return data;
  },

  // Get income by source
  getBySource: async (months = 1) => {
    const { data } = await api.get(`${API_BASE}/by-source`, {
      params: { months }
    });
    return data;
  }
};

export default incomeService;
