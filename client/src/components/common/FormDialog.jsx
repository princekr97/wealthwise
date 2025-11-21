/**
 * FormDialog Component
 * Reusable form dialog with consistent styling and validation
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  Box
} from '@mui/material';

export default function FormDialog({
  open,
  onClose,
  title,
  onSubmit,
  children,
  loading = false,
  submitText = 'Submit',
  error = null,
  maxWidth = 'sm'
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{
        sx: {
          backgroundImage: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          border: '1px solid rgba(255,255,255,0.15)'
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: '#F1F5F9' }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack spacing={2}>
          {children}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Loading...' : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
