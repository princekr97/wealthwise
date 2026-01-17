/**
 * Income Page - MUI Version - Responsive Design
 * Track and manage income sources with responsive analytics
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Grid, Stack, IconButton, Chip, Typography, useMediaQuery, useTheme, TablePagination, FormControlLabel, Checkbox
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, FilterList as FilterListIcon, Refresh as RefreshIcon, Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { incomeService } from '../services/incomeService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { INCOME_ICONS } from '../theme/muiTheme';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import SummaryCard from '../components/layout/SummaryCard';
import SummaryCardGrid from '../components/layout/SummaryCardGrid';
import ChartCard, { ChartGrid, EmptyChartState, CategoryLegend } from '../components/layout/ChartCard';

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

  if (loading) return <Typography sx={{ p: 3 }}>Loading...</Typography>;

  return (
    <PageContainer>
      <PageHeader
        title="💼 Income"
        subtitle="Track all your income sources"
        actionLabel="Add Income"
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

      <SummaryCardGrid columns={4}>
        <SummaryCard
          icon="💰"
          label="Total Income"
          value={formatCurrency(totalIncome)}
          valueColor="success"
        />
        <SummaryCard
          icon="📋"
          label="Transactions"
          value={filteredIncomes.length.toString()}
          valueColor="primary"
          subtitle={incomes?.length !== filteredIncomes?.length ? `${incomes?.length || 0} total` : undefined}
        />
        <SummaryCard
          icon="📊"
          label="Sources"
          value={Object.keys(bySource).length.toString()}
          valueColor="info"
        />
        <SummaryCard
          icon="📈"
          label="Avg per Source"
          value={formatCurrency(totalIncome / (Object.keys(bySource).length || 1))}
          valueColor="success"
        />
      </SummaryCardGrid>

      <ChartGrid>
        {/* Source Breakdown */}
        <ChartCard
          title="📂 Income by Source"
          subtitle={sourceData.length > 0 ? `${sourceData.length} sources` : undefined}
          footer={sourceData.length > 0 ? (
            <CategoryLegend data={sourceData} colors={COLORS} formatter={formatCurrency} />
          ) : undefined}
        >
          {sourceData.length === 0 ? (
            <EmptyChartState message="Add income to see source breakdown" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={isMobile ? 40 : (isTablet ? 55 : 65)}
                  outerRadius={isMobile ? 70 : (isTablet ? 90 : 110)}
                  paddingAngle={2}
                  stroke="transparent"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
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

        {/* Top Sources */}
        <ChartCard
          title="📈 Top Sources"
          subtitle="Income contribution"
        >
          {sourceData.length === 0 ? (
            <EmptyChartState message="Add income to see contribution trend" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData.slice(0, 5)} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
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
                  dataKey="value"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </ChartGrid>

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

      {/* Premium Add Income Dialog - Frosted Glass */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '24px 24px 16px 16px',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid',
            borderImage: 'linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(16, 185, 129, 0.4)) 1',
            boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.15)',
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
        <DialogTitle sx={{
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
          color: '#FFFFFF'
        }}>
          <IconButton
            onClick={() => setOpen(false)}
            size="medium"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              width: 40,
              height: 40,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                transform: 'scale(1.1)'
              },
              '&:active': {
                transform: 'scale(0.95)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box component="span" sx={{ fontSize: '1.25rem' }}>💼</Box>
          Add Income
        </DialogTitle>
        <DialogContent sx={{ px: 2.5, pt: 3, pb: 2 }}>
          <Stack spacing={2}>
            <Controller
              name="sourceType"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography component="label" sx={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8', mb: 1, display: 'block' }}>
                    Source Type
                  </Typography>
                  <FormControl fullWidth>
                    <Select {...field} sx={{ '& .MuiSelect-select': { height: '52px', display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 500, py: 0 } }}>
                      {SOURCES.map((src) => (
                        <MenuItem key={src} value={src}>{src}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
            />
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography component="label" sx={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8', mb: 1, display: 'block' }}>
                    Amount *
                  </Typography>
                  <TextField
                    {...field}
                    type="number"
                    placeholder="₹0.00"
                    fullWidth
                    inputProps={{ step: '0.01' }}
                    sx={{ '& .MuiInputBase-root': { height: '56px', fontSize: '1.25rem', fontWeight: 600 } }}
                  />
                </Box>
              )}
            />
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography component="label" sx={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8', mb: 1, display: 'block' }}>
                    Date
                  </Typography>
                  <TextField {...field} type="date" fullWidth InputLabelProps={{ shrink: true }} sx={{ '& .MuiInputBase-root': { height: '52px', fontSize: '1rem', fontWeight: 500 } }} />
                </Box>
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography component="label" sx={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8', mb: 1, display: 'block' }}>
                    Description <Box component="span" sx={{ color: '#6B7280', textTransform: 'none' }}>(optional)</Box>
                  </Typography>
                  <TextField {...field} placeholder="Add details..." fullWidth multiline rows={3} sx={{ '& .MuiInputBase-root': { fontSize: '0.9375rem', fontWeight: 400, py: 1.5 } }} />
                </Box>
              )}
            />
            <Controller
              name="creditTo"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography component="label" sx={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94A3B8', mb: 1, display: 'block' }}>
                    Credit To
                  </Typography>
                  <TextField {...field} placeholder="e.g., Bank Account, Wallet" fullWidth sx={{ '& .MuiInputBase-root': { height: '52px', fontSize: '1rem', fontWeight: 500 } }} />
                </Box>
              )}
            />
            <Controller
              name="isRecurring"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} sx={{ color: 'rgba(255, 255, 255, 0.3)', '&.Mui-checked': { color: '#10B981' } }} />}
                  label={<Typography sx={{ fontSize: '0.9375rem', fontWeight: 500, color: '#E2E8F0' }}>Recurring Income</Typography>}
                  sx={{ ml: 0 }}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            fullWidth
            size="large"
            sx={{
              height: '56px',
              background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
              color: '#FFFFFF',
              fontSize: '1.0625rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              borderRadius: '16px',
              boxShadow: '0px 8px 20px rgba(16, 185, 129, 0.4)',
              textTransform: 'uppercase',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                boxShadow: '0px 12px 28px rgba(16, 185, 129, 0.5)',
                transform: 'translateY(-2px)'
              },
              '&:active': {
                transform: 'translateY(0) scale(0.97)'
              }
            }}
          >
            Add Income
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
          Filter Income by Date Range
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
        title="Delete Income Record"
        message="This income record will be permanently deleted. This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        severity="error"
      />
    </PageContainer >
  );
}

