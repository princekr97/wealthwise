/**
 * Skeleton Loader Components
 * Provides loading placeholders for better UX
 */

import React from 'react';
import { Card, CardContent, Skeleton, Stack, Box } from '@mui/material';

/**
 * Skeleton loader for card components
 * @param {Object} props
 * @param {number} props.count - Number of skeleton cards (default: 1)
 * @returns {JSX.Element}
 */
export const SkeletonCard = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="text" width="25%" height={28} />
              </Box>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="rounded" width={80} height={32} />
                <Skeleton variant="rounded" width={80} height={32} />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

/**
 * Skeleton loader for list items
 * @param {Object} props
 * @param {number} props.count - Number of skeleton items (default: 3)
 * @returns {JSX.Element}
 */
export const SkeletonList = ({ count = 3 }) => {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
          <Skeleton variant="text" width="15%" height={28} />
        </Box>
      ))}
    </Stack>
  );
};

/**
 * Skeleton loader for dashboard stats
 * @param {Object} props
 * @param {number} props.count - Number of stat cards (default: 4)
 * @returns {JSX.Element}
 */
export const SkeletonStats = ({ count = 4 }) => {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent>
            <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="70%" height={36} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={18} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

/**
 * Skeleton loader for charts
 * @returns {JSX.Element}
 */
export const SkeletonChart = () => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  );
};
