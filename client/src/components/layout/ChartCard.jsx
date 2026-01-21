/**
 * ChartCard Component
 *
 * Standardized card wrapper for charts with consistent header styling.
 * Mobile-first responsive design.
 */

import React from 'react';
import { Box, Typography, useTheme, useMediaQuery, Collapse, alpha } from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';

/**
 * ChartCard provides a consistent wrapper for chart visualizations
 * 
 * @param {string} title - Chart title
 * @param {string} subtitle - Optional subtitle/description
 * @param {number} height - Chart height
 * @param {React.ReactNode} children - Chart content
 * @param {React.ReactNode} footer - Optional footer content
 * @param {boolean} noPadding - Remove content padding
 * @param {string} color - Theme color accent for the card (hex)
 */
export default function ChartCard({
    title,
    subtitle,
    height = 280,
    children,
    footer,
    noPadding = false,
    collapsible = false,
    defaultExpanded = true,
    color = '#3b82f6' // Default blue accent
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const [expanded, setExpanded] = React.useState(defaultExpanded);

    // Calculate responsive height
    const responsiveHeight = isMobile ? height * 0.85 : (isTablet ? height * 0.95 : height);

    return (
        <Box
            sx={{
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '24px',
                height: expanded ? 'auto' : 'fit-content',
                background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.01)} 100%)`
                    : `linear-gradient(135deg, #FFFFFF 0%, ${alpha(color, 0.03)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: theme.palette.mode === 'dark' ? `1px solid ${alpha(color, 0.15)}` : `1px solid ${alpha(color, 0.1)}`,
                boxShadow: theme.palette.mode === 'dark' ? 'none' : `0 10px 30px -10px ${alpha(color, 0.1)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: collapsible ? 'pointer' : 'default',
                    minHeight: '48px',
                    p: 2.5,
                    pb: expanded && (children || footer) ? 1 : 2.5,
                    transition: 'opacity 0.2s',
                    '&:hover': collapsible ? { opacity: 0.8 } : {}
                }}
                onClick={() => collapsible && setExpanded(!expanded)}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {/* Title Label Style */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box sx={{
                            width: 3,
                            height: 14,
                            borderRadius: 4,
                            bgcolor: color,
                        }} />
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                letterSpacing: '0.2px',
                                color: theme.palette.text.primary,
                                textTransform: 'uppercase',
                                lineHeight: 1
                            }}
                        >
                            {title}
                        </Typography>
                    </Box>
                    {subtitle && expanded && (
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                fontWeight: 500,
                                color: theme.palette.text.secondary,
                                ml: 1.5 // Align with text start
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {collapsible && (
                    <Box sx={{
                        p: 0.5,
                        borderRadius: '50%',
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        display: 'flex'
                    }}>
                        <KeyboardArrowDownIcon
                            fontSize="small"
                            sx={{
                                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease',
                            }}
                        />
                    </Box>
                )}
            </Box>

            <Collapse in={expanded}>
                {/* Content wrapper */}
                <Box sx={{ px: noPadding ? 0 : 2.5, pb: footer ? 0 : 2.5 }}>
                    <Box
                        sx={{
                            width: '100%',
                            height: responsiveHeight,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {children}
                    </Box>
                </Box>

                {/* Optional Footer */}
                {footer && (
                    <Box sx={{ px: 2.5, pb: 3 }}>
                        {footer}
                    </Box>
                )}
            </Collapse>
        </Box>
    );
}

/**
 * ChartGrid component for consistent chart layout
 */
export function ChartGrid({ children }) {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                gap: { xs: 2, sm: 2.5, md: 3 },
                mb: { xs: 2.5, sm: 3, md: 3.5 },
            }}
        >
            {children}
        </Box>
    );
}

/**
 * EmptyChartState for when there's no data
 */
export function EmptyChartState({ message = 'No data available' }) {
    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Typography
                color="textSecondary"
                sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    textAlign: 'center',
                }}
            >
                {message}
            </Typography>
        </Box>
    );
}
/**
 * CategoryLegend - Displays category legend below pie chart
 * 
 * @param {Array} data - Array of objects with name and value
 * @param {Array} colors - Array of color strings
 * @param {Function} formatter - Optional formatter for value
 */
export function CategoryLegend({ data, colors, formatter = (v) => v }) {
    const theme = useTheme();
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, i) => sum + (i.value || i.total || 0), 0);

    return (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {data.map((item, index) => {
                const val = item.value || item.total || 0;
                const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                const color = colors[index % colors.length];

                return (
                    <Box key={index} sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: color,
                                        boxShadow: `0 0 8px ${color}`
                                    }}
                                />
                                <Typography sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, fontWeight: 500 }}>
                                    {item.name || item.category || item.source}
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, fontWeight: 500 }}>
                                    {percentage}%
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.85rem', color: theme.palette.text.primary, fontWeight: 800 }}>
                                {formatter(val)}
                            </Typography>
                        </Box>
                        {/* Progress Bar */}
                        <Box
                            sx={{
                                width: '100%',
                                height: 4,
                                borderRadius: 2,
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                overflow: 'hidden'
                            }}
                        >
                            <Box
                                sx={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    bgcolor: color,
                                    borderRadius: 2,
                                    transition: 'width 1s ease-in-out'
                                }}
                            />
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}
