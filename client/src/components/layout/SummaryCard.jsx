/**
 * SummaryCard Component - Premium Fintech Edition
 * 
 * Features:
 * - Subtle gradient overlays (5% opacity)
 * - Refined typography hierarchy
 * - Larger icons (28-32px)
 * - Smooth micro-interactions
 */

import React from 'react';
import { Box, Typography, alpha, Tooltip } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

// Premium Color Configurations with Gradients
const COLOR_CONFIG = {
    success: {
        text: '#10B981',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
        border: 'rgba(16, 185, 129, 0.2)',
        shadow: 'rgba(16, 185, 129, 0.15)'
    },
    error: {
        text: '#EF4444',
        gradient: 'linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(251, 113, 133, 0.05) 100%)',
        border: 'rgba(239, 68, 68, 0.2)',
        shadow: 'rgba(239, 68, 68, 0.15)'
    },
    warning: {
        text: '#F59E0B',
        gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(252, 211, 77, 0.05) 100%)',
        border: 'rgba(245, 158, 11, 0.2)',
        shadow: 'rgba(245, 158, 11, 0.15)'
    },
    info: {
        text: '#3B82F6',
        gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(96, 165, 250, 0.05) 100%)',
        border: 'rgba(59, 130, 246, 0.2)',
        shadow: 'rgba(59, 130, 246, 0.15)'
    },
    primary: {
        text: '#10B981',
        gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
        border: 'rgba(16, 185, 129, 0.2)',
        shadow: 'rgba(16, 185, 129, 0.15)'
    },
    default: {
        text: '#FFFFFF',
        gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.05) 100%)',
        border: 'rgba(255, 255, 255, 0.1)',
        shadow: 'rgba(255, 255, 255, 0.05)'
    }
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
                aspectRatio: '1 / 1', // Maintaining square ratio

                borderRadius: '18px',  // Premium rounded corners
                background: config.gradient,  // Subtle gradient overlay
                border: `1px solid ${config.border}`,
                backdropFilter: 'blur(8px)',

                // Content layout - Breathing room
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: { xs: 2, sm: 3 },  // 24-32px padding
                gap: { xs: 0.75, sm: 1 },  // Spacing between elements

                // Premium hover effect - lift and shadow
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 32px ${config.shadow}`,
                    borderColor: alpha(config.border, 0.4),
                },
                // Press effect - subtle scale
                '&:active': {
                    transform: 'translateY(-2px) scale(0.98)',
                }
            }}
        >
            {/* Icon - Larger (28-32px) */}
            {icon && (
                <Box sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem' }, // 28-32px
                    mb: 0.5,
                    opacity: 0.95,
                    lineHeight: 1,
                }}>
                    {icon}
                </Box>
            )}

            {/* Value - Hero Number Typography */}
            <Typography
                sx={{
                    color: config.text,
                    fontWeight: 600,  // Font-weight 600
                    fontSize: { xs: '1.25rem', sm: '1.75rem' }, // 20-28pt
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',  // Tighter letter spacing
                }}
            >
                {value}
            </Typography>

            {/* Label - With Info Icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                <Typography
                    sx={{
                        color: '#94A3B8',  // Cool gray
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },  // 14-15pt body
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',  // Subtle refinement
                        opacity: 0.9
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
                                '&:hover': { opacity: 1 },
                                transition: 'opacity 0.2s'
                            }}
                        >
                            <InfoIcon
                                sx={{
                                    fontSize: '16px',  // 16px info icon
                                    color: '#9CA3AF',
                                    opacity: 0.6
                                }}
                            />
                        </Box>
                    </Tooltip>
                )}
            </Box>

            {/* Trend - Optional */}
            {trend && (
                <Typography
                    sx={{
                        color: config.text,
                        fontSize: { xs: '0.625rem', sm: '0.75rem' },
                        fontWeight: 600,
                        opacity: 0.8
                    }}
                >
                    {trend}
                </Typography>
            )}

            {/* Subtitle - Secondary info */}
            {subtitle && (
                <Typography
                    sx={{
                        color: '#64748B',  // Muted slate
                        fontSize: { xs: '0.625rem', sm: '0.7rem' },
                        lineHeight: 1.3,
                        display: { xs: 'none', sm: 'block' } // Hide on mobile if needed
                    }}
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
}
