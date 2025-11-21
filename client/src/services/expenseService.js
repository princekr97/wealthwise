/**
 * Expense Service
 *
 * API calls for expenses and analytics.
 */

import { apiClient } from './api';

export const expenseService = {
  list: async (params = {}) => {
    const { data } = await apiClient.get('/expenses', { params });
    return data;
  },

  create: async (payload) => {
    const { data } = await apiClient.post('/expenses', payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await apiClient.put(`/expenses/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    const { data } = await apiClient.delete(`/expenses/${id}`);
    return data;
  },

  summary: async (params = {}) => {
    const { data } = await apiClient.get('/expenses/summary', { params });
    return data;
  },

  byCategory: async (params = {}) => {
    const { data } = await apiClient.get('/expenses/by-category', { params });
    return data;
  }
};