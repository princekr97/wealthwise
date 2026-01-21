/**
 * Debounce Utility
 * Delays function execution until after wait time has elapsed
 * Reduces API calls during rapid user input
 */

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds (default: 300ms)
 * @returns {Function} Debounced function
 * @example
 * const debouncedSearch = debounce((query) => fetchResults(query), 300);
 * debouncedSearch('test'); // Only calls after 300ms of no more calls
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function calls
 * Ensures function is called at most once per wait period
 * @param {Function} func - Function to throttle
 * @param {number} wait - Wait time in milliseconds (default: 300ms)
 * @returns {Function} Throttled function
 * @example
 * const throttledScroll = throttle(() => handleScroll(), 100);
 */
export const throttle = (func, wait = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
};
