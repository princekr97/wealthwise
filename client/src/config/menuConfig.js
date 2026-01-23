/**
 * Menu Configuration
 * Controls which menu items are visible in the sidebar
 * 
 * Features:
 * - Enable/disable menu items with 'enabled' flag
 * - Role-based access control with 'roles' array
 * - Easy to maintain and extend
 */

export const menuConfig = {
  dashboard: {
    enabled: true,
    path: '/app/dashboard',
    label: 'Dashboard',
    icon: 'Dashboard',
    roles: ['*'],
    order: 1
  },

  groups: {
    enabled: true,
    path: '/app/groups',
    label: 'Groups',
    icon: 'Groups',
    roles: ['*'],
    order: 2,
    badge: 'Live'
  },

  expenses: {
    enabled: true,
    path: '/app/expenses',
    label: 'Expenses',
    icon: 'Receipt',
    roles: ['*'],
    order: 3
  },

  income: {
    enabled: true,
    path: '/app/income',
    label: 'Income',
    icon: 'AccountBalance',
    roles: ['*'],
    order: 4
  },

  loans: {
    enabled: true,
    path: '/app/loans',
    label: 'Loans & EMIs',
    icon: 'CreditCard',
    roles: ['*'],
    order: 5
  },

  investments: {
    enabled: true,
    path: '/app/investments',
    label: 'Investments',
    icon: 'TrendingUp',
    roles: ['*'],
    order: 6
  },

  lending: {
    enabled: true,
    path: '/app/lending',
    label: 'Lending',
    icon: 'Handshake',
    roles: ['*'],
    order: 7
  },

  budget: {
    enabled: true,
    path: '/app/budget',
    label: 'Budget & Goals',
    icon: 'Flag',
    roles: ['*'],
    order: 8
  },

  settings: {
    enabled: true,
    path: '/app/settings',
    label: 'Settings',
    icon: 'Settings',
    roles: ['*'],
    order: 9
  }
};

/**
 * Get filtered menu items based on user role
 * @param {string} userRole - Current user role
 * @returns {Array} Filtered and sorted menu items
 */
export const getMenuItems = (userRole = 'user') => {
  return Object.entries(menuConfig)
    .filter(([key, config]) => {
      if (!config.enabled) return false;
      if (config.roles.includes('*')) return true;
      return config.roles.includes(userRole);
    })
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, config]) => ({
      key,
      to: config.path,
      label: config.label,
      icon: config.icon,
      badge: config.badge
    }));
};

/**
 * Check if user has access to menu item
 * @param {string} menuKey - Menu item key
 * @param {string} userRole - User role
 * @returns {boolean}
 */
export const hasMenuAccess = (menuKey, userRole = 'user') => {
  const config = menuConfig[menuKey];
  if (!config || !config.enabled) return false;
  if (config.roles.includes('*')) return true;
  return config.roles.includes(userRole);
};
