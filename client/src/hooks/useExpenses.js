/**
 * useExpenses Hook
 *
 * Handles fetching and mutating expense data & analytics.
 */

import { useEffect, useState } from 'react';
import { expenseService } from '../services/expenseService';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Load paginated expenses.
   */
  const loadExpenses = async (params = {}) => {
    setLoading(true);
    try {
      const res = await expenseService.list(params);
      setExpenses(res.data);
      setPagination(res.pagination);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load summary & by-category analytics.
   */
  const loadAnalytics = async () => {
    const [summaryData, catData] = await Promise.all([
      expenseService.summary(),
      expenseService.byCategory()
    ]);
    setSummary(summaryData);
    
    // Convert array format to object format if needed
    let categoryData = {};
    console.log('DEBUG: catData =', catData);
    console.log('DEBUG: catData.categories =', catData?.categories);
    
    if (Array.isArray(catData?.categories)) {
      catData.categories.forEach(item => {
        console.log('DEBUG: Processing category =', item.category, 'amount =', item.totalAmount);
        // Backend returns totalAmount, not total
        categoryData[item.category] = item.totalAmount || 0;
      });
    } else if (catData?.categories && typeof catData.categories === 'object') {
      categoryData = catData.categories;
    }
    
    console.log('DEBUG: Final categoryData =', categoryData);
    setByCategory(categoryData);
  };

  const addExpense = async (payload) => {
    const created = await expenseService.create(payload);
    // Refresh analytics after adding
    await loadAnalytics();
    setExpenses((prev) => [created, ...prev]);
    return created;
  };

  const updateExpense = async (id, payload) => {
    const updated = await expenseService.update(id, payload);
    setExpenses((prev) => prev.map((e) => (e._id === id ? updated : e)));
    return updated;
  };

  const removeExpense = async (id) => {
    await expenseService.remove(id);
    // Refresh analytics after deleting
    await loadAnalytics();
    setExpenses((prev) => prev.filter((e) => e._id !== id));
  };

  useEffect(() => {
    loadExpenses();
    loadAnalytics();
  }, []);

  return {
    expenses,
    pagination,
    summary,
    byCategory,
    loading,
    loadExpenses,
    loadAnalytics,
    addExpense,
    updateExpense,
    removeExpense
  };
};