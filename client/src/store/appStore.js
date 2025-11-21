/**
 * App Store (Zustand)
 *
 * Global UI state like sidebar, filters, etc.
 */

import { create } from 'zustand';

export const useAppStore = create((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open })
}));