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
          bgcolor: '#1E293B',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          color: colors.title,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size="small"
          sx={{
            mr: 1,
            color: '#94A3B8',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 2 }}>
        <p style={{ color: '#CBD5E1', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
          {message}
        </p>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1.5, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: 'rgba(255,255,255,0.2)',
            color: '#94A3B8',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.3)',
              bgcolor: 'rgba(255,255,255,0.05)'
            }
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: colors.button,
            color: '#FFF',
            fontWeight: 600,
            '&:hover': { bgcolor: colors.button, opacity: 0.85 },
            '&:disabled': { bgcolor: '#475569', color: '#94A3B8' }
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
