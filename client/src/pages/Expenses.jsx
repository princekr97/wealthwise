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
  Container,
  Stack,
  IconButton,
  FormControlLabel,
  Checkbox,
  Typography,
  useMediaQuery,
  useTheme
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
  Tooltip,
  Legend
} from 'recharts';
import { Add as AddIcon, Delete as DeleteIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORY_ICONS, PRIORITY_COLORS } from '../theme/muiTheme';
import ConfirmDialog from '../components/common/ConfirmDialog';

const CATEGORIES = Object.keys(CATEGORY_ICONS);
const PAYMENT_METHODS = ['UPI', 'Card', 'Cash', 'Net Banking', 'Wallet'];
const PRIORITIES = ['low', 'medium', 'high'];

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

export default function Expenses() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { expenses, byCategory, loading, addExpense, removeExpense } = useExpenses();
  const [open, setOpen] = useState(false);
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
      await addExpense({
        ...values,
        amount: Number(values.amount),
        isRecurring: Boolean(values.isRecurring)
      });
      toast.success('Expense added successfully');
      reset();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to add expense');
      console.error(error);
    }
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

  return (
    <Box sx={{ py: { xs: 2, sm: 2, md: 3, lg: 4 }, px: { xs: 1, sm: 1, md: 2, lg: 4 } }}>
      <Box sx={{ width: '100%', mx: 'auto' }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: { xs: 2, sm: 3, md: 4 }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <IconButton
              onClick={() => {
                setTempFromDate(fromDate);
                setTempToDate(toDate);
                setFilterModalOpen(true);
              }}
              sx={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'primary.main',
                '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.2)' }
              }}
              title="Filter by date range"
            >
              <FilterListIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem', lg: '1.75rem' } }}>
                💰 Expenses
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' } }}>
                Track and visualize your spending patterns
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            size={isMobile ? 'small' : 'medium'}
            sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}
          >
            Add Expense
          </Button>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={{ xs: 2, sm: 2, md: 3, lg: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
                <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  Total Expenses
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                  {formatCurrency(totalExpenses)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
                <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  Total Transactions
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                  {expenses?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
                <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  Categories
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                  {Object.keys(byCategory || {}).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
                <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  Average/Expense
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                  {formatCurrency((totalExpenses / (expenses?.length || 1)) || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={{ xs: 2, sm: 2, md: 3, lg: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <Card>
              <CardContent sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
                    📊 By Category
                  </Typography>
                  {categoryData.length > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                      {categoryData.length} categories
                    </Typography>
                  )}
                </Box>
              </CardContent>

              <CardContent sx={{ pt: 1 }}>
                {categoryData.length > 0 ? (
                  <>
                    <Box sx={{ width: '100%', height: { xs: 250, sm: 280, md: 300 }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={isMobile ? 70 : (isTablet ? 90 : 110)}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => formatCurrency(value)} 
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.85)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: 6,
                              fontSize: 12,
                              padding: '8px 12px'
                            }}
                            labelFormatter={(label) => label}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Legend Grid */}
                    <Box sx={{ 
                      mt: 3, 
                      pt: 2, 
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                      gap: { xs: 1.5, sm: 2 },
                      rowGap: { xs: 1.5, sm: 2 }
                    }}>
                      {categoryData && categoryData.length > 0 && categoryData.map((item, index) => {
                        const total = categoryData.reduce((sum, i) => sum + (i.value || 0), 0);
                        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                        return (
                          <Box 
                            key={index}
                            sx={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                              p: 1.5,
                              borderRadius: 1.5,
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                borderColor: 'rgba(255,255,255,0.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: COLORS[index % COLORS.length],
                                  flexShrink: 0
                                }}
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                  fontWeight: 600,
                                  flex: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.name}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5 }}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  fontWeight: 600,
                                  color: COLORS[index % COLORS.length]
                                }}
                              >
                                {formatCurrency(item.value || 0)}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="textSecondary"
                                sx={{ 
                                  fontSize: { xs: '0.65rem', sm: '0.7rem' }
                                }}
                              >
                                {percentage}%
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </>
                ) : (
                  <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    No data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={12} md={12} lg={6}>
            <Card>
              <CardContent sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
                    📈 Top Categories
                  </Typography>
                  {categoryData.length > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                      Top 5
                    </Typography>
                  )}
                </Box>
              </CardContent>

              <CardContent sx={{ pt: 1 }}>
                {categoryData.length > 0 ? (
                  <Box sx={{ width: '100%', height: { xs: 250, sm: 280, md: 300 } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: isMobile ? 10 : 12, fill: 'rgba(255,255,255,0.7)' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis 
                          tick={{ fontSize: isMobile ? 10 : 12, fill: 'rgba(255,255,255,0.7)' }}
                          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.85)', 
                            border: '1px solid rgba(255,255,255,0.2)', 
                            borderRadius: 6,
                            fontSize: 12,
                            padding: '8px 12px'
                          }}
                          formatter={(value) => formatCurrency(value)}
                          labelFormatter={(label) => `Category: ${label}`}
                        />
                        <Bar dataKey="value" fill="#22C55E" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    No data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Expenses Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
              📋 Recent Expenses
            </Typography>
            
            {/* Desktop Table */}
            {!isMobile && (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <TableCell sx={{ fontSize: '0.8rem' }}>Date</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>Category</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem' }}>Amount</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>Payment</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>Priority</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.8rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedExpenses.length > 0 ? (
                      paginatedExpenses.map((expense) => (
                        <TableRow key={expense._id} hover>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{formatDate(expense.date)}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            <Chip
                              label={`${CATEGORY_ICONS[expense.category] || '📌'} ${expense.category}`}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            {formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{expense.paymentMethod}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            <Chip
                              label={expense.priority}
                              size="small"
                              sx={{
                                backgroundColor: PRIORITY_COLORS[expense.priority]?.bg || '#3B82F6',
                                color: '#fff'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(expense._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                            No expenses yet. Add one to get started!
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Mobile Card View */}
            {isMobile && (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {paginatedExpenses.length > 0 ? (
                  paginatedExpenses.map((expense) => (
                    <Box
                      key={expense._id}
                      sx={{
                        p: 2,
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 1.5,
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          borderColor: 'rgba(255,255,255,0.2)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {`${CATEGORY_ICONS[expense.category] || '📌'} ${expense.category}`}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                            {formatDate(expense.date)}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(expense._id)}
                          sx={{ mt: -1, mr: -1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', fontSize: '1rem' }}>
                          {formatCurrency(expense.amount)}
                        </Typography>
                        <Chip
                          label={expense.priority}
                          size="small"
                          sx={{
                            backgroundColor: PRIORITY_COLORS[expense.priority]?.bg || '#3B82F6',
                            color: '#fff',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                            Payment
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {expense.paymentMethod}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3, fontSize: '0.9rem' }}>
                    No expenses yet. Add one to get started!
                  </Typography>
                )}
              </Stack>
            )}

            {filteredExpenses && filteredExpenses.length > rowsPerPage && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredExpenses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </CardContent>
        </Card>

        {/* Add Expense Dialog */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add New Expense</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <Controller
                name="amount"
                control={control}
                rules={{ required: 'Amount is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Amount"
                    type="number"
                    inputProps={{ step: '0.01' }}
                    fullWidth
                    size="small"
                  />
                )}
              />

              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select {...field} label="Category">
                      {CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {CATEGORY_ICONS[cat]} {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Date" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                  />
                )}
              />

              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select {...field} label="Priority">
                      {PRIORITIES.map((p) => (
                        <MenuItem key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment Method</InputLabel>
                    <Select {...field} label="Payment Method">
                      {PAYMENT_METHODS.map((method) => (
                        <MenuItem key={method} value={method}>
                          {method}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="isRecurring"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Recurring Expense"
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              color="primary"
            >
              Add Expense
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
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff', pb: 1 }}>
            📅 Filter Expenses by Date Range
          </DialogTitle>
          <DialogContent sx={{ pt: 2.5, pb: 2 }}>
            <Stack spacing={2.5}>
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
                      color: '#fff',
                      fontSize: '1rem',
                      '& input': {
                        color: '#fff',
                        '&::placeholder': { color: '#64748b', opacity: 0.7 }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#475569'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#64748b'
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
                      color: '#fff',
                      fontSize: '1rem',
                      '& input': {
                        color: '#fff',
                        '&::placeholder': { color: '#64748b', opacity: 0.7 }
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#475569'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#64748b'
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
          <DialogActions sx={{ gap: 1, p: 2 }}>
            <Button
              onClick={() => {
                setTempFromDate('');
                setTempToDate(new Date().toISOString().split('T')[0]);
              }}
              variant="outlined"
              sx={{ color: '#94a3b8', borderColor: '#475569' }}
            >
              Reset
            </Button>
            <Button
              onClick={() => setFilterModalOpen(false)}
              variant="outlined"
              sx={{ color: '#94a3b8', borderColor: '#475569' }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setFromDate(tempFromDate);
                setToDate(tempToDate);
                setFilterModalOpen(false);
              }}
              variant="contained"
              color="primary"
            >
              Apply Filter
            </Button>
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
      </Box>
    </Box>
  );
}