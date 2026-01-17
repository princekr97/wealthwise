/**
 * Lending Page - MUI Version
 * Track money lent and borrowed with real data, tabs, and error handling
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Stack, IconButton, Chip, Typography,
  useMediaQuery, useTheme, TablePagination, Alert, CircularProgress
} from '@mui/material';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Add as AddIcon, Delete as DeleteIcon, FilterList as FilterListIcon, Refresh as RefreshIcon, Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { lendingService } from '../services/lendingService';
import { formatCurrency, formatDate } from '../utils/formatters';
import ConfirmDialog from '../components/common/ConfirmDialog';
import PageContainer from '../components/layout/PageContainer';
import PageHeader from '../components/layout/PageHeader';
import SummaryCard from '../components/layout/SummaryCard';
import SummaryCardGrid from '../components/layout/SummaryCardGrid';
import ChartCard, { ChartGrid, EmptyChartState, CategoryLegend } from '../components/layout/ChartCard';
import PageLoader from '../components/common/PageLoader';

const STATUS_COLORS = {
  pending: { color: 'warning', label: '⏳ Pending' },
  partial: { color: 'info', label: '⚠️ Partial' },
  settled: { color: 'success', label: '✅ Settled' }
};

const COLORS = ['#22C55E', '#EF4444', '#3B82F6'];

export default function Lending() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [lendings, setLendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 3 : 10);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempFromDate, setTempFromDate] = useState('');
  const [tempToDate, setTempToDate] = useState(new Date().toISOString().split('T')[0]);
  const [filteredLendings, setFilteredLendings] = useState([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      personName: '',
      contact: '',
      amount: '',
      type: 'given',
      date: new Date().toISOString().split('T')[0],
      expectedReturnDate: '',
      status: 'pending',
      notes: ''
    }
  });

  useEffect(() => { fetchLendings(); }, []);

  useEffect(() => {
    const filtered = lendings.filter((item) => {
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      const from = fromDate ? new Date(fromDate).toISOString().split('T')[0] : null;
      const to = toDate ? new Date(toDate).toISOString().split('T')[0] : null;

      if (from && itemDate < from) return false;
      if (to && itemDate > to) return false;
      return true;
    });

    setFilteredLendings(filtered);
    setPage(0);
  }, [lendings, fromDate, toDate]);

  const fetchLendings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await lendingService.getLendings();
      const lendingList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setLendings(lendingList);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to fetch records';
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
        amount: parseFloat(values.amount)
      };

      if (dataToSend.amount <= 0) {
        toast.error('Amount must be greater than 0');
        return;
      }

      await lendingService.createLending(dataToSend);
      toast.success('Record added successfully');
      reset();
      setOpen(false);
      fetchLendings();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to add record';
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
      await lendingService.deleteLending(deleteId);
      toast.success('Record deleted');
      fetchLendings();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete record');
    }
  };

  // Separate into given and taken
  const givenRecords = useMemo(() => filteredLendings.filter(l => l.type === 'given'), [filteredLendings]);
  const takenRecords = useMemo(() => filteredLendings.filter(l => l.type === 'taken'), [filteredLendings]);

  const totalGiven = useMemo(() => givenRecords.filter(l => l.status !== 'settled').reduce((sum, l) => sum + (l.amount || 0), 0), [givenRecords]);
  const totalTaken = useMemo(() => takenRecords.filter(l => l.status !== 'settled').reduce((sum, l) => sum + (l.amount || 0), 0), [takenRecords]);
  const netPosition = totalGiven - totalTaken;

  const statusData = useMemo(() => {
    return [
      { name: 'Pending', value: filteredLendings.filter(l => l.status === 'pending').length },
      { name: 'Partial', value: filteredLendings.filter(l => l.status === 'partial').length },
      { name: 'Settled', value: filteredLendings.filter(l => l.status === 'settled').length }
    ].filter(d => d.value > 0);
  }, [filteredLendings]);

  const displayRecords = activeTab === 0 ? givenRecords : takenRecords;
  const paginatedRecords = useMemo(() => {
    return displayRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [displayRecords, page, rowsPerPage]);

  if (loading) {
    return <PageLoader message="Loading Lending Records..." />;
  }

  return (
    <PageContainer>
      <PageHeader
        title="💰 Lending & Borrowing"
        subtitle="Track money lent and borrowed from friends"
        actionLabel="Add Record"
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
          icon="📥"
          label="To Receive"
          value={formatCurrency(totalGiven)}
          valueColor="success"
          subtitle={`${givenRecords.filter(r => r.status !== 'settled').length} pending`}
        />
        <SummaryCard
          icon="📤"
          label="To Pay"
          value={formatCurrency(totalTaken)}
          valueColor="error"
          subtitle={`${takenRecords.filter(r => r.status !== 'settled').length} pending`}
        />
        <SummaryCard
          icon={netPosition >= 0 ? "📈" : "📉"}
          label="Net Position"
          value={formatCurrency(netPosition)}
          valueColor={netPosition >= 0 ? 'success' : 'error'}
        />
        <SummaryCard
          icon="📋"
          label="Records"
          value={filteredLendings.length.toString()}
          valueColor="primary"
          subtitle={lendings.length !== filteredLendings.length ? `${lendings.length} total` : undefined}
        />
      </SummaryCardGrid>

      <ChartGrid>
        {/* Status Distribution */}
        <ChartCard
          title="📂 Status Distribution"
          subtitle={statusData.length > 0 ? `${statusData.length} statuses` : undefined}
          footer={statusData.length > 0 ? (
            <CategoryLegend data={statusData} colors={COLORS} />
          ) : undefined}
        >
          {statusData.length === 0 ? (
            <EmptyChartState message="Add records to see distribution" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={isMobile ? 40 : (isTablet ? 55 : 65)}
                  outerRadius={isMobile ? 70 : (isTablet ? 90 : 110)}
                  paddingAngle={2}
                  stroke="transparent"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => value}
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

        {/* Given vs Taken */}
        <ChartCard
          title="📊 Financial Position"
          subtitle="To Receive vs To Pay"
        >
          {statusData.length === 0 ? (
            <EmptyChartState message="Add records to see comparison" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'To Receive', value: totalGiven },
                  { name: 'To Pay', value: totalTaken }
                ]}
                margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
              >
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
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </ChartGrid>

      {/* Tabs for Given/Taken */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label={`📥 Money Given (${givenRecords.length})`} />
              <Tab label={`📤 Money Taken (${takenRecords.length})`} />
            </Tabs>
          </Box>

          {/* Table - Desktop View */}
          {!isMobile && (
            <Box sx={{ mt: 2 }}>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <TableCell>Person</TableCell>
                      {!isTablet && <TableCell>Contact</TableCell>}
                      <TableCell align="right">Amount</TableCell>
                      {!isTablet && <TableCell>Date</TableCell>}
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRecords.length > 0 ? (
                      paginatedRecords.map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{record.personName}</Typography>
                              {record.notes && <Typography variant="caption" color="textSecondary">{record.notes.substring(0, 30)}...</Typography>}
                            </Box>
                          </TableCell>
                          {!isTablet && <TableCell>{record.contact || '-'}</TableCell>}
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(record.amount)}</TableCell>
                          {!isTablet && <TableCell>{formatDate(record.date)}</TableCell>}
                          <TableCell>
                            <Chip
                              label={STATUS_COLORS[record.status]?.label}
                              color={STATUS_COLORS[record.status]?.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => handleDelete(record._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={isTablet ? 4 : 6} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">
                            {activeTab === 0 ? 'No money given yet' : 'No money taken yet'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {displayRecords.length > rowsPerPage && (
                <TablePagination
                  rowsPerPageOptions={[3, 5, 10, 25]}
                  component="div"
                  count={displayRecords.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
              )}
            </Box>
          )}

          {/* Mobile Card View */}
          {isMobile && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <Box
                    key={record._id}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
                          {record.personName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                          {formatDate(record.date)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5, color: 'success.main' }}>
                          {formatCurrency(record.amount)}
                        </Typography>
                        <Chip
                          label={STATUS_COLORS[record.status]?.label}
                          color={STATUS_COLORS[record.status]?.color}
                          size="small"
                        />
                      </Box>
                    </Box>

                    {record.contact && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.75rem', mb: 1 }}>
                        📱 {record.contact}
                      </Typography>
                    )}

                    {record.notes && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.75rem', mb: 1.5, fontStyle: 'italic' }}>
                        {record.notes.substring(0, 50)}...
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton size="small" color="error" onClick={() => handleDelete(record._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  {activeTab === 0 ? 'No money given yet' : 'No money taken yet'}
                </Typography>
              )}
              {displayRecords.length > rowsPerPage && (
                <TablePagination
                  rowsPerPageOptions={[3, 5, 10]}
                  component="div"
                  count={displayRecords.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Add Record Dialog */}
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
          Add Lending Record
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Controller
              name="personName"
              control={control}
              rules={{ required: 'Person name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Person Name *"
                  fullWidth
                  size="small"
                  error={!!errors.personName}
                  helperText={errors.personName?.message}
                />
              )}
            />

            <Controller
              name="contact"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contact (phone/email)"
                  fullWidth
                  size="small"
                />
              )}
            />

            <Controller
              name="amount"
              control={control}
              rules={{ required: 'Amount is required', min: { value: 0.01, message: 'Amount must be > 0' } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Amount *"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  fullWidth
                  size="small"
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />
              )}
            />

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Type *</InputLabel>
                  <Select {...field} label="Type *">
                    <MenuItem value="given">📥 Money Given (To Receive)</MenuItem>
                    <MenuItem value="taken">📤 Money Taken (To Pay)</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="date"
              control={control}
              rules={{ required: 'Date is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Date *"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date}
                  helperText={errors.date?.message}
                />
              )}
            />

            <Controller
              name="expectedReturnDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Expected Return Date"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Status *</InputLabel>
                  <Select {...field} label="Status *">
                    <MenuItem value="pending">⏳ Pending</MenuItem>
                    <MenuItem value="partial">⚠️ Partial</MenuItem>
                    <MenuItem value="settled">✅ Settled</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>

          <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary">
            Add Record
          </Button>
        </DialogActions>
      </Dialog>

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
          Filter Records by Date Range
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
        title="Delete Record"
        message="This lending record will be permanently deleted. This action cannot be undone."
        onConfirm={confirmDelete}
        confirmText="Delete"
        severity="error"
      />
    </PageContainer>
  );
}

