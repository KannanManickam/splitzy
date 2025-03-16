import React from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  LinearProgress, 
  Skeleton, 
  Stack,
  Paper
} from '@mui/material';

interface LoadingStateProps {
  /**
   * The type of loading indicator to display
   * - "linear": Shows a linear progress bar at the top
   * - "circular": Shows a centered circular progress with optional message
   * - "skeleton": Shows a skeleton UI (placeholder boxes)
   * - "pulse": Shows pulsing placeholders for content
   */
  type?: 'linear' | 'circular' | 'skeleton' | 'pulse';
  
  /**
   * Optional message to display with the loading indicator
   */
  message?: string;
  
  /**
   * Optional height for the container (for skeleton and circular types)
   */
  height?: string | number;
}

/**
 * Reusable loading component that provides consistent loading UI across the application
 */
const LoadingState: React.FC<LoadingStateProps> = ({ 
  type = 'circular',
  message = 'Loading...',
  height = '300px'
}) => {
  if (type === 'linear') {
    return <LinearProgress />;
  }

  if (type === 'pulse') {
    return (
      <Box sx={{ p: 3, height }}>
        <Stack spacing={2}>
          {/* Header skeleton */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton variant="rectangular" width="40%" height={40} />
            <Skeleton variant="rounded" width={120} height={36} />
          </Stack>
          
          {/* Content skeletons - multiple rows */}
          <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
            {[...Array(4)].map((_, index) => (
              <Box key={index} sx={{ py: 1.5, borderBottom: index < 3 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ width: '100%' }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                  <Skeleton variant="rectangular" width={80} height={32} />
                </Stack>
              </Box>
            ))}
          </Paper>
          
          {/* Bottom message */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography color="text.secondary" variant="body1">
              {message}
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  if (type === 'skeleton') {
    return (
      <Box sx={{ width: '100%', p: 3, minHeight: height }}>
        {/* Header skeleton */}
        <Skeleton variant="rectangular" width="50%" height={36} sx={{ mb: 3 }} />
        
        {/* Content skeletons */}
        {[...Array(3)].map((_, index) => (
          <Skeleton 
            key={index} 
            variant="rectangular"
            animation="wave"
            sx={{ 
              width: '100%', 
              height: 80, 
              mb: 2,
              borderRadius: 1
            }} 
          />
        ))}
        
        {/* Message */}
        <Box sx={{ width: '100%', textAlign: 'center', mt: 3 }}>
          <Typography color="text.secondary" variant="body1">
            {message}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Default circular loading
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height,
        width: '100%'
      }}
    >
      <CircularProgress size={40} thickness={4} />
      {message && (
        <Typography 
          color="text.secondary" 
          variant="body1" 
          sx={{ mt: 2, fontWeight: 500 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingState;