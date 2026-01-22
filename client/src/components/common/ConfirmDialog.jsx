/**
 * ConfirmDialog Component
 * Modern glassmorphic confirmation dialog with Lucide icons
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress
} from '@mui/material';
import { X, AlertCircle, AlertTriangle, Info, Shield, Trash2, LogOut } from 'lucide-react';

export default function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'warning',
  loading = false
}) {
  const severityConfig = {
    warning: {
      icon: AlertTriangle,
      iconBg: 'from-amber-400 to-orange-500',
      iconGlow: 'shadow-orange-500/20',
      infoBg: 'from-amber-500/10 to-orange-500/10',
      infoBorder: 'border-amber-500/20',
      infoIconBg: 'bg-amber-500/20',
      infoIconColor: 'text-amber-400',
      buttonBg: 'from-amber-400 to-orange-500',
      buttonHover: 'from-amber-500 to-orange-600',
      buttonShadow: 'shadow-orange-500/20 hover:shadow-orange-500/30',
      titleColor: '#f59e0b'
    },
    error: {
      icon: Trash2,
      iconBg: 'from-red-400 to-rose-500',
      iconGlow: 'shadow-red-500/20',
      infoBg: 'from-red-500/10 to-rose-500/10',
      infoBorder: 'border-red-500/20',
      infoIconBg: 'bg-red-500/20',
      infoIconColor: 'text-red-400',
      buttonBg: 'from-red-400 to-rose-500',
      buttonHover: 'from-red-500 to-rose-600',
      buttonShadow: 'shadow-red-500/20 hover:shadow-red-500/30',
      titleColor: '#ef4444'
    },
    info: {
      icon: Info,
      iconBg: 'from-blue-400 to-cyan-500',
      iconGlow: 'shadow-blue-500/20',
      infoBg: 'from-blue-500/10 to-cyan-500/10',
      infoBorder: 'border-blue-500/20',
      infoIconBg: 'bg-blue-500/20',
      infoIconColor: 'text-cyan-400',
      buttonBg: 'from-blue-400 to-cyan-500',
      buttonHover: 'from-blue-500 to-cyan-600',
      buttonShadow: 'shadow-blue-500/20 hover:shadow-blue-500/30',
      titleColor: '#3b82f6'
    },
    logout: {
      icon: LogOut,
      iconBg: 'from-purple-400 to-pink-500',
      iconGlow: 'shadow-purple-500/20',
      infoBg: 'from-purple-500/10 to-pink-500/10',
      infoBorder: 'border-purple-500/20',
      infoIconBg: 'bg-purple-500/20',
      infoIconColor: 'text-purple-400',
      buttonBg: 'from-purple-400 to-pink-500',
      buttonHover: 'from-purple-500 to-pink-600',
      buttonShadow: 'shadow-purple-500/20 hover:shadow-purple-500/30',
      titleColor: '#a855f7'
    }
  };

  const config = severityConfig[severity] || severityConfig.warning;
  const MainIcon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          background: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center shadow-lg ${config.iconGlow}`}>
              <MainIcon className="text-slate-900" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
          <IconButton
            onClick={onClose}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <X className="text-slate-400" size={20} />
          </IconButton>
        </div>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 4 }}>
        {/* Icon Circle */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${config.infoBg} border ${config.infoBorder} flex items-center justify-center`}>
              <AlertCircle className={config.infoIconColor} size={40} />
            </div>
            <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30`}>
              <Shield className="text-slate-900" size={14} />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-6">
          <p className="text-slate-300 leading-relaxed text-[15px]">
            {message}
          </p>
        </div>

        {/* Info Box */}
        <div className={`bg-gradient-to-br ${config.infoBg} rounded-2xl p-4 border ${config.infoBorder}`}>
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-lg ${config.infoIconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <Shield className={config.infoIconColor} size={16} />
            </div>
            <div className="flex-1">
              <p className={`text-sm ${config.infoIconColor} font-medium mb-1`}>Important</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                This action cannot be undone. Please make sure you want to proceed.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: 3, py: 3, gap: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-200 font-semibold py-3.5 rounded-2xl transition-all border border-slate-600/50 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className={`flex-1 bg-gradient-to-r ${config.buttonBg} hover:${config.buttonHover} text-slate-900 font-semibold py-3.5 rounded-2xl transition-all shadow-lg ${config.buttonShadow} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          {loading ? (
            <>
              <CircularProgress size={16} sx={{ color: '#1e293b' }} />
              <span>Processing...</span>
            </>
          ) : (
            confirmText
          )}
        </button>
      </DialogActions>

      {/* Footer Note */}
      <div className="px-6 py-3 bg-slate-900/30 border-t border-slate-700/50">
        <p className="text-xs text-center text-slate-400">
          Make sure you've reviewed all details before confirming
        </p>
      </div>
    </Dialog>
  );
}
