/**
 * Budget Store with Caching
 * Always fetches fresh data after mutations to ensure accurate budget tracking
 */

import { create } from 'zustand';
import { budgetService } from '../services/budgetService';

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  goals: [],
  loading: false,
  lastFetch: null,
  cacheTime: 5 * 60 * 1000,

  /**
   * Fetch budgets with caching
   * @param {boolean} force - Force refresh
   * @returns {Promise<Array>}
   */
  fetchBudgets: async (force = false) => {
    const { lastFetch, cacheTime, budgets } = get();
    const now = Date.now();
    
    if (!force && lastFetch && (now - lastFetch) < cacheTime && budgets.length > 0) {
      return budgets;
    }

    set({ loading: true });
    try {
      const data = await budgetService.getBudgets();
      set({ budgets: data, loading: false, lastFetch: now });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Fetch goals with caching
   * @param {boolean} force - Force refresh
   * @returns {Promise<Array>}
   */
  fetchGoals: async (force = false) => {
    const { lastFetch, cacheTime, goals } = get();
    const now = Date.now();
    
    if (!force && lastFetch && (now - lastFetch) < cacheTime && goals.length > 0) {
      return goals;
    }

    set({ loading: true });
    try {
      const data = await budgetService.getGoals();
      set({ goals: data, loading: false, lastFetch: now });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Add budget and fetch fresh data
   * @param {Object} budget - Budget data
   * @returns {Promise<Object>}
   */
  addBudget: async (budget) => {
    const data = await budgetService.createBudget(budget);
    // Force refresh to get latest budget vs actual calculations
    await get().fetchBudgets(true);
    return data;
  },

  /**
   * Update budget and fetch fresh data
   * @param {string} id - Budget ID
   * @param {Object} updates - Updated data
   * @returns {Promise<Object>}
   */
  updateBudget: async (id, updates) => {
    const data = await budgetService.updateBudget(id, updates);
    // Force refresh to get latest calculations
    await get().fetchBudgets(true);
    return data;
  },

  /**
   * Delete budget and fetch fresh data
   * @param {string} id - Budget ID
   * @returns {Promise<void>}
   */
  deleteBudget: async (id) => {
    await budgetService.deleteBudget(id);
    await get().fetchBudgets(true);
  },

  /**
   * Add goal and fetch fresh data
   * @param {Object} goal - Goal data
   * @returns {Promise<Object>}
   */
  addGoal: async (goal) => {
    const data = await budgetService.createGoal(goal);
    // Force refresh to get latest progress calculations
    await get().fetchGoals(true);
    return data;
  },

  /**
   * Update goal and fetch fresh data
   * @param {string} id - Goal ID
   * @param {Object} updates - Updated data
   * @returns {Promise<Object>}
   */
  updateGoal: async (id, updates) => {
    const data = await budgetService.updateGoal(id, updates);
    // Force refresh to get latest progress calculations
    await get().fetchGoals(true);
    return data;
  },

  /**
   * Delete goal and fetch fresh data
   * @param {string} id - Goal ID
   * @returns {Promise<void>}
   */
  deleteGoal: async (id) => {
    await budgetService.deleteGoal(id);
    await get().fetchGoals(true);
  },

  clearCache: () => set({ 
    budgets: [], 
    goals: [], 
    lastFetch: null, 
    loading: false 
  })
}));
