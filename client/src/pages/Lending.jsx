/**
 * Lending Page - MUI Version
 * Track money lent and borrowed with real data, tabs, and error handling
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Container, Stack, IconButton, Chip, Typography,
  useMediaQuery, useTheme, TablePagination, Alert, CircularProgress
} from '@mui/material';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Add as AddIcon, Delete as DeleteIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { lendingService } from '../services/lendingService';
import { formatCurrency, formatDate } from '../utils/formatters';
import ConfirmDialog from '../components/common/ConfirmDialog';

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
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem', lg: '1.75rem' } }}>💰 Lending & Borrowing</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.95rem' } }}>Track money lent and borrowed from friends</Typography>
            </Box>
          </Box>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpen(true)} size={isMobile ? 'small' : 'medium'}>
            Add Record
          </Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Summary Cards */}
        <Grid container spacing={{ xs: 2, sm: 2, md: 3, lg: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card><CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
              <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>To Receive 📥</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>{formatCurrency(totalGiven)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card><CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
              <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>To Pay 📤</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>{formatCurrency(totalTaken)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card><CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
              <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Net Position</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: netPosition >= 0 ? 'success.main' : 'error.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>{formatCurrency(netPosition)}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={3}>
            <Card><CardContent sx={{ minHeight: { xs: 110, sm: 130, md: 140 } }}>
              <Typography color="textSecondary" variant="caption" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>Total Records</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>{lendings.length}</Typography>
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
                    📊 Status Distribution
                  </Typography>
                  {statusData.length > 0 && (
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                      {statusData.length} statuses
                    </Typography>
                  )}
                </Box>
              </CardContent>

              <CardContent sx={{ pt: 1 }}>
                {statusData.length > 0 ? (
                  <>
                    <Box sx={{ width: '100%', height: { xs: 250, sm: 280, md: 300 }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={statusData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={isMobile ? 70 : (isTablet ? 90 : 110)}
                          >
                            {statusData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx]} />)}
                          </Pie>
                          <Tooltip 
                            formatter={(v) => v} 
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
                    </Box>

                    {/* Legend Grid */}
                    <Box sx={{ 
                      mt: 3, 
                      pt: 2, 
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
                      gap: { xs: 1.5, sm: 2 },
                      rowGap: { xs: 1.5, sm: 2 }
                    }}>
                      {statusData && statusData.length > 0 && statusData.map((item, index) => {
                        const total = statusData.reduce((sum, i) => sum + (i.value || 0), 0);
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
                                {item.value} records
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
                    No data
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
                    💵 Amount Breakdown
                  </Typography>
                </Box>
              </CardContent>

              <CardContent sx={{ pt: 1 }}>
                {lendings.length > 0 ? (
                  <Box sx={{ width: '100%', height: { xs: 250, sm: 280, md: 300 } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'To Receive', amount: totalGiven },
                        { name: 'To Pay', amount: totalTaken }
                      ]}>
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
                        <Tooltip formatter={(v) => formatCurrency(v)} />
                        <Bar dataKey="amount" fill="#22C55E" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    No data
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
          <DialogTitle sx={{ fontWeight: 700 }}>Add Lending Record</DialogTitle>
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
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary">
              Add Record
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
            📅 Filter Records by Date Range
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
          title="Delete Record"
          message="This lending record will be permanently deleted. This action cannot be undone."
          onConfirm={confirmDelete}
          confirmText="Delete"
          severity="error"
        />
      </Box>
    </Box>
  );
}
