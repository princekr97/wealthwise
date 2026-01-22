/**
 * Global Styles for WealthWise
 * Modern Premium Dark Theme with Animations
 */

import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import React from 'react';
import { useThemeContext } from '../context/ThemeContext';
import { gradients } from './gradients';

export default function GlobalStyles() {
  const { currentGradient, mode } = useThemeContext();
  const activeGradient = gradients[currentGradient]?.gradient || gradients.emeraldFinance.gradient;
  const isLight = mode === 'light';

  React.useEffect(() => {
    document.documentElement.style.setProperty('--active-gradient', activeGradient);
    document.documentElement.setAttribute('data-theme', mode);
  }, [activeGradient, mode]);

  return (
    <MuiGlobalStyles
      styles={{
        // =====================================================
        // ROOT VARIABLES & BASE STYLES
        // =====================================================

        ':root': {
          '--active-gradient': activeGradient,
        },

        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0
        },

        'html': {
          height: '100%',
          minHeight: '100vh',
        },

        'html[data-theme="dark"]': {
          backgroundColor: '#0F172A',
        },

        'html[data-theme="light"]': {
          backgroundColor: '#F8FAFC',
        },

        'body': {
          minHeight: '100vh',
          color: '#F9FAFB',
          margin: 0,
          padding: 0,
          position: 'relative',
          overflowX: 'hidden',
          overscrollBehavior: 'contain'
        },

        '[data-theme="dark"] body': {
          backgroundColor: '#0F172A',
          color: '#F9FAFB',
        },

        '[data-theme="light"] body': {
          backgroundColor: '#F8FAFC',
          color: '#000000',
        },

        'body::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          zIndex: -1,
          pointerEvents: 'none',
          transition: 'opacity 0.5s ease-in-out',
        },

        '[data-theme="dark"] body::before': {
          background: 'var(--active-gradient)',
          opacity: 1,
        },

        '[data-theme="light"] body::before': {
          background: '#F8FAFC',
          opacity: 1,
        },

        '#root': {
          minHeight: '100vh',
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'column'
        },

        // =====================================================
        // CUSTOM SCROLLBAR
        // =====================================================

        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px'
        },
        '*::-webkit-scrollbar-track': {
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '4px'
        },
        '*::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.4) 100%)',
          borderRadius: '4px',
          border: '2px solid transparent',
          backgroundClip: 'content-box',
          '&:hover': {
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.6) 0%, rgba(59, 130, 246, 0.6) 100%)',
            backgroundClip: 'content-box'
          }
        },

        // =====================================================
        // ANIMATIONS
        // =====================================================

        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },

        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 }
        },

        '@keyframes shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },

        '@keyframes glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.5)' }
        },

        // =====================================================
        // UTILITY CLASSES
        // =====================================================

        '.glass-card-clean': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
        },

        '[data-theme="light"] .glass-card-clean': {
          background: '#FFFFFF !important',
          backdropFilter: 'none',
          border: '1px solid #E2E8F0 !important',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important',
        },

        '[data-theme="light"] .MuiTypography-root': {
          color: '#000000 !important',
        },

        '[data-theme="light"] .MuiCard-root': {
          background: '#FFFFFF !important',
          border: '1px solid #E2E8F0 !important',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important',
        },

        '[data-theme="light"] .MuiBox-root': {
          '&[class*="glass"]': {
            border: '1px solid #D1D5DB !important',
          },
          '&[class*="css-"]': {
            borderColor: '#D1D5DB !important',
          }
        },

        '[data-theme="light"] .MuiStack-root': {
          '& > .MuiBox-root': {
            borderColor: '#D1D5DB !important',
            backgroundColor: 'rgba(255, 255, 255, 0.8) !important',
          }
        },

        '[data-theme="light"] .MuiTypography-root, [data-theme="light"] .MuiListItemText-primary, [data-theme="light"] .MuiTableCell-root, [data-theme="light"] .MuiInputBase-input, [data-theme="light"] .MuiSelect-select': {
          color: '#0A0A0A !important',
        },

        '[data-theme="light"] .MuiInputLabel-root': {
          color: '#4B5563 !important',
        },

        '[data-theme="light"] [data-sonner-toast]': {
          color: '#000000 !important',
          '& [data-description]': {
            color: '#374151 !important',
          }
        },

        '[data-theme="light"] nav': {
          background: '#FFFFFF !important',
          borderTop: '1px solid #E2E8F0 !important',
          boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.05) !important',
          '& svg': {
            color: '#64748B !important',
          },
          '& a': {
            color: '#64748B !important',
          },
          '& .active': {
            '& *': {
              color: '#10B981 !important',
            },
            '& svg': {
              color: '#10B981 !important',
            }
          }
        },

        '[data-theme="light"] .MuiDialog-paper': {
          background: '#FFFFFF !important',
          backgroundColor: '#FFFFFF !important',
          backgroundImage: 'none !important',
          border: '1px solid #E2E8F0 !important',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important',
          '& > div[style*="background: rgb(15, 23, 42)"]': {
            background: '#FCF8F3 !important',
            borderBottom: '1px solid #E5E7EB !important',
          },
          '& .MuiInputBase-root': {
            background: '#FFFFFF !important',
            backgroundColor: '#FFFFFF !important',
            borderColor: '#E2E8F0 !important',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D1D5DB !important',
          },
          '& .MuiButton-root': {
            color: '#1E293B !important',
            '&:hover': {
              backgroundColor: '#F3F4F6 !important',
            }
          },
          '& .MuiIconButton-root': {
            color: '#1E293B !important',
            '&:hover': {
              backgroundColor: '#F3F4F6 !important',
            }
          },
          '& svg': {
            color: '#1E293B !important',
          },
          '& .MuiDialogContent-root': {
            background: '#FCF8F3 !important',
            backgroundColor: '#FCF8F3 !important',
          },
          '& .MuiBox-root': {
            backgroundColor: 'transparent !important',
          },
          '& h6': {
            color: '#1E293B !important',
          }
        },

        '[data-theme="light"] .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5) !important',
        },

        '[data-theme="light"] .MuiPaper-root': {
          background: '#FFFFFF !important',
          backgroundColor: '#FFFFFF !important',
          backgroundImage: 'none !important',
          color: '#1E293B !important',
        },

        '[data-theme="light"] .MuiDrawer-paper': {
          background: '#FCF8F3 !important',
          backgroundColor: '#FCF8F3 !important',
          backgroundImage: 'none !important',
          border: 'none !important',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1) !important',
          '& *': {
            color: '#1E293B !important',
          },
          '& svg': {
            color: '#1E293B !important',
          },
          '& nav': {
            border: 'none !important',
            boxShadow: 'none !important',
          },
          '& nav a': {
            border: 'none !important',
          },
          '& nav a > div': {
            border: 'none !important',
            background: 'transparent !important',
          },
          '& .active': {
            '& *': {
              color: '#10B981 !important',
            },
            '& svg': {
              color: '#10B981 !important',
            },
            '& > div': {
              background: 'rgba(16, 185, 129, 0.1) !important',
              border: 'none !important',
            }
          }
        },

        '[data-theme="light"] .MuiCircularProgress-root': {
          color: '#10B981 !important',
        },

        '[data-theme="light"] .page-loader': {
          background: '#F8FAFC !important',
          '& *': {
            color: '#1E293B !important',
          },
          '& .MuiCircularProgress-root': {
            color: '#10B981 !important',
          }
        },

        '[data-theme="light"] header': {
          background: '#FCF8F3 !important',
          borderBottom: '1px solid #E5E7EB !important',
          '& *': {
            color: '#1E293B !important',
          },
          '& svg': {
            color: '#1E293B !important',
          }
        },

        '[data-theme="light"] .glow-circle': {
          display: 'none !important',
        },

        '[data-theme="light"] .stars-container': {
          display: 'none !important',
        },

        '[data-theme="light"] .MuiButton-primary': {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%) !important',
          color: '#FFFFFF !important',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3) !important',
          '& *': {
            color: '#FFFFFF !important',
          },
          '& svg': {
            color: '#FFFFFF !important',
          },
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%) !important',
            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4) !important',
          }
        },

        '.animate-fade-in': {
          animation: 'fadeIn 0.5s ease-out forwards'
        },

        '.animate-pulse': {
          animation: 'pulse 2s ease-in-out infinite'
        },

        '.animate-glow': {
          animation: 'glow 3s ease-in-out infinite'
        },

        // =====================================================
        // FORM INPUT FIXES
        // =====================================================

        // Autofill styling
        '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active': {
          WebkitBoxShadow: '0 0 0 1000px #FCF8F3 inset !important',
          WebkitTextFillColor: '#111827 !important',
          caretColor: '#111827',
          borderRadius: '12px'
        },

        // Number input spinners
        'input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button': {
          opacity: 1,
          height: 'auto'
        },

        // =====================================================
        // CHART STYLING
        // =====================================================

        '& .recharts-tooltip-wrapper': {
          outline: 'none'
        },

        '& .recharts-default-tooltip': {
          backgroundColor: isLight ? '#FFFFFF !important' : 'rgba(10, 15, 30, 0.95) !important',
          border: isLight ? '1px solid #E2E8F0 !important' : '1px solid rgba(255, 255, 255, 0.1) !important',
          borderRadius: '12px !important',
          boxShadow: isLight ? '0 8px 32px rgba(0, 0, 0, 0.1) !important' : '0 8px 32px rgba(0, 0, 0, 0.4) !important',
          padding: '12px 16px !important'
        },

        '& .recharts-tooltip-label': {
          color: isLight ? '#1E293B !important' : '#F9FAFB !important',
          fontWeight: '700 !important',
          marginBottom: '8px !important',
          fontSize: '0.875rem !important'
        },

        '& .recharts-tooltip-item': {
          color: isLight ? '#64748B !important' : '#9CA3AF !important',
          fontSize: '0.8125rem !important'
        },

        '& .recharts-tooltip-item-value': {
          color: '#10B981 !important',
          fontWeight: '600 !important'
        },

        '& .recharts-legend-wrapper': {
          paddingTop: '16px !important'
        },

        '& .recharts-legend-item-text': {
          color: '#9CA3AF !important',
          fontSize: '0.8125rem !important',
          fontWeight: '500 !important'
        },

        // =====================================================
        // TYPOGRAPHY ENHANCEMENTS
        // =====================================================

        '& .MuiTypography-colorTextSecondary': {
          color: '#9CA3AF !important'
        },

        // =====================================================
        // SELECTION STYLE
        // =====================================================

        '::selection': {
          backgroundColor: 'rgba(16, 185, 129, 0.3)',
          color: '#F9FAFB'
        },

        // =====================================================
        // FOCUS VISIBLE
        // =====================================================

        '*:focus-visible': {
          outline: '2px solid rgba(16, 185, 129, 0.6)',
          outlineOffset: '2px'
        },

        // =====================================================
        // TOAST NOTIFICATIONS (Sonner)
        // =====================================================

        '[data-sonner-toast]': {
          backgroundColor: '#1F2937 !important',
          border: '1px solid rgba(255, 255, 255, 0.1) !important',
          borderRadius: '12px !important',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4) !important',
          padding: '16px !important'
        },

        '[data-sonner-toast][data-type="success"]': {
          backgroundColor: 'rgba(16, 185, 129, 0.1) !important',
          borderColor: 'rgba(16, 185, 129, 0.3) !important'
        },

        '[data-sonner-toast][data-type="error"]': {
          backgroundColor: 'rgba(239, 68, 68, 0.1) !important',
          borderColor: 'rgba(239, 68, 68, 0.3) !important'
        },

        '[data-sonner-toast][data-type="warning"]': {
          backgroundColor: 'rgba(245, 158, 11, 0.1) !important',
          borderColor: 'rgba(245, 158, 11, 0.3) !important'
        },

        '[data-sonner-toast][data-type="info"]': {
          backgroundColor: 'rgba(59, 130, 246, 0.1) !important',
          borderColor: 'rgba(59, 130, 246, 0.3) !important'
        },

        '[data-sonner-toast] [data-title]': {
          color: '#F9FAFB !important',
          fontWeight: '600 !important',
          fontSize: '0.9375rem !important'
        },

        '[data-sonner-toast] [data-description]': {
          color: '#9CA3AF !important',
          fontSize: '0.8125rem !important'
        },

        '[data-sonner-toast] [data-button]': {
          backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
          color: '#F9FAFB !important',
          borderRadius: '8px !important',
          padding: '8px 12px !important',
          fontSize: '0.8125rem !important',
          fontWeight: '600 !important',
          border: '1px solid rgba(255, 255, 255, 0.2) !important',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15) !important'
          }
        }
      }}
    />
  );
}
