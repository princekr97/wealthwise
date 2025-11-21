/**
 * Material-UI Theme Configuration
 * Consistent design system for WealthWise
 */

import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#22C55E', // Green brand color
      light: '#86EFAC',
      dark: '#16A34A',
      contrastText: '#0B1921'
    },
    secondary: {
      main: '#3B82F6', // Blue
      light: '#60A5FA',
      dark: '#1D4ED8',
      contrastText: '#fff'
    },
    success: {
      main: '#10B981',
      light: '#6EE7B7',
      dark: '#059669'
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706'
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626'
    },
    info: {
      main: '#06B6D4',
      light: '#22D3EE',
      dark: '#0891B2'
    },
    background: {
      default: '#020617', // Deep navy
      paper: '#1E293B'
    },
    divider: '#334155',
    text: {
      primary: '#F1F5F9',
      secondary: '#CBD5E1',
      disabled: '#64748B'
    }
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#CBD5E1'
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.9375rem'
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 20px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
          }
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.8125rem'
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '1rem'
        }
      },
      defaultProps: {
        disableElevation: false
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1F2937',
          backgroundImage: 'linear-gradient(135deg, #374151 0%, #1F2937 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #4B5563',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#22C55E',
            boxShadow: '0 12px 48px rgba(34, 197, 94, 0.15)'
          }
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#F8FAFC', // Light background
            borderRadius: 8,
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: '#E2E8F0'
            },
            '&:hover': {
              backgroundColor: '#F1F5F9',
              '& fieldset': {
                borderColor: '#CBD5E1'
              }
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              '& fieldset': {
                borderColor: '#22C55E',
                borderWidth: 2
              }
            }
          },
          '& .MuiOutlinedInput-input': {
            color: '#0F172A', // Dark text
            fontSize: '0.9375rem',
            '&::placeholder': {
              color: '#94A3B8',
              opacity: 1
            }
          },
          '& .MuiInputBase-input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px #F8FAFC inset !important',
            WebkitTextFillColor: '#0F172A !important'
          },
          '& label': {
            color: '#475569'
          },
          '& label.Mui-focused': {
            color: '#22C55E'
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8FAFC',
          color: '#0F172A',
          borderRadius: 8,
          transition: 'all 0.3s ease',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E2E8F0'
          },
          '&:hover': {
            backgroundColor: '#F1F5F9',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CBD5E1'
            }
          },
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#22C55E',
              borderWidth: 2
            }
          }
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#0F172A',
          '&:hover': {
            backgroundColor: '#F3F4F6'
          },
          '&.Mui-selected': {
            backgroundColor: '#F0FDF4',
            color: '#22C55E',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#E7F5E0'
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.8125rem'
        },
        filled: {
          backgroundColor: '#F0FDF4',
          color: '#22C55E',
          border: '1px solid #C6F6D5'
        },
        outlined: {
          backgroundColor: '#F9FAFB',
          color: '#0F172A',
          borderColor: '#E5E7EB'
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          minHeight: 52
        },
        indicator: {
          backgroundColor: '#22C55E',
          height: 3,
          borderRadius: '3px 3px 0 0'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '0.9375rem',
          fontWeight: 600,
          minWidth: 100,
          padding: '12px 16px',
          '&.Mui-selected': {
            color: '#22C55E'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          backdropFilter: 'none',
          borderRadius: 12,
          border: '1px solid #E9ECEF'
        },
        elevation0: {
          backgroundColor: 'transparent',
          border: 'none',
          backgroundImage: 'none'
        },
        elevation1: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E9ECEF',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 8
          }
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          border: '1px solid #E9ECEF'
        }
      }
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          '& .MuiCheckbox-root': {
            color: '#9CA3AF'
          },
          '& .MuiCheckbox-root.Mui-checked': {
            color: '#22C55E'
          }
        }
      }
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#6B7280'
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#22C55E'
          }
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#0F172A',
          fontWeight: 700,
          fontSize: '1.25rem'
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#1F2937'
        }
      }
    }
  }
});

// Category icons mapping
export const CATEGORY_ICONS = {
  'Food & Dining': '🍽️',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Utilities': '💡',
  'Healthcare': '⚕️',
  'Travel': '✈️',
  'Education': '📚',
  'Insurance': '🛡️',
  'Subscriptions': '📱',
  'Savings': '🏦',
  'Investments': '📈',
  'Other': '📌'
};

// Income source icons mapping
export const INCOME_ICONS = {
  'Salary': '💼',
  'Freelance': '💻',
  'Business': '🏪',
  'Investments': '📈',
  'Rental': '🏠',
  'Bonus': '🎁',
  'Other': '📌'
};

// Loan type icons mapping
export const LOAN_ICONS = {
  'Home': '🏠',
  'Auto': '🚗',
  'Personal': '👤',
  'Education': '📚',
  'Business': '🏢',
  'Other': '📌'
};

// Priority color mapping
export const PRIORITY_COLORS = {
  low: { color: 'info', bg: '#0891B2', light: '#06B6D4' },
  medium: { color: 'warning', bg: '#D97706', light: '#F59E0B' },
  high: { color: 'error', bg: '#DC2626', light: '#EF4444' }
};
