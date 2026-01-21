/**
 * Group Store with Caching
 * Manages group data with intelligent caching
 */

import { create } from 'zustand';
import { groupService } from '../services/groupService';

export const useGroupStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  loading: false,
  lastFetch: null,
  cacheTime: 5 * 60 * 1000,

  /**
   * Fetch all groups with caching
   * @param {boolean} force - Force refresh
   * @returns {Promise<Array>}
   */
  fetchGroups: async (force = false) => {
    const { lastFetch, cacheTime, groups } = get();
    const now = Date.now();
    
    if (!force && lastFetch && (now - lastFetch) < cacheTime && groups.length > 0) {
      return groups;
    }

    set({ loading: true });
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
   * Fetch single group details (always fresh)
   * @param {string} id - Group ID
   * @param {boolean} force - Force refresh (default: true)
   * @returns {Promise<Object>}
   */
  fetchGroupDetails: async (id, force = true) => {
    set({ loading: true });
    try {
      const data = await groupService.getGroupDetails(id);
      set({ currentGroup: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Create group and fetch fresh list
   * @param {Object} group - Group data
   * @returns {Promise<Object>}
   */
  createGroup: async (group) => {
    const data = await groupService.createGroup(group);
    // Force refresh to get latest data from server
    await get().fetchGroups(true);
    return data;
  },

  /**
   * Update group and fetch fresh data
   * @param {string} id - Group ID
   * @param {Object} updates - Updated data
   * @returns {Promise<Object>}
   */
  updateGroup: async (id, updates) => {
    const data = await groupService.updateGroup(id, updates);
    // Force refresh both list and current group
    await get().fetchGroups(true);
    if (get().currentGroup?._id === id) {
      await get().fetchGroupDetails(id, true);
    }
    return data;
  },

  /**
   * Delete group and fetch fresh list
   * @param {string} id - Group ID
   * @returns {Promise<void>}
   */
  deleteGroup: async (id) => {
    await groupService.deleteGroup(id);
    // Force refresh to get latest data from server
    await get().fetchGroups(true);
    if (get().currentGroup?._id === id) {
      set({ currentGroup: null });
    }
  },

  clearCache: () => set({ 
    groups: [], 
    currentGroup: null, 
    lastFetch: null, 
    loading: false 
  })
}));
