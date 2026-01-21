/**
 * Custom Performance Hooks
 * Optimized hooks for common patterns
 */
import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Stable callback that doesn't change between renders
 * @param {Function} callback - Callback function
 * @returns {Function} Stable callback reference
 * @example
 * const handleClick = useStableCallback((id) => deleteItem(id));
 */
export const useStableCallback = (callback) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};

/**
 * Debounced value hook
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in ms (default: 300)
 * @returns {any} Debounced value
 * @example
 * const debouncedSearch = useDebouncedValue(searchQuery, 300);
 */
export const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

/**
 * Previous value hook
 * @param {any} value - Current value
 * @returns {any} Previous value
 * @example
 * const prevCount = usePrevious(count);
 */
export const usePrevious = (value) => {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};
