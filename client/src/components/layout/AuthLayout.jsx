/**
 * AuthLayout Component
 *
 * Standardized layout wrapper for authentication pages (Login, Register).
 * Uses MUI for consistency with the rest of the app while maintaining
 * the glassmorphism aesthetic.
 */

import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import logo from '../../assets/images/khatabahi-logo.png';

export default function AuthLayout({ children }) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column', // Stack logo and card
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 4, sm: 6, md: 8 },
                gap: 3
            }}
        >
            {/* Logo Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Box
                    component="img"
                    src={logo}
                    alt="KhataBahi Logo"
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '12px',
                        filter: 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.4))'
                    }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography
                        sx={{
                            fontSize: '1.75rem',
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #22C55E 0%, #3B82F6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.02em',
                            lineHeight: 1
                        }}
                    >
                        KhataBahi
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.65rem',
                            color: '#94A3B8',
                            fontWeight: 500,
                            letterSpacing: '0.5px',
                            lineHeight: 1,
                            mt: 0.25
                        }}
                    >
                        Hisaab-Kitaab Made Easy
                    </Typography>
                </Box>
            </Box>
            <Card
                sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 380 },
                    // Glassmorphism effect
                    backgroundColor: 'rgba(30, 41, 59, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: { xs: 2, sm: 3 },
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <CardContent
                    sx={{
                        // Mobile-first responsive padding
                        p: { xs: 2.5, sm: 3.5, md: 4 },
                        '&:last-child': { pb: { xs: 2.5, sm: 3.5, md: 4 } },
                    }}
                >
                    {children}
                </CardContent>
            </Card>

            <Box component="footer" sx={{ position: 'absolute', bottom: 16, textAlign: 'center', opacity: 0.7, zIndex: 0 }}>
                <div className="text-slate-500 text-xs font-medium mb-1">
                    &copy; {new Date().getFullYear()} KhataBahi. All rights reserved.
                </div>
                <div className="text-slate-600 text-[10px]">
                    🎨 Designed & 💻 Developed by <span className="text-emerald-500 font-semibold cursor-default">Prince Gupta</span>
                </div>
            </Box>
        </Box>
    );
}
