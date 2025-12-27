/**
 * AuthLayout Component
 *
 * Standardized layout wrapper for authentication pages (Login, Register).
 * Uses MUI for consistency with the rest of the app while maintaining
 * the glassmorphism aesthetic.
 */

import React from 'react';
import { Box, Card, CardContent } from '@mui/material';

/**
 * AuthLayout provides consistent wrapper for auth forms
 * Features:
 * - Centered card layout
 * - Glassmorphism background
 * - Mobile-first responsive padding
 */
export default function AuthLayout({ children }) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Gradient background matching app theme
                background: `
          radial-gradient(circle at top left, rgba(59, 130, 246, 0.3), transparent 50%),
          radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.25), transparent 50%),
          linear-gradient(180deg, #020617 0%, #0F172A 100%)
        `,
                // Mobile-first padding
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 4, sm: 6, md: 8 },
            }}
        >
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
        </Box>
    );
}
