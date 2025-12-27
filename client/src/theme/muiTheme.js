/**
 * Material-UI Theme Configuration
 * WealthWise - Modern Premium Dark Theme
 * 
 * Features:
 * - Vibrant gradients
 * - Glassmorphism effects
 * - Micro-animations
 * - Premium card designs
 */

import { createTheme, alpha } from '@mui/material/styles';

// =====================================================
// COLOR PALETTE - Vibrant & Modern
// =====================================================
const colors = {
  // Primary - Emerald Green
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',

  // Accent - Electric Blue
  accent: '#3B82F6',
  accentLight: '#60A5FA',

  // Secondary - Purple
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',

  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Backgrounds - Deep Space
  bgPrimary: '#0A0F1E',
  bgSecondary: '#111827',
  bgCard: '#1F2937',
  bgCardHover: '#374151',

  // Glass effect colors
  glass: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHover: 'rgba(255, 255, 255, 0.06)',

  // Text
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',

  // Form inputs
  inputBg: '#FFFFFF',
  inputText: '#111827',
  inputBorder: '#D1D5DB',
  inputLabel: '#6B7280'
};

// =====================================================
// GRADIENTS
// =====================================================
const gradients = {
  primary: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
  secondary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  card: 'linear-gradient(145deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
  glow: 'radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)'
};

