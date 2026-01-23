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
// COLOR PALETTE - Premium Fintech Aesthetic
// =====================================================
const colors = {
  // Primary - Emerald to Cyan (Income/Positive)
  primary: '#10B981',      // Emerald
  primaryLight: '#06B6D4',  // Cyan
  primaryDark: '#059669',
  
  // Accent - Electric Blue (CTAs & Interactive)
  accent: '#3B82F6',
  accentLight: '#60A5FA',
  accentDark: '#2563EB',

  // Secondary - Purple
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',

  // Semantic Colors
  success: '#10B981',      // Emerald
  successLight: '#34D399',
  error: '#EF4444',        // Red
  errorLight: '#FF6B6B',   // Coral
  warning: '#F59E0B',      // Amber
  warningLight: '#FCD34D',
  info: '#3B82F6',
  infoLight: '#60A5FA',

  // Backgrounds - Rich Dark Charcoal
  bgPrimary: '#0F172A',    // Rich charcoal (not pure black)
  bgSecondary: '#1E293B',  // Slate
  bgCard: 'rgba(30, 41, 59, 0.95)',  // Glass effect
  bgCardHover: 'rgba(51, 65, 85, 0.95)',

  // Glass Effect - Frosted
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassHover: 'rgba(255, 255, 255, 0.08)',
  glassFrosted: 'rgba(255, 255, 255, 0.03)',

  // Text - Better Contrast
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',  // Cool gray
  textMuted: '#64748B',      // Slate

  // Form Inputs - Light Mode
  inputBg: '#F9FAFB',
  inputText: '#0A0A0A',
  inputBorder: '#E5E7EB',
  inputBorderFocus: '#10B981',
  inputLabel: '#6B7280'
};

// =====================================================
// GRADIENTS - Vibrant & Purposeful
// =====================================================
const gradients = {
  // Primary CTAs - Emerald to Cyan
  primary: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
  primarySubtle: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
  
  // Secondary - Purple to Pink
  secondary: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  
  // Income - Emerald Glow
  income: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
  incomeSubtle: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
  
  // Expense - Coral to Rose
  expense: 'linear-gradient(135deg, #FF6B6B 0%, #FB7185 100%)',
  expenseSubtle: 'linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(251, 113, 133, 0.05) 100%)',
  
  // Savings/Neutral - Slate
  neutral: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
  
  // Card Backgrounds - Frosted Glass (More transparent to show root theme)
  card: 'linear-gradient(145deg, rgba(30, 41, 59, 0.1) 0%, rgba(15, 23, 42, 0.2) 100%)',
  cardHover: 'linear-gradient(145deg, rgba(51, 65, 85, 0.15) 0%, rgba(30, 41, 59, 0.25) 100%)',
  
  // Page Background Glow
  glow: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.15), transparent 50%)',
  glowBlue: 'radial-gradient(ellipse 60% 50% at 50% -20%, rgba(59, 130, 246, 0.1), transparent 50%)'
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

