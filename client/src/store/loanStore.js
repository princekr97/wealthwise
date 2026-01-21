/**
 * Loan Store with Caching
 * Always fetches fresh data after mutations to ensure accuracy
 */

import { create } from 'zustand';
import { loanService } from '../services/loanService';

export const useLoanStore = create((set, get) => ({
  loans: [],
  loading: false,
  lastFetch: null,
  cacheTime: 5 * 60 * 1000,

  /**
   * Fetch loans with caching
   * @param {boolean} force - Force refresh
   * @returns {Promise<Array>}
   */
  fetchLoans: async (force = false) => {
    const { lastFetch, cacheTime, loans } = get();
    const now = Date.now();
    
    if (!force && lastFetch && (now - lastFetch) < cacheTime && loans.length > 0) {
      return loans;
    }

    set({ loading: true });
    try {
      const data = await loanService.getLoans();
      set({ loans: data, loading: false, lastFetch: now });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Add loan and fetch fresh data
   * @param {Object} loan - Loan data
   * @returns {Promise<Object>}
   */
  addLoan: async (loan) => {
    const data = await loanService.createLoan(loan);
    // Force refresh to get latest calculated values from server
    await get().fetchLoans(true);
    return data;
  },

  /**
   * Update loan and fetch fresh data
   * @param {string} id - Loan ID
   * @param {Object} updates - Updated data
   * @returns {Promise<Object>}
   */
  updateLoan: async (id, updates) => {
    const data = await loanService.updateLoan(id, updates);
    // Force refresh to get latest calculated values from server
    await get().fetchLoans(true);
    return data;
  },

  /**
   * Delete loan and fetch fresh data
   * @param {string} id - Loan ID
   * @returns {Promise<void>}
   */
  deleteLoan: async (id) => {
    await loanService.deleteLoan(id);
    // Force refresh to get latest data from server
    await get().fetchLoans(true);
  },

  /**
   * Record EMI payment and fetch fresh data
   * @param {string} id - Loan ID
   * @param {Object} payment - Payment data
   * @returns {Promise<Object>}
   */
  recordPayment: async (id, payment) => {
    const data = await loanService.recordPayment(id, payment);
    // Force refresh to get updated balance calculations
    await get().fetchLoans(true);
    return data;
  },

  clearCache: () => set({ loans: [], lastFetch: null, loading: false })
}));
