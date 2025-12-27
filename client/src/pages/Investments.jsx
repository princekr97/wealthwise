/**
 * Investments Page - MUI Version
 * Real portfolio tracking with returns, responsive design, and dashboard-style charts
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Grid, Stack, IconButton, Chip, Typography, useMediaQuery, useTheme,
  TablePagination, Alert, CircularProgress, LinearProgress
} from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { investmentService } from '../services/investmentService';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import SummaryCard from '../components/layout/SummaryCard';
import SummaryCardGrid from '../components/layout/SummaryCardGrid';
import ChartCard, { ChartGrid, EmptyChartState, CategoryLegend } from '../components/layout/ChartCard';

const INVESTMENT_TYPES = ['Stocks', 'Mutual Funds', 'FD', 'PPF', 'NPS', 'Gold', 'Crypto', 'Real Estate', 'Bonds', 'Other'];
const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#6B7280'];

export default function Investments() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 3 : 10);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempFromDate, setTempFromDate] = useState('');
  const [tempToDate, setTempToDate] = useState(new Date().toISOString().split('T')[0]);
  const [filteredInvestments, setFilteredInvestments] = useState([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      type: 'Stocks',
      platform: '',
      name: '',
      amountInvested: '',
      currentValue: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      units: ''
    }
  });

  useEffect(() => { fetchInvestments(); }, []);

  useEffect(() => {
    const filtered = investments.filter((item) => {
      const itemDate = new Date(item.purchaseDate).toISOString().split('T')[0];
      const from = fromDate ? new Date(fromDate).toISOString().split('T')[0] : null;
      const to = toDate ? new Date(toDate).toISOString().split('T')[0] : null;

      if (from && itemDate < from) return false;
      if (to && itemDate > to) return false;
      return true;
    });

    setFilteredInvestments(filtered);
    setPage(0);
  }, [investments, fromDate, toDate]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await investmentService.getInvestments();
      const investmentList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setInvestments(investmentList);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to fetch investments';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      const dataToSend = {
        ...values,
        amountInvested: parseFloat(values.amountInvested),
        currentValue: parseFloat(values.currentValue),
        units: values.units ? parseFloat(values.units) : null
      };

      if (dataToSend.amountInvested <= 0) {
        toast.error('Amount invested must be greater than 0');
        return;
      }
      if (dataToSend.currentValue <= 0) {
        toast.error('Current value must be greater than 0');
        return;
      }

      await investmentService.createInvestment(dataToSend);
      toast.success('Investment added successfully');
      reset();
      setOpen(false);
      fetchInvestments();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to add investment';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await investmentService.deleteInvestment(deleteId);
      toast.success('Investment deleted');
      fetchInvestments();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete investment');
    }
  };

  const totalInvested = useMemo(() => filteredInvestments.reduce((sum, inv) => sum + (inv.amountInvested || 0), 0), [filteredInvestments]);
  const totalCurrentValue = useMemo(() => filteredInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0), [filteredInvestments]);
  const totalReturn = totalCurrentValue - totalInvested;
  const returnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const byType = useMemo(() => {
    const grouped = {};
    filteredInvestments.forEach(inv => {
      grouped[inv.type] = (grouped[inv.type] || 0) + inv.currentValue;
    });
    return Object.entries(grouped).map(([type, value]) => ({ name: type, value }));
  }, [filteredInvestments]);

  const paginatedInvestments = useMemo(() => {
    return filteredInvestments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredInvestments, page, rowsPerPage]);

  if (loading) {
    return (
      <Box sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="📈 Investments"
        subtitle="Track and grow your investment portfolio"
        actionLabel="Add Investment"
        onAction={() => setOpen(true)}
        leftContent={
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
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary Cards */}
      <SummaryCardGrid columns={4}>
        <SummaryCard
          icon="💰"
          label="Amount Invested"
          value={formatCurrency(totalInvested)}
          valueColor="info"
          subtitle={`${filteredInvestments.length} investments`}
        />
        <SummaryCard
          icon="📊"
          label="Current Value"
          value={formatCurrency(totalCurrentValue)}
          valueColor="primary"
        />
        <SummaryCard
          icon={totalReturn >= 0 ? "📈" : "📉"}
          label="Total Return"
          value={formatCurrency(totalReturn)}
          valueColor={totalReturn >= 0 ? 'success' : 'error'}
          trend={formatPercent(returnPercent)}
        />
        <SummaryCard
          icon="🎯"
          label="Return %"
          value={formatPercent(returnPercent)}
          valueColor={returnPercent >= 0 ? 'success' : 'error'}
        />
      </SummaryCardGrid>

      <ChartGrid>
        {/* Portfolio Allocation */}
        <ChartCard
          title="📂 Portfolio Allocation"
          subtitle={byType.length > 0 ? `${byType.length} types` : undefined}
          footer={byType.length > 0 ? (
            <CategoryLegend data={byType} colors={COLORS} formatter={formatCurrency} />
          ) : undefined}
        >
          {byType.length === 0 ? (
            <EmptyChartState message="Add investments to see allocation" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={isMobile ? 40 : (isTablet ? 55 : 65)}
                  outerRadius={isMobile ? 70 : (isTablet ? 90 : 110)}
                  paddingAngle={2}
                  stroke="transparent"
                  dataKey="value"
                >
                  {byType.map((entry, index) => (
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
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Return Analysis */}
        <ChartCard
          title="📊 Return Analysis"
          subtitle="Top investments by value"
        >
          {investments.length === 0 ? (
            <EmptyChartState message="Add investments to see performance" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={investments.slice(0, 5)} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.5)"
                  tickLine={false}
                  fontSize={11}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  tickLine={false}
                  fontSize={11}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 8,
                    fontSize: 12,
                    padding: '8px 12px'
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar
                  dataKey="currentValue"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </ChartGrid>

      {/* Investments Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>📋 Your Investments</Typography>

          {/* Desktop Table */}
          {!isMobile && (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Name</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>Type</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem' }}>Invested</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem' }}>Current</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem' }}>Return</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.8rem' }}>%</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.8rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedInvestments.length > 0 ? (
                    paginatedInvestments.map((inv) => {
                      const invReturn = inv.currentValue - inv.amountInvested;
                      const invReturnPercent = (invReturn / inv.amountInvested) * 100;
                      return (
                        <TableRow key={inv._id} hover>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{inv.name}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}><Chip label={inv.type} size="small" variant="outlined" /></TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{formatCurrency(inv.amountInvested)}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.85rem' }}>{formatCurrency(inv.currentValue)}</TableCell>
                          <TableCell align="right" sx={{ color: invReturn >= 0 ? 'success.main' : 'error.main', fontWeight: 600, fontSize: '0.85rem' }}>
                            {formatCurrency(invReturn)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: invReturnPercent >= 0 ? 'success.main' : 'error.main', fontWeight: 600, fontSize: '0.85rem' }}>
                            {formatPercent(invReturnPercent)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => handleDelete(inv._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography color="textSecondary" sx={{ fontSize: '0.9rem' }}>No investments yet. Add one to get started!</Typography>
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
              {paginatedInvestments.length > 0 ? (
                paginatedInvestments.map((inv) => {
                  const invReturn = inv.currentValue - inv.amountInvested;
                  const invReturnPercent = (invReturn / inv.amountInvested) * 100;
                  return (
                    <Box
                      key={inv._id}
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
                            {inv.name}
                          </Typography>
                          <Chip label={inv.type} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(inv._id)}
                          sx={{ mt: -1, mr: -1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                            Invested
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {formatCurrency(inv.amountInvested)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                            Current
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {formatCurrency(inv.currentValue)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 1 }}>
                        <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                            Return
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: invReturn >= 0 ? 'success.main' : 'error.main'
                            }}
                          >
                            {formatCurrency(invReturn)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                            Return %
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: invReturnPercent >= 0 ? 'success.main' : 'error.main'
                            }}
                          >
                            {formatPercent(invReturnPercent)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3, fontSize: '0.9rem' }}>
                  No investments yet. Add one to get started!
                </Typography>
              )}
            </Stack>
          )}

          {investments.length > rowsPerPage && (
            <TablePagination
              rowsPerPageOptions={[3, 5, 10, 25]}
              component="div"
              count={investments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Investment Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
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
            onClick={() => setOpen(false)}
            aria-label="close"
            size="small"
            sx={{ mr: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          Add Investment
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Controller
              name="type"
              control={control}
              rules={{ required: 'Type is required' }}
              render={({ field }) => (
                <FormControl fullWidth size="small" error={!!errors.type}>
                  <InputLabel>Investment Type *</InputLabel>
                  <Select {...field} label="Investment Type *">
                    {INVESTMENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="name"
              control={control}
              rules={{ required: 'Name/Symbol is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name/Symbol *"
                  fullWidth
                  size="small"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="platform"
              control={control}
              rules={{ required: 'Platform is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Platform *"
                  fullWidth
                  size="small"
                  placeholder="e.g., Zerodha, Groww"
                  error={!!errors.platform}
                  helperText={errors.platform?.message}
                />
              )}
            />

            <Controller
              name="amountInvested"
              control={control}
              rules={{ required: 'Amount is required', min: { value: 0.01, message: 'Amount must be > 0' } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Amount Invested *"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  fullWidth
                  size="small"
                  error={!!errors.amountInvested}
                  helperText={errors.amountInvested?.message}
                />
              )}
            />

            <Controller
              name="currentValue"
              control={control}
              rules={{ required: 'Current value is required', min: { value: 0.01, message: 'Value must be > 0' } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Current Value *"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  fullWidth
                  size="small"
                  error={!!errors.currentValue}
                  helperText={errors.currentValue?.message}
                />
              )}
            />

            <Controller
              name="purchaseDate"
              control={control}
              rules={{ required: 'Date is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Purchase Date *"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.purchaseDate}
                  helperText={errors.purchaseDate?.message}
                />
              )}
            />

            <Controller
              name="units"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Units (optional)"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  fullWidth
                  size="small"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>

          <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary">
            Add Investment
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
          📅 Filter Investments by Date Range
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
                      WebkitTextFillColor: '#ffffff !important',
                    },
                    '&::-webkit-calendar-picker-indicator': {
                      // filter: 'invert(1)',
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
                      color: '#ffffff !important',
                      WebkitTextFillColor: '#ffffff !important',
                    },
                    '&::-webkit-calendar-picker-indicator': {
                      // filter: 'invert(1)',
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
        title="Delete Investment"
        message="This investment record will be permanently deleted. This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        severity="error"
      />
    </PageContainer>
  );
}

