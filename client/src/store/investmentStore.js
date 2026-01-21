/**
 * Investment Store with Caching
 * Always fetches fresh data after mutations to ensure accurate calculations
 */

import { create } from 'zustand';
import { investmentService } from '../services/investmentService';

export const useInvestmentStore = create((set, get) => ({
  investments: [],
  loading: false,
  lastFetch: null,
  cacheTime: 5 * 60 * 1000,

  /**
   * Fetch investments with caching
   * @param {boolean} force - Force refresh
   * @returns {Promise<Array>}
   */
  fetchInvestments: async (force = false) => {
    const { lastFetch, cacheTime, investments } = get();
    const now = Date.now();
    
    if (!force && lastFetch && (now - lastFetch) < cacheTime && investments.length > 0) {
      return investments;
    }

    set({ loading: true });
    try {
      const data = await investmentService.getInvestments();
      set({ investments: data, loading: false, lastFetch: now });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Add investment and fetch fresh data
   * @param {Object} investment - Investment data
   * @returns {Promise<Object>}
   */
  addInvestment: async (investment) => {
    const data = await investmentService.createInvestment(investment);
    // Force refresh to get latest returns/percentage calculations
    await get().fetchInvestments(true);
    return data;
  },

  /**
   * Update investment and fetch fresh data
   * @param {string} id - Investment ID
   * @param {Object} updates - Updated data
   * @returns {Promise<Object>}
   */
  updateInvestment: async (id, updates) => {
    const data = await investmentService.updateInvestment(id, updates);
    // Force refresh to get latest returns/percentage calculations
    await get().fetchInvestments(true);
    return data;
  },

  /**
   * Delete investment and fetch fresh data
   * @param {string} id - Investment ID
   * @returns {Promise<void>}
   */
  deleteInvestment: async (id) => {
    await investmentService.deleteInvestment(id);
    // Force refresh to get latest portfolio calculations
    await get().fetchInvestments(true);
  },

  clearCache: () => set({ investments: [], lastFetch: null, loading: false })
}));
