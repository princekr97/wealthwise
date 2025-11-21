/**
 * Investments Page - MUI Version
 * Real portfolio tracking with returns, responsive design, and dashboard-style charts
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Grid, Container, Stack, IconButton, Chip, Typography, useMediaQuery, useTheme,
  TablePagination, Alert, CircularProgress, LinearProgress
} from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter
} from 'recharts';
import { Add as AddIcon, Delete as DeleteIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { investmentService } from '../services/investmentService';
import { formatCurrency, formatDate, formatPercent } from '../utils/formatters';
import ConfirmDialog from '../components/common/ConfirmDialog';

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
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem', lg: '1.75rem' } }}>📈 Investments</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' } }}>Track and grow your investment portfolio</Typography>
            </Box>
          </Box>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpen(true)} size={isMobile ? 'small' : 'medium'}>
            Add Investment
          </Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Summary Cards */}
        <Grid container spacing={{ xs: 2, sm: 2, md: 3, lg: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card><CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
              <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Amount Invested</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>{formatCurrency(totalInvested)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card><CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
              <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Current Value</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>{formatCurrency(totalCurrentValue)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card><CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Total Return</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: totalReturn >= 0 ? 'success.main' : 'error.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                    {formatCurrency(totalReturn)}
                  </Typography>
                </Box>
                {totalReturn >= 0 ? <TrendingUpIcon sx={{ color: 'success.main', fontSize: 24 }} /> : <TrendingDownIcon sx={{ color: 'error.main', fontSize: 24 }} />}
              </Stack>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card><CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Return %</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: returnPercent >= 0 ? 'success.main' : 'error.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                    {formatPercent(returnPercent)}
                  </Typography>
                </Box>
                {returnPercent >= 0 ? <TrendingUpIcon sx={{ color: 'success.main', fontSize: 24 }} /> : <TrendingDownIcon sx={{ color: 'error.main', fontSize: 24 }} />}
              </Stack>
            </CardContent></Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={{ xs: 2, sm: 2, md: 3, lg: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
                    💰 Portfolio Allocation
                  </Typography>
                  {byType.length > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                      {byType.length} types
                    </Typography>
                  )}
                </Box>
              </CardContent>

              <CardContent sx={{ pt: 1 }}>
                {byType.length > 0 ? (
                  <>
                    <Box sx={{ width: '100%', height: { xs: 250, sm: 280, md: 300 }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={byType} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={isMobile ? 70 : (isTablet ? 90 : 110)}
                          >
                            {byType.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v) => formatCurrency(v)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    {/* Legend Grid */}
                    <Box sx={{ 
                      mt: 3, 
                      pt: 2, 
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr', md: '1fr 1fr' },
                      gap: { xs: 1.5, sm: 2 },
                      rowGap: { xs: 1.5, sm: 2 }
                    }}>
                      {byType && byType.length > 0 && byType.map((item, index) => {
                        const total = byType.reduce((sum, i) => sum + (i.value || 0), 0);
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

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
                    📊 Return Analysis
                  </Typography>
                  {investments.length > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                      Top 5
                    </Typography>
                  )}
                </Box>
              </CardContent>

              <CardContent sx={{ pt: 1 }}>
                {investments.length > 0 ? (
                  <Box sx={{ width: '100%', height: { xs: 250, sm: 280, md: 300 } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={investments.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: isMobile ? 10 : 12, fill: 'rgba(255,255,255,0.7)' }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis 
                          tick={{ fontSize: isMobile ? 10 : 12, fill: 'rgba(255,255,255,0.7)' }}
                          tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Bar dataKey="currentValue" fill="#22C55E" radius={[8, 8, 0, 0]} />
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
          <DialogTitle sx={{ fontWeight: 700 }}>Add Investment</DialogTitle>
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
            <Button onClick={() => setOpen(false)}>Cancel</Button>
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
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            📅 Filter Investments by Date Range
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="From Date"
                type="date"
                value={tempFromDate}
                onChange={(e) => setTempFromDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' }
                  }
                }}
              />
              <TextField
                label="To Date"
                type="date"
                value={tempToDate}
                onChange={(e) => setTempToDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 1,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' }
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
            >
              Reset
            </Button>
            <Button
              onClick={() => setFilterModalOpen(false)}
              variant="outlined"
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
          title="Delete Investment"
          message="This investment record will be permanently deleted. This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          severity="error"
        />
      </Box>
    </Box>
  );
}
