/**
 * ChartCard Component
 *
 * Standardized card wrapper for charts with consistent header styling.
 * Mobile-first responsive design.
 */

import React from 'react';
import { Box, Card, CardContent, Typography, useTheme, useMediaQuery, Collapse } from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material';

/**
 * ChartCard provides a consistent wrapper for chart visualizations
 * 
 * @param {string} title - Chart title (with emoji prefix)
 * @param {string} subtitle - Optional subtitle/description
 * @param {number} height - Chart height (will be responsive)
 * @param {React.ReactNode} children - Chart content
 * @param {React.ReactNode} footer - Optional footer content (legend, stats)
 * @param {boolean} noPadding - Remove content padding
 */
export default function ChartCard({
    title,
    subtitle,
    height = 280,
    children,
    footer,
    noPadding = false,
    collapsible = false,
    defaultExpanded = true
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
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                overflow: 'hidden'
            }}
        >
            {/* Header - Simple and clean */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: expanded ? 2 : 0,
                    cursor: collapsible ? 'pointer' : 'default',
                    minHeight: '48px',
                    p: 1.5,
                    borderRadius: '12px',
                    transition: 'background 0.2s',
                    '&:hover': collapsible ? { bgcolor: 'rgba(255,255,255,0.03)' } : {}
                }}
                onClick={() => collapsible && setExpanded(!expanded)}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            letterSpacing: '-0.01em',
                            lineHeight: 1.2,
                            color: '#e2e8f0'
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && expanded && (
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                fontWeight: 500,
                                mt: 0.5,
                                color: '#94a3b8'
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {collapsible && (
                    <KeyboardArrowDownIcon
                        fontSize="medium"
                        sx={{
                            color: '#94a3b8',
                            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                            opacity: 0.7
                        }}
                    />
                )}
            </Box>

            <Collapse in={expanded}>
                {/* Content wrapper */}
                <Box sx={{ px: noPadding ? 0 : 1.5, pb: footer ? 0 : 2 }}>
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
                    <Box sx={{ pt: 1, px: 1.5, pb: 2 }}>
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
                                <Typography sx={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>
                                    {item.name || item.category || item.source}
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                                    {percentage}%
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 600 }}>
                                {formatter(val)}
                            </Typography>
                        </Box>
                        {/* Progress Bar */}
                        <Box
                            sx={{
                                width: '100%',
                                height: 4,
                                borderRadius: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
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