export const createMuiTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: colors.primary, light: colors.primaryLight, dark: colors.primaryDark },
    secondary: { main: colors.secondary, light: colors.secondaryLight },
    success: { main: colors.success },
    error: { main: colors.error },
    warning: { main: colors.warning },
    info: { main: colors.info },
    background: { 
      default: mode === 'dark' ? colors.bgPrimary : '#F8FAFC', 
      paper: mode === 'dark' ? colors.bgSecondary : '#FFFFFF' 
    },
    text: { 
      primary: mode === 'dark' ? colors.textPrimary : '#000000', 
      secondary: mode === 'dark' ? colors.textSecondary : '#374151' 
    }
  },
  typography,
  shape: { borderRadius: 16 },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // background and backgroundAttachment moved to GlobalStyles.jsx for dynamic switching
          margin: 0,
          padding: 0,
          // Add keyframe animations
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.6 },
            '100%': { opacity: 1 }
          },
          '@keyframes checkPulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)' }
          },
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' }
          }
        }
      }
    },

    // =====================================================
    // BUTTONS - Vibrant Gradient with Micro-interactions
    // =====================================================
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 28px',
          fontWeight: 600,
          fontSize: '0.9375rem',
          letterSpacing: '0.01em',
          textTransform: 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '44px',  // Touch-friendly
          // Shimmer effect on hover
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.6s ease'
          },
          '&:hover::before': {
            left: '100%'
          }
        },
        contained: {
          background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',  // Cyan to Blue
          color: '#FFFFFF',
          fontWeight: 700,  // Bold white text
          boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
            boxShadow: '0 6px 24px rgba(6, 182, 212, 0.45)',  // Soft glow
            transform: 'translateY(-2px)'
          },
          '&:active': {
            transform: 'translateY(0) scale(0.98)'
          }
        },
        sizeLarge: {
          minHeight: '48px',  // Primary CTA height
          padding: '14px 32px',
          fontSize: '1rem'
        },
        outlined: {
          borderColor: colors.primary,
          color: colors.primary,
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            background: alpha(colors.primary, 0.08),
            borderColor: colors.primaryLight,
            transform: 'translateY(-2px)'
          }
        },
        text: {
          color: colors.primary,
          '&:hover': {
            background: alpha(colors.primary, 0.08)
          }
        }
      }
    },

    // ================================================================================
    // CARDS - Premium Frosted Glass with Ambient Occlusion Shadows
    // =====================================================
    MuiCard: {
      styleOverrides: {
        root: {
          background: gradients.card,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${colors.glassBorder}`,
          borderRadius: 18,  // Premium rounded corners
          // Soft, diffused ambient occlusion shadow
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12), 0px 2px 6px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          // Subtle top highlight (breathing glow)
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)'
          },
          // Hover state - lift and shadow enhancement
          '&:hover': {
            transform: 'translateY(-4px) scale(1.01)',
            boxShadow: '0px 16px 48px rgba(0, 0, 0, 0.16), 0px 4px 12px rgba(0, 0, 0, 0.12)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            background: gradients.cardHover
          }
        }
      }
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',  // Generous padding
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
            backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF',
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
              backgroundColor: '#FCF8F3',
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
          backgroundColor: '#FCF8F3',
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
            backgroundColor: '#FCF8F3',
            padding: '0 8px',
            marginLeft: '-4px',
            borderRadius: '4px'
          }
        },
        outlined: {
          '&.MuiInputLabel-shrink': {
            backgroundColor: '#FCF8F3',
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
              backgroundColor: '#FCF8F3',
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
          backgroundColor: '#FCF8F3',
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
    // DIALOGS - Premium Modal with Dark Blur
    // =====================================================
    MuiDialog: {
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }
        },
        paper: {
          background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), var(--active-gradient)',
          backgroundAttachment: 'fixed',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden'
        }
      }
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.35rem',
          fontWeight: 700,
          color: colors.textPrimary,
          padding: '24px 28px 20px',
          borderBottom: `1px solid ${colors.glassBorder}`,
          letterSpacing: '-0.01em'
        }
      }
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '14px',  // Compact padding for launch
          paddingTop: '14px !important',
          '&.MuiDialogContent-dividers': {
            borderColor: colors.glassBorder,
            borderTop: 'none'
          }
        }
      }
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '20px 28px 28px',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          borderTop: `1px solid ${colors.glassBorder}`,
          '& .MuiButton-root': {
            minWidth: '120px'
          }
        }
      }
    },

    // =====================================================
    // CHIPS - Color-Coded Priority Badges
    // =====================================================
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 24,  // Full pill shape
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 30,
          letterSpacing: '0.02em',
          transition: 'all 0.2s ease'
        },
        outlined: {
          borderWidth: 1.5,
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: alpha(colors.primary, 0.05)
          }
        },
        filled: {
          background: alpha(colors.primary, 0.15),
          color: colors.primary,
          border: 'none',
          '&:hover': {
            background: alpha(colors.primary, 0.25)
          }
        },
        // Color variants
        colorSuccess: {
          backgroundColor: alpha('#22C55E', 0.15),
          color: '#22C55E',
          fontWeight: 700
        },
        colorError: {
          backgroundColor: alpha('#EF4444', 0.15),
          color: '#EF4444',
          fontWeight: 700
        },
        colorWarning: {
          backgroundColor: alpha('#F59E0B', 0.15),
          color: '#F59E0B',
          fontWeight: 700
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
          backgroundColor: mode === 'dark' ? colors.bgCard : '#FFFFFF',
          color: mode === 'dark' ? colors.textPrimary : '#1E293B',
          fontSize: '0.8125rem',
          fontWeight: 500,
          padding: '8px 14px',
          borderRadius: 8,
          border: mode === 'dark' ? `1px solid ${colors.glassBorder}` : '1px solid #E2E8F0',
          boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
        arrow: {
          color: mode === 'dark' ? colors.bgCard : '#FFFFFF'
        }
      }
    },

    // =====================================================
    // CHECKBOXES - Smooth Animation
    // =====================================================
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.textSecondary,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(colors.primary, 0.08)
          },
          '&.Mui-checked': {
            color: colors.primary,
            animation: 'checkPulse 0.3s ease-out'
          }
        }
      }
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: alpha(colors.textSecondary, 0.5),
          '&.Mui-checked': {
            color: colors.primary
          },
          '&:hover': {
            backgroundColor: alpha(colors.primary, 0.08)
          },
          '& .MuiSvgIcon-root': {
            fontSize: '1.5rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }
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

// Legacy export for backward compatibility if needed (defaults to dark)
export const muiTheme = createMuiTheme('dark');

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

