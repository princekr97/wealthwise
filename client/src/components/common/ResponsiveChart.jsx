/**
 * Responsive Chart Container Wrapper
 * Automatically handles responsive sizing for Recharts ResponsiveContainer
 */

import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ResponsiveContainer } from 'recharts';

export default function ResponsiveChart({ 
  children, 
  minHeight = 250,
  mobileHeight = 250,
  tabletHeight = 280,
  desktopHeight = 320,
  ...props 
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const height = isMobile ? mobileHeight : (isTablet ? tabletHeight : desktopHeight);

  return (
    <Box sx={{ width: '100%', height: height, ...props }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </Box>
  );
}
