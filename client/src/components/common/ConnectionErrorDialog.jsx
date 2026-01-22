/**
 * ConnectionErrorDialog Component
 * Modern glassmorphic dialog for connection failures with reload option
 */

import React from 'react';
import { Dialog, DialogContent, DialogActions } from '@mui/material';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

export default function ConnectionErrorDialog({ open, onReload }) {
    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
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
            {/* Content */}
            <DialogContent sx={{ px: 4, py: 5, textAlign: 'center' }}>
                {/* Animated Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center animate-pulse">
                            <WifiOff className="text-red-400" size={48} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <AlertCircle className="text-slate-900" size={18} />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-3">
                    Connection Issue
                </h2>

                {/* Message */}
                <p className="text-slate-300 leading-relaxed text-base mb-6">
                    We're having trouble connecting to the server. This might be due to network issues or the server waking up.
                </p>

                {/* Info Box */}
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-500/20 mb-6">
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertCircle className="text-cyan-400" size={16} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm text-cyan-300 font-medium mb-1">Quick Fix</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Refreshing the page usually resolves this issue. Your data is safe and will reload automatically.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>

            {/* Actions */}
            <DialogActions sx={{ px: 4, py: 4, gap: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <button
                    onClick={onReload}
                    className="flex-1 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-500 hover:to-cyan-600 text-slate-900 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 group"
                >
                    <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" size={20} />
                    <span>Reload Page</span>
                </button>
            </DialogActions>

            {/* Footer Note */}
            <div className="px-6 py-3 bg-slate-900/30 border-t border-slate-700/50">
                <p className="text-xs text-center text-slate-400">
                    If the problem persists, please check your internet connection
                </p>
            </div>
        </Dialog>
    );
}
