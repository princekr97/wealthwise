/**
 * PageLoader Component
 * 
 * Premium loading spinner for page loading states.
 */

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function PageLoader({ message = 'Loading...' }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                gap: 2
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    display: 'inline-flex'
                }}
            >
                {/* Outer glow ring */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -8,
                        left: -8,
                        right: -8,
                        bottom: -8,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}
                />
                <CircularProgress
                    size={56}
                    thickness={3}
                    sx={{
                        color: '#10B981',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round'
                        }
                    }}
                />
            </Box>
            <Typography
                sx={{
                    color: '#9CA3AF',
                    fontSize: '0.875rem',
                    fontWeight: 500
                }}
            >
                {message}
            </Typography>
        </Box>
    );
}
