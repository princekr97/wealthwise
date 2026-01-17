/**
 * Global Styles for WealthWise
 * Modern Premium Dark Theme with Animations
 */

import { GlobalStyles as MuiGlobalStyles } from '@mui/material';
import { useThemeContext } from '../context/ThemeContext';
import { gradients } from './gradients';

export default function GlobalStyles() {
  const { currentGradient } = useThemeContext();
  const activeGradient = gradients[currentGradient]?.gradient || gradients.sophisticatedNavy.gradient;

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
          backgroundColor: 'transparent',
        },

        'body': {
          minHeight: '100vh',
          background: 'var(--active-gradient)',
          backgroundAttachment: 'fixed',
          backgroundColor: '#0F172A', // Fallback
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          color: '#F9FAFB',
          transition: 'background 0.5s ease-in-out' // Smooth transition
        },

        '#root': {
          minHeight: '100vh',
          backgroundColor: 'transparent',
        },

        // Smooth scrolling
        html: {
          scrollBehavior: 'smooth'
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
          WebkitBoxShadow: '0 0 0 1000px #FFFFFF inset !important',
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
          backgroundColor: 'rgba(10, 15, 30, 0.95) !important',
          border: '1px solid rgba(255, 255, 255, 0.1) !important',
          borderRadius: '12px !important',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4) !important',
          padding: '12px 16px !important'
        },

        '& .recharts-tooltip-label': {
          color: '#F9FAFB !important',
          fontWeight: '700 !important',
          marginBottom: '8px !important',
          fontSize: '0.875rem !important'
        },

        '& .recharts-tooltip-item': {
          color: '#9CA3AF !important',
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
