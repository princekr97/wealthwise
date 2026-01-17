/**
 * PremiumDialog Component
 * 
 * Reusable premium frosted glass dialog with consistent styling across all modules
 * Features: Dark blur backdrop, gradient border, elevated shadows, smooth animations
 */

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Premium Dialog Wrapper
 * 
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {string} title - Dialog title
 * @param {string} icon - Emoji icon for title (optional)
 * @param {node} children - Form content
 * @param {node} actions - Dialog actions (buttons)
 * @param {string} maxWidth - Dialog max width ('xs', 'sm', 'md', 'lg', 'xl')
 */
export default function PremiumDialog({
    open,
    onClose,
    title,
    icon,
    children,
    actions,
    maxWidth = 'sm',
    ...props
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={maxWidth}
            PaperProps={{
                sx: {
                    borderRadius: '24px 24px 16px 16px',
                    background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), var(--active-gradient)',
                    backgroundAttachment: 'fixed',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.6)',
                    overflow: 'hidden'
                }
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }}
            {...props}
        >
            {/* Premium Header */}
            <DialogTitle
                sx={{
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
                }}
            >
                <IconButton
                    onClick={onClose}
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
                {icon && <Box component="span" sx={{ fontSize: '1.25rem' }}>{icon}</Box>}
                {title}
            </DialogTitle>

            {/* Form Content */}
            <DialogContent sx={{ px: 2.5, pt: 3, pb: 2 }}>
                {children}
            </DialogContent>

            {/* Actions (if provided) */}
            {actions && (
                <DialogActions sx={{ px: 2.5, pb: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    {actions}
                </DialogActions>
            )}
        </Dialog>
    );
}

/**
 * FormLabel Component - Consistent label styling
 */
export function FormLabel({ children, required = false }) {
    return (
        <Box
            component="label"
            sx={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#94A3B8',
                mb: 1,
                display: 'block'
            }}
        >
            {children}
            {required && <Box component="span" sx={{ color: '#EF4444', ml: 0.5 }}>*</Box>}
        </Box>
    );
}

/**
 * PremiumButton Component - Vibrant gradient CTA
 */
export function PremiumButton({ children, onClick, disabled, ...props }) {
    return (
        <Box
            component="button"
            onClick={onClick}
            disabled={disabled}
            sx={{
                width: '100%',
                height: '56px',
                background: disabled
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.5) 0%, rgba(59, 130, 246, 0.5) 100%)'
                    : 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                color: '#FFFFFF',
                fontSize: '1.0625rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                borderRadius: '16px',
                border: 'none',
                boxShadow: disabled ? 'none' : '0px 8px 20px rgba(6, 182, 212, 0.4)',
                textTransform: 'uppercase',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: disabled ? 0.5 : 1,
                '&:hover': disabled ? {} : {
                    background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                    boxShadow: '0px 12px 28px rgba(6, 182, 212, 0.5)',
                    transform: 'translateY(-2px)'
                },
                '&:active': disabled ? {} : {
                    transform: 'translateY(0) scale(0.97)'
                }
            }}
            {...props}
        >
            {children}
        </Box>
    );
}
