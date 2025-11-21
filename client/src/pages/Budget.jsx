/**
 * Budget & Goals Page
 * Set budgets, track spending, and manage financial goals
 */

import { useState, useEffect } from 'react';
import { Plus, Target, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import budgetService from '../services/budgetService';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function BudgetGoals() {
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('budgets');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [budgetFormData, setBudgetFormData] = useState({
    month: new Date().toISOString().split('T')[0].substring(0, 7),
    overallLimit: '',
    categories: [
      { category: 'Food & Dining', limit: '' },
      { category: 'Transportation', limit: '' },
      { category: 'Shopping', limit: '' },
      { category: 'Entertainment', limit: '' },
      { category: 'Bills & Utilities', limit: '' }
    ]
  });

  const [goalFormData, setGoalFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: ''
  });

  useEffect(() => {
    fetchBudgetsAndGoals();
  }, []);

  const fetchBudgetsAndGoals = async () => {
    setLoading(true);
    try {
      const [budgetRes, goalRes] = await Promise.all([
        budgetService.getBudgets(),
        budgetService.getGoals()
      ]);
      setBudgets(Array.isArray(budgetRes) ? budgetRes : []);
      setGoals(Array.isArray(goalRes) ? goalRes : []);
    } catch (error) {
      console.error('Failed to fetch budgets/goals:', error);
      toast.error('Failed to fetch budgets and goals');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...budgetFormData,
        overallLimit: parseFloat(budgetFormData.overallLimit),
        categories: budgetFormData.categories.map(c => ({
          category: c.category,
          limit: parseFloat(c.limit) || 0
        }))
      };
      await budgetService.createBudget(dataToSend);
      toast.success('Budget created successfully');
      setBudgetFormData({
        month: new Date().toISOString().split('T')[0].substring(0, 7),
        overallLimit: '',
        categories: [
          { category: 'Food & Dining', limit: '' },
          { category: 'Transportation', limit: '' },
          { category: 'Shopping', limit: '' },
          { category: 'Entertainment', limit: '' },
          { category: 'Bills & Utilities', limit: '' }
        ]
      });
      setShowBudgetForm(false);
      fetchBudgetsAndGoals();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create budget');
      console.error('Failed to create budget:', error);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...goalFormData,
        targetAmount: parseFloat(goalFormData.targetAmount),
        currentAmount: parseFloat(goalFormData.currentAmount)
      };
      await budgetService.createGoal(dataToSend);
      toast.success('Goal created successfully');
      setGoalFormData({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: ''
      });
      setShowGoalForm(false);
      fetchBudgetsAndGoals();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create goal');
      console.error('Failed to create goal:', error);
    }
  };

  const handleDeleteBudget = async (id) => {
    setDeleteId(id);
    setConfirmType('budget');
    setConfirmOpen(true);
  };

  const handleDeleteGoal = async (id) => {
    setDeleteId(id);
    setConfirmType('goal');
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      if (confirmType === 'budget') {
        await budgetService.deleteBudget(deleteId);
        toast.success('Budget deleted successfully');
      } else if (confirmType === 'goal') {
        await budgetService.deleteGoal(deleteId);
        toast.success('Goal deleted successfully');
      }
      fetchBudgetsAndGoals();
      setConfirmOpen(false);
      setDeleteId(null);
      setConfirmType(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete');
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg p-6 text-white">
        <div>
          <h1 className="text-3xl font-bold mb-2">Budget & Goals</h1>
          <p className="text-amber-100">Plan your spending and track financial goals</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'budgets'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="inline mr-2" size={18} /> Budgets
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'goals'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="inline mr-2" size={18} /> Goals
        </button>
      </div>

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowBudgetForm(true)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-amber-700 transition"
            >
              <Plus size={20} /> Add Budget
            </button>
          </div>

          {showBudgetForm && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Set New Budget</h2>
              <form onSubmit={handleBudgetSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                    <input
                      type="month"
                      required
                      value={budgetFormData.month}
                      onChange={(e) => setBudgetFormData({ ...budgetFormData, month: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overall Budget Limit *</label>
                    <input
                      type="number"
                      required
                      value={budgetFormData.overallLimit}
                      onChange={(e) => setBudgetFormData({ ...budgetFormData, overallLimit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Category Limits</h3>
                  <div className="space-y-3">
                    {budgetFormData.categories.map((cat, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{cat.category}</label>
                        </div>
                        <input
                          type="number"
                          value={cat.limit}
                          onChange={(e) => {
                            const newCats = [...budgetFormData.categories];
                            newCats[idx].limit = e.target.value;
                            setBudgetFormData({ ...budgetFormData, categories: newCats });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition"
                  >
                    Save Budget
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBudgetForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : budgets.length === 0 ? (
            <div className="text-center text-gray-500 bg-white rounded-lg p-6">No budgets set yet</div>
          ) : (
            <div className="space-y-4">
              {budgets.map((budget) => (
                <div key={budget._id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {new Date(budget.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <p className="text-sm text-gray-600">Overall Limit: {formatCurrency(budget.overallLimit)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBudget(budget._id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-3">
                    {budget.categories.map((cat, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{cat.category}</span>
                          <span className="text-gray-600">{formatCurrency(cat.limit)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowGoalForm(true)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-amber-700 transition"
            >
              <Plus size={20} /> Add Goal
            </button>
          </div>

          {showGoalForm && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Set New Goal</h2>
              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name *</label>
                    <input
                      type="text"
                      required
                      value={goalFormData.name}
                      onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g., Emergency Fund"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount *</label>
                    <input
                      type="number"
                      required
                      value={goalFormData.targetAmount}
                      onChange={(e) => setGoalFormData({ ...goalFormData, targetAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
                    <input
                      type="number"
                      value={goalFormData.currentAmount}
                      onChange={(e) => setGoalFormData({ ...goalFormData, currentAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input
                      type="date"
                      value={goalFormData.deadline}
                      onChange={(e) => setGoalFormData({ ...goalFormData, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition"
                  >
                    Save Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoalForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : goals.length === 0 ? (
            <div className="text-center text-gray-500 bg-white rounded-lg p-6">No goals set yet</div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                const remaining = goal.targetAmount - goal.currentAmount;

                return (
                  <div key={goal._id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{goal.name}</h3>
                        <p className="text-sm text-gray-600">
                          Target: {formatCurrency(goal.targetAmount)} • Current: {formatCurrency(goal.currentAmount)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatPercent(progress)} Complete • {formatCurrency(remaining)} remaining
                      </p>
                    </div>

                    {goal.deadline && (
                      <p className="text-sm text-gray-700">
                        <strong>Deadline:</strong> {formatDate(goal.deadline)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmType === 'budget' ? 'Delete Budget' : 'Delete Goal'}
        message={confirmType === 'budget' 
          ? 'This budget will be permanently deleted. This action cannot be undone.'
          : 'This goal will be permanently deleted. This action cannot be undone.'}
        onConfirm={confirmDelete}
        confirmText="Delete"
        severity="error"
      />
    </div>
  );
}
