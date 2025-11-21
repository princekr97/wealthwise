/**
 * Income Page - MUI Version - Responsive Design
 * Track and manage income sources with responsive analytics
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Grid, Container, Stack, IconButton, Chip, Typography, useMediaQuery, useTheme, TablePagination, FormControlLabel, Checkbox
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { incomeService } from '../services/incomeService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { INCOME_ICONS } from '../theme/muiTheme';
import ConfirmDialog from '../components/common/ConfirmDialog';

const SOURCES = Object.keys(INCOME_ICONS);
const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Income() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [incomes, setIncomes] = useState([]);
  const [bySource, setBySource] = useState({});
  const [loading, setLoading] = useState(true);
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
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      amount: '', sourceType: SOURCES[0], date: new Date().toISOString().split('T')[0],
      description: '', isRecurring: false, creditTo: 'Bank Account'
    }
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const data = await incomeService.getIncomes();
      const incomeList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setIncomes(incomeList);
      const grouped = Array.isArray(incomeList) ? incomeList.reduce((acc, inc) => {
        acc[inc.sourceType] = (acc[inc.sourceType] || 0) + inc.amount;
        return acc;
      }, {}) : {};
      setBySource(grouped);
    } catch (error) { 
      console.error('Failed to fetch incomes:', error);
      toast.error('Failed to fetch incomes'); 
    } 
    finally { setLoading(false); }
  };

  const onSubmit = async (values) => {
    try {
      await incomeService.createIncome({ ...values, amount: Number(values.amount) });
      toast.success('Income added'); reset(); setOpen(false); fetchData();
    } catch (error) { toast.error('Failed to add income'); }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try { 
      await incomeService.deleteIncome(deleteId); 
      toast.success('Income deleted'); 
      fetchData(); 
    }
    catch (error) { 
      toast.error('Failed to delete income'); 
    }
  };

  // Filter incomes based on date range
  useEffect(() => {
    if (!incomes) {
      setFilteredIncomes([]);
      return;
    }

    const filtered = incomes.filter((income) => {
      const incomeDate = new Date(income.date).toISOString().split('T')[0];
      const from = fromDate ? new Date(fromDate).toISOString().split('T')[0] : null;
      const to = toDate ? new Date(toDate).toISOString().split('T')[0] : null;

      if (from && incomeDate < from) return false;
      if (to && incomeDate > to) return false;
      return true;
    });

    setFilteredIncomes(filtered);
    setPage(0);
  }, [incomes, fromDate, toDate]);

  const totalIncome = useMemo(() => Array.isArray(filteredIncomes) ? filteredIncomes.reduce((sum, i) => sum + i.amount, 0) : 0, [filteredIncomes]);
  const sourceData = useMemo(() => Object.entries(bySource || {}).map(([source, amount]) => ({ name: source, value: amount })), [bySource]);
  const paginatedIncomes = Array.isArray(filteredIncomes) ? filteredIncomes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : [];

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ py: { xs: 2, sm: 2, md: 3, lg: 4 }, px: { xs: 1, sm: 1, md: 2, lg: 4 } }}>
      <Box sx={{ width: '100%', mx: 'auto' }}>
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
                💼 Income
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' } }}>
                Track all your income sources
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpen(true)} size={isMobile ? 'small' : 'medium'}>
            Add Income
          </Button>
        </Stack>

        <Grid container spacing={{ xs: 2, sm: 2, md: 3, lg: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
                <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  Total Income
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                  {formatCurrency(totalIncome)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
                <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  Records
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                  {filteredIncomes.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
                <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  Sources
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                  {Object.keys(bySource).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card>
              <CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
                <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  Avg/Source
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                  {formatCurrency(totalIncome / (Object.keys(bySource).length || 1))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 2, sm: 2, md: 3, lg: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Grid item xs={12} sm={12} md={12} lg={6}>
            <Card>
              <CardContent sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
                    📊 By Source
                  </Typography>
                  {sourceData.length > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                      {sourceData.length} sources
                    </Typography>
                  )}
                </Box>
              </CardContent>

              <CardContent sx={{ pt: 1 }}>
                {sourceData.length > 0 ? (
                  <>
                    <Box sx={{ width: '100%', height: { xs: 250, sm: 280, md: 300 }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={sourceData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={isMobile ? 70 : (isTablet ? 90 : 110)}
                          >
                            {sourceData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                          </Pie>
                          <Tooltip 
                            formatter={(v) => formatCurrency(v)} 
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
                      {sourceData && sourceData.length > 0 && sourceData.map((item, index) => {
                        const total = sourceData.reduce((sum, i) => sum + (i.value || 0), 0);
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
                    📈 Top Sources
                  </Typography>
                  {sourceData.length > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                      Top 5
                    </Typography>
                  )}
                </Box>
              </CardContent>

              <CardContent sx={{ pt: 1 }}>
                {sourceData.length > 0 ? (
                  <Box sx={{ width: '100%', height: { xs: 250, sm: 280, md: 300 } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sourceData.slice(0, 5)}>
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
                          labelFormatter={(label) => `Source: ${label}`}
                        />
                        <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
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

        {/* Income Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' } }}>
              📋 Recent Incomes
            </Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Date</TableCell>
                    {!isMobile && <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Source</TableCell>}
                    <TableCell align="right" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Amount</TableCell>
                    {!isTablet && <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Type</TableCell>}
                    <TableCell align="center" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedIncomes.map((income) => (
                    <TableRow key={income._id} hover>
                      <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>{formatDate(income.date)}</TableCell>
                      {!isMobile && <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>{income.sourceType}</TableCell>}
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                        +{formatCurrency(income.amount)}
                      </TableCell>
                      {!isTablet && <TableCell sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>{income.isRecurring ? 'Recurring' : 'Once'}</TableCell>}
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleDelete(income._id)} color="error">
                          <DeleteIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={incomes?.length || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </CardContent>
        </Card>

        {/* Add Income Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Add Income</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <Controller
                name="sourceType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Source Type</InputLabel>
                    <Select {...field} label="Source Type">
                      {SOURCES.map((src) => (
                        <MenuItem key={src} value={src}>
                          {src}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Amount"
                    type="number"
                    size="small"
                    fullWidth
                    inputProps={{ step: '0.01' }}
                  />
                )}
              />
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Date" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Description" size="small" fullWidth multiline rows={2} />
                )}
              />
              <Controller
                name="creditTo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Credit To (e.g., Bank Account, Wallet)"
                    size="small"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="isRecurring"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Checkbox {...field} />} label="Recurring Income" />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary">
              Add
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
            📅 Filter Income by Date Range
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
          title="Delete Income Record"
          message="This income record will be permanently deleted. This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          severity="error"
        />
      </Box>
    </Box>
  );
}
