/**
 * Group Store with Caching
 * Manages group data with intelligent caching
 */

import { create } from 'zustand';
import { groupService } from '../services/groupService';

export const useGroupStore = create((set, get) => ({
  groups: [],
  groupBalances: {},
  groupStats: {
    totalOwed: 0,
    totalOwe: 0,
    netBalance: 0,
    todaySpending: 0,
    monthSpending: 0
  },
  currentGroup: null,
  loading: false,
  lastFetch: null,
  cacheTime: 60 * 1000, // 1 minute cache (more frequent sync)

  /**
   * Invalidate group list cache to force next fetch
   */
  invalidateGroups: () => set({ lastFetch: null }),

  /**
   * Check if data is stale
   */
  isStale: () => {
    const { lastFetch, cacheTime } = get();
    if (!lastFetch) return true;
    return (Date.now() - lastFetch) > cacheTime;
  },

  /**
   * Set cached stats
   */
  setStats: (stats) => set({ groupStats: stats }),
  
  /**
   * Set cached balances
   */
  setBalances: (balances) => set({ groupBalances: balances }),

  /**
   * Fetch all groups with caching
   * @param {boolean} force - Force refresh from server
   * @param {boolean} silent - Don't show global loader
   * @returns {Promise<Array>}
   */
  fetchGroups: async (force = false, silent = false) => {
    const { lastFetch, cacheTime, groups } = get();
    const now = Date.now();
    
    // Return cached if not forced and not stale
    if (!force && lastFetch && (now - lastFetch) < cacheTime && groups.length > 0) {
      return groups;
    }

    if (!silent) set({ loading: true });
    
    try {
      const data = await groupService.getGroups();
      set({ groups: data, loading: false, lastFetch: now });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Fetch single group details
   * @param {string} id - Group ID
   * @param {boolean} silent - Don't show global loader
   * @returns {Promise<Object>}
   */
  fetchGroupDetails: async (id, silent = false) => {
    if (!silent) set({ loading: true });
    try {
      const data = await groupService.getGroupDetails(id);
      set({ currentGroup: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false, currentGroup: null });
      throw error;
    }
  },

  /**
   * Create group and invalidate list cache
   */
  createGroup: async (groupData) => {
    const data = await groupService.createGroup(groupData);
    set({ lastFetch: null }); // Invalidate list
    await get().fetchGroups(true);
    return data;
  },

  /**
   * Update group and invalidate list cache
   */
  updateGroup: async (id, updates) => {
    const data = await groupService.updateGroup(id, updates);
    set({ lastFetch: null }); // Invalidate list
    if (get().currentGroup?._id === id) {
      await get().fetchGroupDetails(id, true);
    }
    await get().fetchGroups(true, true);
    return data;
  },

  /**
   * Delete group and clear cache
   */
  deleteGroup: async (id) => {
    await groupService.deleteGroup(id);
    set({ lastFetch: null }); // Invalidate list
    if (get().currentGroup?._id === id) {
      set({ currentGroup: null });
    }
    await get().fetchGroups(true, true);
  },

  clearCache: () => set({ 
    groups: [], 
    groupBalances: {},
    groupStats: {
      totalOwed: 0,
      totalOwe: 0,
      netBalance: 0,
      todaySpending: 0,
      monthSpending: 0
    },
    currentGroup: null, 
    lastFetch: null, 
    loading: false 
  })
}));
