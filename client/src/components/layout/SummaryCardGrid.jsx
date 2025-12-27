/**
 * SummaryCardGrid Component
 *
 * CSS Grid layout with equal-width cards.
 * Supports 2 or 4 columns based on prop.
 */

import React from 'react';
import { Box } from '@mui/material';

export default function SummaryCardGrid({ children, columns = 2 }) {
    const gridColumns = columns === 4
        ? { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }
        : { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' };

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: gridColumns,
                gap: { xs: 1.5, sm: 2, md: 3 }, // Better scaled gaps
                mb: { xs: 3, sm: 4 }, // Increased margin for better spacing
                width: '100%'
            }}
        >
            {children}
        </Box>
    );
}
