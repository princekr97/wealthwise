import React from 'react';
import { Box, Typography } from '@mui/material';
import logo from '../../assets/images/khatabahi-logo.png';

export default function AuthLayout({ children }) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #3b0764 50%, #0f172a 100%)',
                position: 'relative',
                overflow: 'hidden',
                px: 2,
                py: 4
            }}
        >
            {/* Animated Background Elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '25%',
                    left: '25%',
                    width: '384px',
                    height: '384px',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(64px)',
                    animation: 'pulse 8s infinite',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '25%',
                    right: '25%',
                    width: '384px',
                    height: '384px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(64px)',
                    animation: 'pulse 8s infinite',
                    animationDelay: '0.7s',
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { opacity: 0.5; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.1); }
                    }
                `}
            </style>

            <Box sx={{ width: '100%', maxWidth: '448px', position: 'relative', zIndex: 10 }}>
                {/* Logo and Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 80,
                            height: 80,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '24px',
                            mb: 2,
                            boxShadow: '0 20px 40px -12px rgba(168, 85, 247, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            overflow: 'hidden'
                        }}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt="KhataBahi Logo"
                            sx={{
                                width: '100%',
                                height: '100%',
                                p: 1.5,
                                objectFit: 'contain'
                            }}
                        />
                    </Box>
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            background: 'linear-gradient(to right, #34d399, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1
                        }}
                    >
                        KhataBahi
                    </Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                        Smart financial management made simple
                    </Typography>
                </Box>

                {/* Main Content (Card Area) */}
                <Box
                    sx={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(24px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden',
                        mb: 6
                    }}
                >
                    {children}
                </Box>
            </Box>

            {/* Footer - Fixed at bottom */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    zIndex: 5
                }}
            >
                <Typography sx={{ color: '#64748b', fontSize: '0.75rem', mb: 0.5 }}>
                    © 2026 KhataBahi. All rights reserved.
                </Typography>
                <Typography sx={{ color: '#475569', fontSize: '0.65rem' }}>
                    🎨 Designed & 💻 Developed by <span style={{ color: '#10b981', fontWeight: 600 }}>Prince Gupta</span>
                </Typography>
            </Box>
        </Box>
    );
}
