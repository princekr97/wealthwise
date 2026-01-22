/**
 * PageContainer Component
 * 
 * Consistent page wrapper with proper padding and max-width.
 * Mobile-first responsive design.
 */

import React from 'react';
import { Box, useTheme } from '@mui/material';

export default function PageContainer({ children, maxWidth = 'xl' }) {
    return (
        <Box
            sx={{
                width: '100%',
                py: 2,
                px: 2,
                position: 'relative',
                bgcolor: 'transparent'
            }}
        >
            <Box
                sx={{
                    maxWidth: maxWidth === 'xl' ? '1400px' : maxWidth === 'lg' ? '1200px' : '100%',
                    mx: 'auto',
                    position: 'relative',
                    zIndex: 1 // Ensure content appears above gradient backgrounds
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
