/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 * Prevents entire app from crashing
 */

import React from 'react';
import { Box, Button, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when error is caught
   * @param {Error} error - Error object
   * @returns {Object} New state
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Log error details
   * @param {Error} error - Error object
   * @param {Object} errorInfo - Error info with component stack
   */
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  /**
   * Reset error state
   */
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 3,
            bgcolor: '#0F172A'
          }}
        >
          <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
            😕
          </Typography>
          <Typography variant="h5" sx={{ mb: 1, color: '#F1F5F9', fontWeight: 600 }}>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body2" sx={{ mb: 4, color: '#94A3B8', maxWidth: 500 }}>
            We encountered an unexpected error. Don't worry, your data is safe. 
            Try refreshing the page or contact support if the problem persists.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                }
              }}
            >
              Reload Page
            </Button>
            <Button
              variant="outlined"
              onClick={this.handleReset}
              sx={{
                borderColor: '#94A3B8',
                color: '#94A3B8',
                '&:hover': {
                  borderColor: '#F1F5F9',
                  color: '#F1F5F9'
                }
              }}
            >
              Try Again
            </Button>
          </Box>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box
              sx={{
                mt: 4,
                p: 2,
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 2,
                maxWidth: 600,
                textAlign: 'left'
              }}
            >
              <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 600 }}>
                Error Details (Development Only):
              </Typography>
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  color: '#F87171',
                  fontSize: '0.7rem',
                  mt: 1,
                  overflow: 'auto',
                  maxHeight: 200
                }}
              >
                {this.state.error.toString()}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
