/**
 * Expense Store with Caching
 * Manages expense data with automatic cache invalidation
 * Reduces duplicate API calls and improves performance
 */

import { create } from 'zustand';
import { expenseService } from '../services/expenseService';

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  loading: false,
  lastFetch: null,
  cacheTime: 5 * 60 * 1000, // 5 minutes

  /**
   * Fetch expenses with intelligent caching
   * @param {boolean} force - Force refresh ignoring cache
   * @returns {Promise<Array>} Expense array
   */
  fetchExpenses: async (force = false) => {
    const { lastFetch, cacheTime, expenses } = get();
    const now = Date.now();
    
    // Return cached data if fresh
    if (!force && lastFetch && (now - lastFetch) < cacheTime && expenses.length > 0) {
      return expenses;
    }

    set({ loading: true });
    try {
      const data = await expenseService.getExpenses();
      set({ expenses: data, loading: false, lastFetch: now });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Add new expense and fetch fresh data
   * @param {Object} expense - Expense data
   * @returns {Promise<Object>} Created expense
   */
  addExpense: async (expense) => {
    const data = await expenseService.createExpense(expense);
    // Force refresh to get latest data from server
    await get().fetchExpenses(true);
    return data;
  },

  /**
   * Update expense and fetch fresh data
   * @param {string} id - Expense ID
   * @param {Object} updates - Updated data
   * @returns {Promise<Object>} Updated expense
   */
  updateExpense: async (id, updates) => {
    const data = await expenseService.updateExpense(id, updates);
    // Force refresh to get latest data from server
    await get().fetchExpenses(true);
    return data;
  },

  /**
   * Delete expense and fetch fresh data
   * @param {string} id - Expense ID
   * @returns {Promise<void>}
   */
  deleteExpense: async (id) => {
    await expenseService.deleteExpense(id);
    // Force refresh to get latest data from server
    await get().fetchExpenses(true);
  },

  /**
   * Clear cache (on logout)
   */
  clearCache: () => set({ expenses: [], lastFetch: null, loading: false })
}));