// =====================================================
// TYPOGRAPHY
// =====================================================
const typography = {
  fontFamily: '"Outfit", "Inter", "SF Pro Display", sans-serif',
  h1: { fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 },
  h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
  h3: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 },
  h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
  body1: { fontSize: '1rem', lineHeight: 1.6, fontWeight: 400 },
  body2: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 400 },
  caption: { fontSize: '0.75rem', lineHeight: 1.4, color: colors.textSecondary, fontWeight: 500 },
  button: { textTransform: 'none', fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '0.01em' }
};

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: colors.primary, light: colors.primaryLight, dark: colors.primaryDark },
    secondary: { main: colors.secondary, light: colors.secondaryLight },
    success: { main: colors.success },
    error: { main: colors.error },
    warning: { main: colors.warning },
    info: { main: colors.info },
    background: { default: colors.bgPrimary, paper: colors.bgSecondary },
    text: { primary: colors.textPrimary, secondary: colors.textSecondary }
  },
  typography,
  shape: { borderRadius: 16 },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `${colors.bgPrimary} ${gradients.glow}`,
          backgroundAttachment: 'fixed'
        }
      }
    },

    // =====================================================
    // BUTTONS - Gradient & Animated
    // =====================================================
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontWeight: 600,
          fontSize: '0.9375rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transition: 'left 0.5s'
          },
          '&:hover::before': {
            left: '100%'
          }
        },
        contained: {
          background: gradients.primary,
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
          '&:hover': {
            background: gradients.primary,
            boxShadow: '0 6px 30px rgba(16, 185, 129, 0.4)',
            transform: 'translateY(-2px)'
          }
        },
        outlined: {
          borderColor: colors.primary,
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            background: alpha(colors.primary, 0.1),
            borderColor: colors.primaryLight
          }
        }
      }
    },

    // =====================================================
    // CARDS - Glassmorphism with Glow
    // =====================================================
    MuiCard: {
      styleOverrides: {
        root: {
          background: gradients.card,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.glassBorder}`,
          borderRadius: 12,  // Reduced from 20 for rectangular look
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
            borderColor: 'rgba(255, 255, 255, 0.12)'
          }
        }
      }
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': { paddingBottom: '24px' }
        }
      }
    },

    // =====================================================
    // FORM INPUTS - Clean Light Design
    // =====================================================
    // TEXT FIELDS - FIXED LABEL OVERLAP
    // =====================================================
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium'
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            transition: 'all 0.2s ease',
            '& fieldset': {
              borderColor: 'rgba(16, 185, 129, 0.3)',
              borderWidth: 1.5
            },
            '&:hover fieldset': {
              borderColor: colors.primary,
              borderWidth: 2
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.primary,
              borderWidth: 2
            }
          },
          '& .MuiInputBase-input': {
            color: '#111827',
            fontSize: '0.95rem',
            padding: '14px 16px'
          },
          // FIX: Label with white background to prevent overlap
          '& .MuiInputLabel-root': {
            color: '#6B7280',
            fontSize: '0.95rem',
            '&.Mui-focused': {
              color: colors.primary
            },
            '&.MuiInputLabel-shrink': {
              backgroundColor: '#FFFFFF',
              padding: '0 8px',
              marginLeft: '-4px',
              borderRadius: '4px'
            }
          }
        }
      }
    },

    // =====================================================
    // SELECT - FIXED LABEL AND TEXT COLOR
    // =====================================================
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(16, 185, 129, 0.3)',
            borderWidth: 1.5
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.primary,
            borderWidth: 2
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.primary,
            borderWidth: 2
          }
        },
        select: {
          color: '#111827',  // Dark text for selected value
          padding: '14px 16px'
        },
        icon: {
          color: '#6B7280'
        }
      }
    },

    // =====================================================
    // INPUT LABEL - GLOBAL FIX
    // =====================================================
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#6B7280',
          fontWeight: 500,
          '&.Mui-focused': {
            color: colors.primary
          },
          '&.MuiInputLabel-shrink': {
            backgroundColor: '#FFFFFF',
            padding: '0 8px',
            marginLeft: '-4px',
            borderRadius: '4px'
          }
        },
        outlined: {
          '&.MuiInputLabel-shrink': {
            backgroundColor: '#FFFFFF',
            padding: '0 8px',
            marginLeft: '-4px',
            borderRadius: '4px',
            transform: 'translate(14px, -9px) scale(0.75)'
          }
        }
      }
    },

    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#6B7280',
            fontWeight: 500,
            '&.MuiInputLabel-shrink': {
              backgroundColor: '#FFFFFF',
              padding: '0 8px',
              marginLeft: '-4px',
              borderRadius: 4
            }
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: colors.primary
          }
        }
      }
    },

    // =====================================================
    // MENU & MENU ITEMS
    // =====================================================
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid #E5E7EB'
        }
      }
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: colors.inputText,
          fontSize: '0.9375rem',
          padding: '12px 16px',
          borderRadius: 8,
          margin: '4px 8px',
          '&:hover': { backgroundColor: '#F3F4F6' },
          '&.Mui-selected': {
            backgroundColor: alpha(colors.primary, 0.1),
            color: colors.primary,
            fontWeight: 600,
            '&:hover': { backgroundColor: alpha(colors.primary, 0.15) }
          }
        }
      }
    },

    // =====================================================
    // DIALOGS - Premium Modal
    // =====================================================
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          backdropFilter: 'blur(40px)',
          border: `1px solid ${colors.glassBorder}`,
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)'
        }
      }
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 700,
          color: colors.textPrimary,
          padding: '20px 24px 16px',
          borderBottom: `1px solid ${colors.glassBorder}`
        }
      }
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px 24px 16px',
          paddingTop: '24px !important', // Ensure top padding for labels
          '&.MuiDialogContent-dividers': { borderColor: colors.glassBorder }
        }
      }
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          '& .MuiButton-root': {
            minWidth: 'auto',
            flex: '0 0 auto'
          }
        }
      }
    },

    // =====================================================
    // CHIPS - Pill Design
    // =====================================================
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 28
        },
        outlined: {
          borderWidth: 2,
          backgroundColor: 'transparent'
        },
        filled: {
          background: alpha(colors.primary, 0.15),
          color: colors.primary
        }
      }
    },

    // =====================================================
    // TABLES - Modern Style
    // =====================================================
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: alpha(colors.primary, 0.05),
            color: colors.textSecondary,
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            borderBottom: `2px solid ${colors.glassBorder}`
          }
        }
      }
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: colors.glassBorder,
          padding: '16px',
          color: colors.textPrimary
        }
      }
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background 0.2s ease',
          '&:hover': {
            backgroundColor: colors.glass
          }
        }
      }
    },

    // =====================================================
    // TABS - Animated
    // =====================================================
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48
        },
        indicator: {
          height: 3,
          borderRadius: 2,
          background: gradients.primary
        }
      }
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          minHeight: 48,
          color: colors.textSecondary,
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: colors.primary
          },
          '&:hover': {
            color: colors.textPrimary
          }
        }
      }
    },

    // =====================================================
    // ICON BUTTONS
    // =====================================================
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: colors.glass,
            transform: 'scale(1.1)'
          }
        }
      }
    },

    // =====================================================
    // TOOLTIPS
    // =====================================================
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.bgCard,
          color: colors.textPrimary,
          fontSize: '0.8125rem',
          fontWeight: 500,
          padding: '8px 14px',
          borderRadius: 8,
          border: `1px solid ${colors.glassBorder}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        },
        arrow: {
          color: colors.bgCard
        }
      }
    },

    // =====================================================
    // LINEAR PROGRESS
    // =====================================================
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 4,
          backgroundColor: alpha(colors.primary, 0.15)
        },
        bar: {
          borderRadius: 4,
          background: gradients.primary
        }
      }
    }
  }
});

// Export colors for use in components
export { colors, gradients };

// Category icons for expenses
export const CATEGORY_ICONS = {
  'Food & Dining': '🍔',
  'Transportation': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Bills & Utilities': '💡',
  'Healthcare': '🏥',
  'Education': '📚',
  'Travel': '✈️',
  'Personal Care': '💅',
  'Groceries': '🛒',
  'Rent': '🏠',
  'Insurance': '🛡️',
  'Savings': '💰',
  'Investments': '📈',
  'Gifts': '🎁',
  'Other': '📌'
};

// Priority colors for expenses
export const PRIORITY_COLORS = {
  low: { bg: '#22C55E', text: '#fff' },
  medium: { bg: '#F59E0B', text: '#fff' },
  high: { bg: '#EF4444', text: '#fff' }
};

// Income source icons
export const INCOME_ICONS = {
  'Salary': '💼',
  'Freelance': '💻',
  'Business': '🏢',
  'Investments': '📈',
  'Rental': '🏠',
  'Interest': '🏦',
  'Dividends': '💹',
  'Bonus': '🎉',
  'Gift': '🎁',
  'Refund': '💸',
  'Other': '📌'
};

