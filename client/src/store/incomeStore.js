/**
 * Income Store with Caching
 * Manages income data with automatic cache invalidation
 */

import { create } from 'zustand';
import { incomeService } from '../services/incomeService';

export const useIncomeStore = create((set, get) => ({
  incomes: [],
  loading: false,
  lastFetch: null,
  cacheTime: 5 * 60 * 1000,

  /**
   * Fetch incomes with caching
   * @param {boolean} force - Force refresh
   * @returns {Promise<Array>}
   */
  fetchIncomes: async (force = false) => {
    const { lastFetch, cacheTime, incomes } = get();
    const now = Date.now();
    
    if (!force && lastFetch && (now - lastFetch) < cacheTime && incomes.length > 0) {
      return incomes;
    }

    set({ loading: true });
    try {
      const data = await incomeService.getIncomes();
      set({ incomes: data, loading: false, lastFetch: now });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Add income and fetch fresh data
   * @param {Object} income - Income data
   * @returns {Promise<Object>}
   */
  addIncome: async (income) => {
    const data = await incomeService.createIncome(income);
    // Force refresh to get latest data from server
    await get().fetchIncomes(true);
    return data;
  },

  /**
   * Update income and fetch fresh data
   * @param {string} id - Income ID
   * @param {Object} updates - Updated data
   * @returns {Promise<Object>}
   */
  updateIncome: async (id, updates) => {
    const data = await incomeService.updateIncome(id, updates);
    // Force refresh to get latest data from server
    await get().fetchIncomes(true);
    return data;
  },

  /**
   * Delete income and fetch fresh data
   * @param {string} id - Income ID
   * @returns {Promise<void>}
   */
  deleteIncome: async (id) => {
    await incomeService.deleteIncome(id);
    // Force refresh to get latest data from server
    await get().fetchIncomes(true);
  },

  clearCache: () => set({ incomes: [], lastFetch: null, loading: false })
}));
