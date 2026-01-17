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
  Box,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

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
          background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), var(--active-gradient)',
          backgroundAttachment: 'fixed',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{
        fontWeight: 700,
        color: '#F1F5F9',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
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
