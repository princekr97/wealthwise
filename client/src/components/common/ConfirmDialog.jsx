/**
 * ConfirmDialog Component
 * Reusable confirmation dialog - replaces window.confirm()
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export default function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  severity = 'warning',
  loading = false
}) {
  const severityColors = {
    warning: { title: '#FFA726', button: '#F57C00' },
    error: { title: '#EF5350', button: '#E53935' },
    info: { title: '#42A5F5', button: '#1976D2' }
  };

  const colors = severityColors[severity] || severityColors.warning;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          backgroundImage: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          border: '1px solid rgba(255,255,255,0.15)'
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          color: colors.title,
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size="small"
          sx={{ mr: 1, color: '#94A3B8' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 2 }}>
        <p style={{ color: '#E2E8F0', marginTop: '8px', marginBottom: 0 }}>
          {message}
        </p>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>

        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          loading={loading}
          sx={{
            background: colors.button,
            color: '#FFF',
            '&:hover': { background: colors.button, opacity: 0.9 },
            '&:disabled': { background: '#64748B', color: '#94A3B8' }
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
