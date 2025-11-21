/**
 * Loan Service
 * Handles all API calls for loan and EMI management
 */

import { apiClient as api } from './api';

const API_BASE = '/loans';

export const loanService = {
  // Get all loans
  getLoans: async () => {
    const { data } = await api.get(`${API_BASE}`);
    return data;
  },

  // Create new loan
  createLoan: async (loanData) => {
    const { data } = await api.post(`${API_BASE}`, loanData);
    return data;
  },

  // Update loan
  updateLoan: async (loanId, loanData) => {
    const { data } = await api.put(`${API_BASE}/${loanId}`, loanData);
    return data;
  },

  // Delete loan
  deleteLoan: async (loanId) => {
    const { data } = await api.delete(`${API_BASE}/${loanId}`);
    return data;
  },

  // Record EMI payment
  recordPayment: async (loanId, paymentData) => {
    const { data } = await api.post(`${API_BASE}/${loanId}/payment`, paymentData);
    return data;
  },

  // Get loan portfolio summary
  getPortfolio: async () => {
    const { data } = await api.get(`${API_BASE}/portfolio`);
    return data;
  },

  // Get upcoming EMI dates
  getEmiCalendar: async () => {
    const { data } = await api.get(`${API_BASE}/calendar`);
    return data;
  }
};

export default loanService;
