/**
 * SummaryCard Component
 * 
 * Simple rectangular card with consistent sizing.
 * Square shape with equal width/height.
 */

import React from 'react';
import { Box, Typography, alpha, Tooltip, IconButton } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

// Color configurations
const COLOR_CONFIG = {
    success: { text: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' },
    error: { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' },
    warning: { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' },
    info: { text: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' },
    primary: { text: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' },
    default: { text: '#F9FAFB', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' }
};

export default function SummaryCard({
    label,
    value,
    valueColor = 'primary',
    icon,
    trend,
    subtitle,
    tooltip
}) {
    const config = COLOR_CONFIG[valueColor] || COLOR_CONFIG.default;

    return (
        <Box
            sx={{
                width: '100%',
                aspectRatio: '1 / 1', // Fixed square ratio

                borderRadius: '16px',
                backgroundColor: config.bg,
                border: `1px solid ${config.border}`,

                // Content layout
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: { xs: 1.5, sm: 2 },

                // Hover effect
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 30px ${alpha(config.border, 0.2)}`,
                    borderColor: alpha(config.border, 0.5)
                }
            }}
        >
            {/* Icon */}
            {icon && (
                <Box sx={{
                    fontSize: { xs: '1.25rem', sm: '2rem' }, // Reduced for mobile
                    mb: 1,
                    opacity: 0.9,
                }}>
                    {icon}
                </Box>
            )}

            {/* Value */}
            <Typography
                sx={{
                    color: config.text,
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.5rem' }, // Scaled down for stability
                    lineHeight: 1.2
                }}
            >
                {value}
            </Typography>

            {/* Label */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                    sx={{
                        color: '#9CA3AF',
                        fontSize: { xs: '0.6rem', sm: '0.75rem' },
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        opacity: 0.8
                    }}
                >
                    {label}
                </Typography>
                {tooltip && (
                    <Tooltip
                        title={tooltip}
                        arrow
                        placement="top"
                        enterTouchDelay={0}
                        leaveTouchDelay={3000}
                    >
                        <Box
                            component="span"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                cursor: 'help',
                                ml: 0.5,
                                '&:active': { opacity: 0.5 }
                            }}
                        >
                            <InfoIcon sx={{ fontSize: { xs: '0.85rem', sm: '1rem' }, color: '#9CA3AF', opacity: 0.6 }} />
                        </Box>
                    </Tooltip>
                )}
            </Box>

            {/* Subtitle */}
            {subtitle && (
                <Typography
                    sx={{
                        color: '#6B7280',
                        fontSize: { xs: '0.55rem', sm: '0.625rem' },
                        mt: 0.25,
                        lineHeight: 1.2,
                        display: { xs: 'none', sm: 'block' } // Hide subtitle on small mobile to prevent overlap
                    }}
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
}
