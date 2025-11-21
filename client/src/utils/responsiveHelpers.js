/**
 * Responsive Design Helpers
 * Utility functions and constants for responsive design across breakpoints
 */

// Breakpoint-based padding helpers
export const getResponsivePadding = (xs = 1, sm = 2, md = 3, lg = 4, xl = 4) => ({
  xs,
  sm,
  md,
  lg,
  xl
});

// Breakpoint-based spacing helpers
export const getResponsiveSpacing = (xs = 2, sm = 2, md = 3, lg = 3, xl = 4) => ({
  xs,
  sm,
  md,
  lg,
  xl
});

// Chart height based on breakpoint
export const getResponsiveChartHeight = (isMobile, isTablet, isDesktop) => {
  if (isMobile) return 250;
  if (isTablet) return 280;
  return 320;
};

// Container padding based on breakpoint
export const containerPadding = {
  px: { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  py: { xs: 2, sm: 2, md: 3, lg: 4, xl: 4 }
};

// Card padding based on breakpoint
export const cardPadding = {
  xs: 2,
  sm: 2.5,
  md: 3,
  lg: 3,
  xl: 3
};

// Grid spacing based on breakpoint
export const gridSpacing = {
  xs: 2,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3
};

// Responsive grid column definitions
export const gridColsResponsive = {
  full: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
  half: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
  third: { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 },
  quarter: { xs: 12, sm: 6, md: 3, lg: 3, xl: 3 },
  sixthCol: { xs: 12, sm: 6, md: 2, lg: 2, xl: 2 }
};

// Responsive typography sizing
export const responsiveTypography = {
  h4: {
    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem', lg: '1.5rem' }
  },
  h5: {
    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem', lg: '1.2rem' }
  },
  h6: {
    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem', lg: '1.1rem' }
  },
  body1: {
    fontSize: { xs: '0.85rem', sm: '0.875rem', md: '0.9375rem', lg: '0.9375rem' }
  },
  body2: {
    fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem', lg: '0.875rem' }
  },
  caption: {
    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.75rem', lg: '0.8rem' }
  }
};
