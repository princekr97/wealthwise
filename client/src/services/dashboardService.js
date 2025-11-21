/**
 * Dashboard Service
 *
 * API calls for dashboard summary and charts.
 */

import { apiClient } from './api';

export const dashboardService = {
  summary: async () => {
    const { data } = await apiClient.get('/dashboard/summary');
    return data;
  },
  charts: async () => {
    const { data } = await apiClient.get('/dashboard/charts');
    return data;
  }
};