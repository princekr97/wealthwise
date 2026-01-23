/**
 * PageHeader Component
 * 
 * Consistent page header with title, subtitle, and optional action button.
 * Clean, minimal design.
 */

import React from 'react';
import { Box, Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PremiumButton from '../common/PremiumButton';

export default function PageHeader({
    title,
    subtitle,
    actionLabel,
    onAction,
    actionIcon = <AddIcon />,
    leftContent,
    rightContent
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                mb: { xs: 3, sm: 4 }
            }}
        >
            {/* Left side - Title section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {leftContent}
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                            color: '#F1F5F9',
                            lineHeight: 1.2
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#94A3B8',
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                mt: 0.5
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Right side - Action button or custom content */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {rightContent}
                {actionLabel && onAction && (
                    <PremiumButton
                        startIcon={actionIcon}
                        onClick={onAction}
                        sx={{
                            minWidth: isMobile ? '9rem' : '11.7rem',
                            fontSize: isMobile ? '0.9rem' : '1.0rem',
                            px: isMobile ? 1.8 : 2.7,
                            py: isMobile ? 0.9 : 1.08
                        }}
                    >
                        {actionLabel}
                    </PremiumButton>
                )}
            </Box>
        </Box>
    );
}
