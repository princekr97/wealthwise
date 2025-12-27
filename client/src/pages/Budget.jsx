/**
 * Budget & Goals Page
 * 
 * Set budgets, track spending, and manage financial goals.
 * Uses MUI components for consistent design.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tabs,
  Tab,
  LinearProgress,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  Flag as FlagIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';
import budgetService from '../services/budgetService';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import SummaryCard from '../components/layout/SummaryCard';
import SummaryCardGrid from '../components/layout/SummaryCardGrid';

const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities'
];

export default function BudgetGoals() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [budgetFormData, setBudgetFormData] = useState({
    month: new Date().toISOString().split('T')[0].substring(0, 7),
    overallLimit: '',
    categories: DEFAULT_CATEGORIES.map(cat => ({ category: cat, limit: '' }))
  });

  const [goalFormData, setGoalFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [budgetRes, goalRes] = await Promise.all([
        budgetService.getBudgets(),
        budgetService.getGoals()
      ]);
      setBudgets(Array.isArray(budgetRes) ? budgetRes : []);
      setGoals(Array.isArray(goalRes) ? goalRes : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch budgets and goals');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSubmit = async () => {
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
      resetBudgetForm();
      setBudgetDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create budget');
    }
  };

  const handleGoalSubmit = async () => {
    try {
      const dataToSend = {
        ...goalFormData,
        targetAmount: parseFloat(goalFormData.targetAmount),
        currentAmount: parseFloat(goalFormData.currentAmount) || 0
      };
      await budgetService.createGoal(dataToSend);
      toast.success('Goal created successfully');
      resetGoalForm();
      setGoalDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create goal');
    }
  };

  const resetBudgetForm = () => {
    setBudgetFormData({
      month: new Date().toISOString().split('T')[0].substring(0, 7),
      overallLimit: '',
      categories: DEFAULT_CATEGORIES.map(cat => ({ category: cat, limit: '' }))
    });
  };

  const resetGoalForm = () => {
    setGoalFormData({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
  };

  const handleDelete = (id, type) => {
    setDeleteId(id);
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      if (confirmType === 'budget') {
        await budgetService.deleteBudget(deleteId);
        toast.success('Budget deleted');
      } else {
        await budgetService.deleteGoal(deleteId);
        toast.success('Goal deleted');
      }
      fetchData();
      setConfirmOpen(false);
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  // Calculate summary stats
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + (b.overallLimit || 0), 0);
  const totalGoalsTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalGoalsSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const avgGoalProgress = goals.length > 0
    ? goals.reduce((sum, g) => sum + (g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0), 0) / goals.length
    : 0;

  if (loading) {
    return (
      <PageContainer>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <SummaryCardGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={140} />
          ))}
        </SummaryCardGrid>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="🎯 Budget & Goals"
        subtitle="Plan your spending and track financial goals"
        actionLabel={activeTab === 0 ? 'Add Budget' : 'Add Goal'}
        onAction={() => activeTab === 0 ? setBudgetDialogOpen(true) : setGoalDialogOpen(true)}
      />

      {/* Summary Cards */}
      <SummaryCardGrid columns={4}>
        <SummaryCard
          icon="📊"
          label="Total Budgets"
          value={budgets.length.toString()}
          valueColor="warning"
          subtitle={budgets.length > 0 ? formatCurrency(totalBudgetLimit) + ' total limit' : undefined}
        />
        <SummaryCard
          icon="🎯"
          label="Active Goals"
          value={goals.length.toString()}
          valueColor="info"
          subtitle={goals.length > 0 ? formatPercent(avgGoalProgress) + ' avg progress' : undefined}
        />
        <SummaryCard
          icon="💰"
          label="Total Saved"
          value={formatCurrency(totalGoalsSaved)}
          valueColor="success"
        />
        <SummaryCard
          icon="🏁"
          label="Remaining"
          value={formatCurrency(totalGoalsTarget - totalGoalsSaved)}
          valueColor={(totalGoalsTarget - totalGoalsSaved) > 0 ? "primary" : "success"}
        />
      </SummaryCardGrid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            '& .MuiTab-root': {
              minHeight: { xs: 48, sm: 56 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        >
          <Tab icon={<TrendingUpIcon />} label="Budgets" iconPosition="start" />
          <Tab icon={<FlagIcon />} label="Goals" iconPosition="start" />
        </Tabs>
      </Card>

      {/* Budgets Tab */}
      {
        activeTab === 0 && (
          <Stack spacing={2}>
            {budgets.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">No budgets set yet. Create one to start tracking!</Typography>
                </CardContent>
              </Card>
            ) : (
              budgets.map((budget) => (
                <Card key={budget._id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                          {new Date(budget.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Overall Limit: {formatCurrency(budget.overallLimit)}
                        </Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => handleDelete(budget._id, 'budget')}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      {budget.categories?.map((cat, idx) => (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.02)' }}>
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>{cat.category}</Typography>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>{formatCurrency(cat.limit)}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        )
      }

      {/* Goals Tab */}
      {
        activeTab === 1 && (
          <Stack spacing={2}>
            {goals.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="textSecondary">No goals set yet. Create one to start saving!</Typography>
                </CardContent>
              </Card>
            ) : (
              goals.map((goal) => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                const remaining = goal.targetAmount - goal.currentAmount;

                return (
                  <Card key={goal._id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                            {goal.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Target: {formatCurrency(goal.targetAmount)} • Saved: {formatCurrency(goal.currentAmount)}
                          </Typography>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => handleDelete(goal._id, 'goal')}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box sx={{ mb: 1.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(progress, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: 'linear-gradient(90deg, #22C55E 0%, #3B82F6 100%)',
                            },
                          }}
                        />
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                          {formatPercent(progress)} Complete • {formatCurrency(remaining)} remaining
                        </Typography>
                      </Box>

                      {goal.deadline && (
                        <Typography variant="caption" color="textSecondary">
                          <strong>Deadline:</strong> {formatDate(goal.deadline)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Stack>
        )
      }

      {/* Add Budget Dialog */}
      <Dialog open={budgetDialogOpen} onClose={() => setBudgetDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{
          fontWeight: 700,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setBudgetDialogOpen(false)}
            aria-label="close"
            size="small"
            sx={{ mr: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          Set New Budget
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Month"
              type="month"
              value={budgetFormData.month}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, month: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Overall Budget Limit"
              type="number"
              value={budgetFormData.overallLimit}
              onChange={(e) => setBudgetFormData({ ...budgetFormData, overallLimit: e.target.value })}
              fullWidth
              size="small"
              placeholder="0.00"
            />

            <Typography variant="subtitle2" sx={{ fontWeight: 600, pt: 1 }}>Category Limits</Typography>
            {budgetFormData.categories.map((cat, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ minWidth: 120 }}>{cat.category}</Typography>
                <TextField
                  type="number"
                  value={cat.limit}
                  onChange={(e) => {
                    const newCats = [...budgetFormData.categories];
                    newCats[idx].limit = e.target.value;
                    setBudgetFormData({ ...budgetFormData, categories: newCats });
                  }}
                  size="small"
                  placeholder="0.00"
                  sx={{ flex: 1 }}
                />
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>

          <Button variant="contained" onClick={handleBudgetSubmit}>Save Budget</Button>
        </DialogActions>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={goalDialogOpen} onClose={() => setGoalDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{
          fontWeight: 700,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setGoalDialogOpen(false)}
            aria-label="close"
            size="small"
            sx={{ mr: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          Set New Goal
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Goal Name"
              value={goalFormData.name}
              onChange={(e) => setGoalFormData({ ...goalFormData, name: e.target.value })}
              fullWidth
              size="small"
              placeholder="e.g., Emergency Fund"
            />
            <TextField
              label="Target Amount"
              type="number"
              value={goalFormData.targetAmount}
              onChange={(e) => setGoalFormData({ ...goalFormData, targetAmount: e.target.value })}
              fullWidth
              size="small"
              placeholder="0.00"
            />
            <TextField
              label="Current Amount"
              type="number"
              value={goalFormData.currentAmount}
              onChange={(e) => setGoalFormData({ ...goalFormData, currentAmount: e.target.value })}
              fullWidth
              size="small"
              placeholder="0.00"
            />
            <TextField
              label="Deadline"
              type="date"
              value={goalFormData.deadline}
              onChange={(e) => setGoalFormData({ ...goalFormData, deadline: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>

          <Button variant="contained" onClick={handleGoalSubmit}>Save Goal</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmType === 'budget' ? 'Delete Budget' : 'Delete Goal'}
        message="This will be permanently deleted. This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        severity="error"
      />
    </PageContainer >
  );
}
