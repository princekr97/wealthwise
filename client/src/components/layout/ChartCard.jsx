/**
 * ChartCard Component
 *
 * Standardized card wrapper for charts with consistent header styling.
 * Mobile-first responsive design.
 */

import React from 'react';
import { Box, Card, CardContent, Typography, useTheme, useMediaQuery } from '@mui/material';

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
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // Calculate responsive height
    const responsiveHeight = isMobile ? height * 0.85 : (isTablet ? height * 0.95 : height);

    return (
        <Card sx={{ height: '100%' }}>
            {/* Header */}
            <CardContent sx={{ pb: 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: { xs: 1.5, sm: 2 },
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' }, // Bolder and larger
                            letterSpacing: '-0.01em'
                        }}
                    >
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                fontWeight: 500
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </CardContent>

            {/* Chart Content */}
            <CardContent
                sx={{
                    pt: 0,
                    pb: footer ? 0 : undefined,
                    px: noPadding ? 0 : undefined,
                }}
            >
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
            </CardContent>

            {/* Optional Footer */}
            {footer && (
                <CardContent sx={{ pt: 2 }}>
                    {footer}
                </CardContent>
            )}
        </Card>
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
        <Box
            sx={{
                borderTop: '1px solid rgba(255,255,255,0.08)',
                pt: 2.5,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(auto-fill, minmax(140px, 1fr))' },
                gap: 1.5,
            }}
        >
            {data.map((item, index) => {
                const val = item.value || item.total || 0;
                const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                const color = colors[index % colors.length];

                return (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            p: 1.25,
                            borderRadius: 2,
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                borderColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: color,
                                    flexShrink: 0
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    color: 'text.primary'
                                }}
                            >
                                {item.name || item.category || item.source}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.25 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: color
                                }}
                            >
                                {formatter(val)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                                {percentage}%
                            </Typography>
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}
