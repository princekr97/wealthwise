/**
 * Date Utility Functions
 * Helper functions for date formatting and manipulation
 */

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'medium')
 * @returns {string} Formatted date string
 * @example
 * formatDate(new Date(), 'short') // "12/25/2024"
 * formatDate(new Date(), 'long') // "December 25, 2024"
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  if (format === 'medium') {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  return d.toLocaleDateString();
};

/**
 * Check if date is within range
 * @param {Date|string} date - Date to check
 * @param {Date|string} start - Range start
 * @param {Date|string} end - Range end
 * @returns {boolean}
 * @example
 * isDateInRange('2024-01-15', '2024-01-01', '2024-01-31') // true
 */
export const isDateInRange = (date, start, end) => {
  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);
  return d >= s && d <= e;
};

/**
 * Get start of month
 * @param {Date|string} date - Date
 * @returns {Date} Start of month
 * @example
 * getStartOfMonth(new Date('2024-01-15')) // 2024-01-01 00:00:00
 */
export const getStartOfMonth = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Get end of month
 * @param {Date|string} date - Date
 * @returns {Date} End of month
 * @example
 * getEndOfMonth(new Date('2024-01-15')) // 2024-01-31 23:59:59
 */
export const getEndOfMonth = (date = new Date()) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
};

/**
 * Get relative time string (e.g., "2 days ago")
 * @param {Date|string} date - Date
 * @returns {string} Relative time string
 * @example
 * getRelativeTime(new Date(Date.now() - 86400000)) // "1 day ago"
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) > 1 ? 's' : ''} ago`;
};

/**
 * Get month name
 * @param {number} monthIndex - Month index (0-11)
 * @returns {string} Month name
 * @example
 * getMonthName(0) // "January"
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex] || '';
};

/**
 * Get days in month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Number of days
 * @example
 * getDaysInMonth(2024, 1) // 29 (leap year February)
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};
