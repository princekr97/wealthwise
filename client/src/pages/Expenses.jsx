/**
 * Expenses Page - MUI Version
 * 
 * Track, manage, and visualize expenses with category icons and responsive design.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Grid,
  Stack,
  IconButton,
  FormControlLabel,
  Checkbox,
  Typography,
  useMediaQuery,
  useTheme,
  alpha
} from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_ICONS, PRIORITY_COLORS } from '../theme/muiTheme';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import SummaryCard from '../components/layout/SummaryCard';
import SummaryCardGrid from '../components/layout/SummaryCardGrid';
import ChartCard, { ChartGrid, EmptyChartState, CategoryLegend } from '../components/layout/ChartCard';

const CATEGORIES = Object.keys(CATEGORY_ICONS);
const PAYMENT_METHODS = ['UPI', 'Card', 'Cash', 'Net Banking', 'Wallet'];
const PRIORITIES = ['low', 'medium', 'high'];

// Vibrant Premium Color Palette - Category-Coded
const COLORS = [
  '#10B981', // Emerald - Investments
  '#3B82F6', // Blue - Rent
  '#F97316', // Orange - Shopping  
  '#EF4444', // Red - Food & Dining
  '#8B5CF6', // Purple - Bills
  '#06B6D4', // Cyan - Transportation
  '#EC4899', // Pink - Groceries
  '#84CC16'  // Lime - Personal Care
];

export default function Expenses() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { expenses, byCategory, loading, addExpense, updateExpense, removeExpense } = useExpenses();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);

  // Date filtering
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempFromDate, setTempFromDate] = useState('');
  const [tempToDate, setTempToDate] = useState(new Date().toISOString().split('T')[0]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      amount: '',
      category: CATEGORIES[0],
      date: new Date().toISOString().split('T')[0],
      description: '',
      priority: 'medium',
      paymentMethod: 'UPI',
      bankName: '',
      isRecurring: false
    }
  });

  const onSubmit = async (values) => {
    try {
      if (editMode && editingId) {
        await updateExpense(editingId, {
          ...values,
          amount: Number(values.amount),
          isRecurring: Boolean(values.isRecurring)
        });
        toast.success('Expense updated successfully');
      } else {
        await addExpense({
          ...values,
          amount: Number(values.amount),
          isRecurring: Boolean(values.isRecurring)
        });
        toast.success('Expense added successfully');
      }
      reset();
      setOpen(false);
      setEditMode(false);
      setEditingId(null);
    } catch (error) {
      toast.error(editMode ? 'Failed to update expense' : 'Failed to add expense');
      console.error(error);
    }
  };

  const handleEdit = (expense) => {
    setEditMode(true);
    setEditingId(expense._id);
    reset({
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      description: expense.description || '',
      priority: expense.priority || 'medium',
      paymentMethod: expense.paymentMethod || 'UPI',
      bankName: expense.bankName || '',
      isRecurring: expense.isRecurring || false
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await removeExpense(deleteId);
      toast.success('Expense deleted');
      setConfirmOpen(false);
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter expenses based on date range
  useEffect(() => {
    if (!expenses) {
      setFilteredExpenses([]);
      return;
    }

    const filtered = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date).toISOString().split('T')[0];
      const from = fromDate ? new Date(fromDate).toISOString().split('T')[0] : null;
      const to = toDate ? new Date(toDate).toISOString().split('T')[0] : null;

      if (from && expenseDate < from) return false;
      if (to && expenseDate > to) return false;
      return true;
    });

    setFilteredExpenses(filtered);
    setPage(0); // Reset to first page when filtering
  }, [expenses, fromDate, toDate]);

  const categoryData = useMemo(() => {
    return Object.entries(byCategory || {}).map(([category, amount]) => ({
      name: category,
      value: amount
    })).sort((a, b) => b.value - a.value);
  }, [byCategory]);

  const paginatedExpenses = useMemo(() => {
    return filteredExpenses?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) || [];
  }, [filteredExpenses, page, rowsPerPage]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  }, [filteredExpenses]);

  // Group expenses by date (Today, Yesterday, etc.)
  const groupedExpenses = useMemo(() => {
    if (!paginatedExpenses) return [];

    // Helper to normalize date to midnight for comparison
    const normalizeDate = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const today = normalizeDate(new Date());
    const yesterday = normalizeDate(new Date());
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = [];

    paginatedExpenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const normalizedExpenseDate = normalizeDate(expenseDate);

      let label = formatDate(expense.date);

      if (normalizedExpenseDate.getTime() === today.getTime()) {
        label = 'Today, ' + expenseDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      } else if (normalizedExpenseDate.getTime() === yesterday.getTime()) {
        label = 'Yesterday, ' + expenseDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      } else {
        // Format: "12 Jan 2026" or similar
        label = expenseDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }

      const lastGroup = groups[groups.length - 1];

      if (lastGroup && lastGroup.label === label) {
        lastGroup.items.push(expense);
      } else {
        groups.push({
          label: label,
          date: normalizedExpenseDate,
          items: [expense]
        });
      }
    });

    return groups;
  }, [paginatedExpenses]);

  return (
    <PageContainer>
      {/* Modern Hero Section */}
      <Box sx={{ mb: 4, mt: 1 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #2c2748 100%)',
            borderRadius: '24px',
            p: { xs: 3, sm: 4 },
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.4)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Abstract Background Shapes */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10%" cy="20%" r="100" fill="white" />
              <circle cx="90%" cy="80%" r="150" fill="white" />
              <path d="M0,200 Q400,0 800,200" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
            </svg>
          </Box>

          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 3 }}>

            {/* Left Content */}
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.9rem', mb: 1, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Total Spending
              </Typography>
              <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.5rem' }, letterSpacing: '-1px', lineHeight: 1 }}>
                {formatCurrency(totalExpenses)}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, fontSize: '0.95rem' }}>
                Track and visualize your spending habits
              </Typography>
            </Box>

            {/* Right Actions */}
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton
                onClick={() => setFilterModalOpen(true)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  width: 48,
                  height: 48,
                  borderRadius: '16px',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'translateY(-2px)' }
                }}
              >
                <FilterListIcon />
              </IconButton>

              <Button
                onClick={() => setOpen(true)}
                variant="contained"
                startIcon={<AddIcon />}
                size="large"
                sx={{
                  bgcolor: '#807a7aff',
                  color: '#white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  py: 1.5,
                  px: 3,
                  borderRadius: '16px',
                  textTransform: 'none',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.3)'
                  }
                }}
              >
                Add Expense
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Summary Stats Grid */}
      <SummaryCardGrid columns={4}>
        <SummaryCard
          icon="💸"
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          valueColor="error"
        />
        <SummaryCard
          icon="📋"
          label="Transactions"
          value={(filteredExpenses?.length || 0).toString()}
          valueColor="primary"
          subtitle={`${expenses?.length || 0} total records`}
        />
        <SummaryCard
          icon="📁"
          label="Categories"
          value={Object.keys(byCategory || {}).length.toString()}
          valueColor="info"
        />
        <SummaryCard
          icon="📊"
          label="Avg per Expense"
          value={formatCurrency((totalExpenses / (filteredExpenses?.length || 1)) || 0)}
          valueColor="success"
        />
      </SummaryCardGrid>

      {/* Charts Section */}
      <ChartGrid>
        {/* Category Breakdown */}
        <ChartCard
          title="📂 Expense Breakdown"
          subtitle={categoryData.length > 0 ? `${categoryData.length} categories` : undefined}
          footer={categoryData.length > 0 ? (
            <CategoryLegend data={categoryData} colors={COLORS} formatter={formatCurrency} />
          ) : undefined}
        >
          {categoryData.length === 0 ? (
            <EmptyChartState message="Add expenses to see breakdown" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={isMobile ? 60 : 80}
                  outerRadius={isMobile ? 85 : 120}
                  paddingAngle={3}
                  stroke="none"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: 'none',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    color: '#fff',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Expense Trend */}
        <ChartCard
          title="📈 Expense Trend"
          subtitle="Spending by category"
        >
          {expenses?.length === 0 ? (
            <EmptyChartState message="Add transactions to see trends" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.3)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: 'none',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    color: '#fff'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Spent']}
                />
                <Bar
                  dataKey="value"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </ChartGrid>

      {/* Modern Transaction List */}
      <Card sx={{
        boxShadow: 'none',
        bgcolor: 'transparent',
        mt: 3
      }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
            📋 Recent Transactions
          </Typography>
        </Box>

        {groupedExpenses.length > 0 ? (
          <Stack spacing={3}>
            {groupedExpenses.map((group, groupIndex) => (
              <Box key={group.label}>
                {/* Date Header */}
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: theme.palette.text.secondary,
                    mb: 1.5,
                    ml: 1,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {group.label}
                </Typography>

                {/* Group Items */}
                <Card sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.5)' : '#fff',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 3,
                  overflow: 'hidden'
                }}>
                  {group.items.map((expense, index) => {
                    const categoryColor = COLORS[CATEGORIES.indexOf(expense.category) % COLORS.length];

                    return (
                      <Box
                        key={expense._id}
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          borderBottom: index < group.items.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: theme.palette.action.hover,
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        {/* Icon */}
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '16px',
                            bgcolor: `${categoryColor}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            color: categoryColor
                          }}
                        >
                          {CATEGORY_ICONS[expense.category] || '📌'}
                        </Box>

                        {/* Details */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: theme.palette.text.primary }}>
                              {expense.category}
                            </Typography>
                            {expense.isRecurring && (
                              <Chip
                                label="Recurring"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  bgcolor: 'rgba(6, 182, 212, 0.15)',
                                  color: '#06B6D4',
                                  fontWeight: 700
                                }}
                              />
                            )}
                          </Box>
                          <Typography sx={{ fontSize: '0.85rem', color: theme.palette.text.secondary, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {expense.paymentMethod || 'Cash'}
                            {expense.description && (
                              <>
                                <span>•</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                                  {expense.description}
                                </span>
                              </>
                            )}
                          </Typography>
                        </Box>

                        {/* Amount */}
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: theme.palette.text.primary }}>
                            -{formatCurrency(expense.amount)}
                          </Typography>
                        </Box>

                        {/* Actions (Hover only) */}
                        <Box sx={{ display: 'flex', opacity: 0, transition: 'opacity 0.2s', '.MuiBox-root:hover > &': { opacity: 1 } }}>
                          <IconButton size="small" onClick={() => handleEdit(expense)}>
                            <EditIcon fontSize="small" sx={{ color: '#3B82F6' }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(expense._id)}>
                            <DeleteIcon fontSize="small" sx={{ color: '#EF4444' }} />
                          </IconButton>
                        </Box>
                      </Box>
                    );
                  })}
                </Card>
              </Box>
            ))}
          </Stack>
        ) : (
          <Box sx={{ py: 8, textAlign: 'center', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 4 }}>
            <Typography sx={{ fontSize: '3rem', mb: 2, opacity: 0.5 }}>💸</Typography>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>No expenses found</Typography>
            <Typography color="textSecondary">Start by adding a new expense</Typography>
          </Box>
        )}

        {/* Pagination */}
        {filteredExpenses && filteredExpenses.length > rowsPerPage && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredExpenses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ color: theme.palette.text.secondary }}
            />
          </Box>
        )}
      </Card>

      {/* Premium Add Expense Dialog - Frosted Glass */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '24px 16px 24px 16px',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)'
              : '#FFFFFF',
            backgroundAttachment: 'fixed',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === 'dark' ? '0px 24px 48px rgba(0, 0, 0, 0.7)' : '0px 24px 48px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }
        }}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(0, 0, 0, 0.75)'
            }
          }
        }}
      >
        {/* Header with Close Button */}
        <DialogTitle
          sx={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            fontWeight: 700,
            fontSize: '1.5rem',
            pb: 2,
            pt: 2.5,
            px: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            color: theme.palette.text.primary
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            size="medium"
            sx={{
              color: theme.palette.text.secondary,
              width: 40,
              height: 40,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.text.primary,
                transform: 'scale(1.1)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box component="span" sx={{ fontSize: '20px' }}>💸</Box>
          {editMode ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>

        {/* Form Content */}
        <DialogContent sx={{ px: 2.5, pt: 3, pb: 2 }}>
          <Stack spacing={2}>  {/* 16px vertical gaps */}

            {/* Amount Field - Primary Focus (56px height) */}
            <Controller
              name="amount"
              control={control}
              rules={{
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' }
              }}
              render={({ field, fieldState: { error } }) => (
                <Box>
                  <Typography
                    component="label"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : theme.palette.text.secondary,
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    Amount *
                  </Typography>
                  <TextField
                    {...field}
                    type="number"
                    placeholder="₹0.00"
                    inputProps={{ step: '0.01' }}
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: '52px',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB'
                      },
                      '& .MuiInputBase-input': {
                        color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                        '&:-webkit-autofill': {
                          WebkitBoxShadow: theme.palette.mode === 'dark' ? '0 0 0 100px #1E293B inset' : '0 0 0 100px #F9FAFB inset',
                          WebkitTextFillColor: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                          caretColor: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                          borderRadius: 'inherit'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  />
                </Box>
              )}
            />

            {/* Category Dropdown (52px height) */}
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field, fieldState: { error } }) => (
                <Box>
                  <Typography
                    component="label"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : theme.palette.text.secondary,
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    Category *
                  </Typography>
                  <FormControl fullWidth error={!!error}>
                    <Select
                      {...field}
                      sx={{
                        '& .MuiSelect-select': {
                          height: '52px',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '1rem',
                          fontWeight: 500,
                          py: 0,
                          color: theme.palette.text.primary
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        '& .MuiSvgIcon-root': {
                          color: 'rgba(255, 255, 255, 0.7)'
                        }
                      }}
                    >
                      {CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat} sx={{ fontSize: '1rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ fontSize: '1.5rem' }}>{CATEGORY_ICONS[cat]}</Box>
                            {cat}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                </Box>
              )}
            />

            {/* Date Picker (52px height) */}
            <Controller
              name="date"
              control={control}
              rules={{ required: 'Date is required' }}
              render={({ field, fieldState: { error } }) => (
                <Box>
                  <Typography
                    component="label"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : theme.palette.text.secondary,
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    Date *
                  </Typography>
                  <TextField
                    {...field}
                    type="date"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: '52px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB'
                      },
                      '& .MuiInputBase-input': {
                        color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                        '&:-webkit-autofill': {
                          WebkitBoxShadow: theme.palette.mode === 'dark' ? '0 0 0 100px #1E293B inset' : '0 0 0 100px #F9FAFB inset',
                          WebkitTextFillColor: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                          caretColor: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                          borderRadius: 'inherit'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      },
                      '& ::-webkit-calendar-picker-indicator': {
                        filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none'
                      }
                    }}
                  />
                </Box>
              )}
            />

            {/* Description (96px height - 3 lines) */}
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography
                    component="label"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : theme.palette.text.secondary,
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    Description <Box component="span" sx={{ color: '#6B7280', textTransform: 'none' }}>(optional)</Box>
                  </Typography>
                  <TextField
                    {...field}
                    placeholder="Add details..."
                    fullWidth
                    multiline
                    rows={3}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: '0.9375rem',
                        fontWeight: 400,
                        py: 1.5,
                        color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB'
                      },
                      '& .MuiInputBase-input': {
                        color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                        '&:-webkit-autofill': {
                          WebkitBoxShadow: theme.palette.mode === 'dark' ? '0 0 0 100px #1E293B inset' : '0 0 0 100px #F9FAFB inset',
                          WebkitTextFillColor: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                          caretColor: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                          borderRadius: 'inherit'
                        }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  />
                </Box>
              )}
            />

            {/* Priority with Color-Coded Dots (52px height) */}
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography
                    component="label"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : theme.palette.text.secondary,
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    Priority
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      {...field}
                      sx={{
                        '& .MuiSelect-select': {
                          height: '52px',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '1rem',
                          fontWeight: 500,
                          py: 0,
                          color: theme.palette.text.primary
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        '& .MuiSvgIcon-root': {
                          color: 'rgba(255, 255, 255, 0.7)'
                        }
                      }}
                    >
                      {PRIORITIES.map((p) => (
                        <MenuItem key={p} value={p} sx={{ fontSize: '1rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: p === 'high' ? '#EF4444' : p === 'medium' ? '#F59E0B' : '#10B981'
                              }}
                            />
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
            />

            {/* Payment Method (52px height) */}
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography
                    component="label"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : theme.palette.text.secondary,
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    Payment Method
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      {...field}
                      sx={{
                        '& .MuiSelect-select': {
                          height: '52px',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '1rem',
                          fontWeight: 500,
                          py: 0,
                          color: theme.palette.text.primary
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.2)'
                        },
                        '& .MuiSvgIcon-root': {
                          color: 'rgba(255, 255, 255, 0.7)'
                        }
                      }}
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <MenuItem key={method} value={method} sx={{ fontSize: '1rem' }}>
                          {method}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
            />

            {/* Recurring Expense - Custom Checkbox */}
            <Controller
              name="isRecurring"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.3)',
                        '&.Mui-checked': {
                          color: '#06B6D4'
                        }
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500, color: '#E2E8F0' }}>
                      Recurring Expense
                    </Typography>
                  }
                  sx={{ ml: 0 }}
                />
              )}
            />
          </Stack>
        </DialogContent>

        {/* CTA Button - Vibrant Gradient (56px height) */}
        <DialogActions sx={{ px: 2.5, pb: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            fullWidth
            size="large"
            sx={{
              height: '56px',
              background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
              color: '#FFFFFF',
              fontSize: '1.0625rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              borderRadius: '16px',
              boxShadow: '0px 8px 20px rgba(6, 182, 212, 0.4)',
              textTransform: 'uppercase',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                boxShadow: '0px 12px 28px rgba(6, 182, 212, 0.5)',
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(0) scale(0.97)'
              }
            }}
          >
            {editMode ? 'Update Expense' : 'Add Expense'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Modal */}
      <Dialog
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: 'rgba(30, 41, 59, 0.98)',
          }
        }}
      >
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
            onClick={() => setFilterModalOpen(false)}
            aria-label="close"
            size="small"
            sx={{ mr: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          Filter Expenses by Date Range
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, pb: 2 }}>
          <Stack spacing={2.5} sx={{ width: '100%', mt: 1 }}>
            <TextField
              label="From Date"
              type="date"
              value={tempFromDate}
              onChange={(e) => setTempFromDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true, sx: { color: '#94a3b8 !important', fontSize: '0.95rem' } }}
              variant="outlined"
              slotProps={{
                input: {
                  sx: {
                    colorScheme: 'dark',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '& .MuiInputBase-input': {
                      color: '#ffffff !important',
                      WebkitTextFillColor: '#ffffff !important', // Necessary for some browsers with MUI
                    },
                    '&::-webkit-calendar-picker-indicator': {
                      cursor: 'pointer',
                      opacity: 0.8,
                      '&:hover': { opacity: 1 }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(71, 85, 105, 0.5)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(148, 163, 184, 0.5)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                      borderWidth: '2px'
                    }
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: 1.5,
                }
              }}
            />
            <TextField
              label="To Date"
              type="date"
              value={tempToDate}
              onChange={(e) => setTempToDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true, sx: { color: '#94a3b8 !important', fontSize: '0.95rem' } }}
              variant="outlined"
              slotProps={{
                input: {
                  sx: {
                    colorScheme: 'dark',
                    fontSize: '1rem',
                    fontWeight: 500,
                    '& .MuiInputBase-input': {
                      color: '#ffffff !important', // Explicit white color
                      WebkitTextFillColor: '#ffffff !important',
                    },
                    '&::-webkit-calendar-picker-indicator': {
                      cursor: 'pointer',
                      opacity: 0.8,
                      '&:hover': { opacity: 1 }
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(71, 85, 105, 0.5)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(148, 163, 184, 0.5)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3b82f6',
                      borderWidth: '2px'
                    }
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: 1.5,
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button
              onClick={() => {
                setTempFromDate('');
                setTempToDate(new Date().toISOString().split('T')[0]);
              }}
              variant="outlined"
              startIcon={<RefreshIcon />}
              sx={{
                flex: 1,
                color: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: 50,
                textTransform: 'none',
                py: 0.75,
                fontSize: '0.875rem',
                '&:hover': {
                  borderColor: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff'
                }
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setFromDate(tempFromDate);
                setToDate(tempToDate);
                setFilterModalOpen(false);
              }}
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              sx={{
                flex: 1,
                borderRadius: 50,
                textTransform: 'none',
                py: 0.75,
                fontSize: '0.875rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              Apply Filter
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Expense"
        message="This expense record will be permanently deleted. This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        severity="error"
      />
    </PageContainer >
  );
}
