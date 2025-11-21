/**
 * Budget Service
 * Handles all API calls for budget and goals management
 */

import { apiClient as api } from './api';

const BUDGET_BASE = '/budgets';
const GOALS_BASE = '/goals';

export const budgetService = {
  // Budget endpoints
  getBudgets: async () => {
    const { data } = await api.get(`${BUDGET_BASE}`);
    return data;
  },

  createBudget: async (budgetData) => {
    const { data } = await api.post(`${BUDGET_BASE}`, budgetData);
    return data;
  },

  updateBudget: async (budgetId, budgetData) => {
    const { data } = await api.put(`${BUDGET_BASE}/${budgetId}`, budgetData);
    return data;
  },

  deleteBudget: async (budgetId) => {
    const { data } = await api.delete(`${BUDGET_BASE}/${budgetId}`);
    return data;
  },

  // Goals endpoints
  getGoals: async () => {
    const { data } = await api.get(`${GOALS_BASE}`);
    return data;
  },

  createGoal: async (goalData) => {
    const { data } = await api.post(`${GOALS_BASE}`, goalData);
    return data;
  },

  updateGoal: async (goalId, goalData) => {
    const { data } = await api.put(`${GOALS_BASE}/${goalId}`, goalData);
    return data;
  },

  deleteGoal: async (goalId) => {
    const { data } = await api.delete(`${GOALS_BASE}/${goalId}`);
    return data;
  }
};

export default budgetService;
