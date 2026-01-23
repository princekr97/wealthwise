/**
 * @file PremiumButton.jsx
 * @description Refined 'Linear' style button with 1px precision borders, 
 * elegant glass animations, and a rich dark mode aesthetic.
 */

import React from 'react';
import { Button, Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// ============================================
// ANIMATIONS
// ============================================

const shineSweep = keyframes`
  0% { transform: translateX(-150%) skewX(-25deg); opacity: 0; }
  50% { opacity: 0.5; }
  100% { transform: translateX(150%) skewX(-25deg); opacity: 0; }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.3; filter: blur(12px); transform: scale(1); }
  50% { opacity: 0.6; filter: blur(16px); transform: scale(1.05); }
`;

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledButton = styled(Button)(({ theme, variant = 'primary' }) => {
  const isPrimary = variant === 'primary';
  const accentColor = isPrimary ? '#10B981' : '#3B82F6';
  const glowColor = isPrimary ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)';

  return {
    // Reset MUI
    textTransform: 'none',
    borderRadius: '10px', // Precise corner radius
    padding: '10px 24px',
    minWidth: 'auto',
    fontWeight: 700,
    fontSize: '0.875rem',
    letterSpacing: '-0.02em',
    color: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',

    // Background - Elegant Dark Slate with subtle top highlights
    backgroundColor: '#0F172A',
    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)',

    // Thin 1px High-Precision Border
    border: `1px solid rgba(255, 255, 255, 0.08)`,
    boxShadow: `0 1px 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,

    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      padding: '1px', // Border thickness
      background: `linear-gradient(135deg, ${accentColor} 0%, rgba(255,255,255,0.1) 50%, ${accentColor} 100%)`,
      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      opacity: 0.4,
      transition: 'opacity 0.3s ease',
    },

    '&:hover': {
      backgroundColor: '#1E293B',
      transform: 'translateY(-1.5px)',
      boxShadow: `0 10px 20px -10px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`,

      '&::before': {
        opacity: 1,
      },

      '& .shine-element': {
        animation: `${shineSweep} 1.5s infinite ease-in-out`,
      },

      '& .glow-element': {
        opacity: 0.8,
        animation: `${glowPulse} 2s infinite ease-in-out`,
      }
    },

    '&:active': {
      transform: 'scale(0.97)',
      backgroundColor: '#0F172A',
    },

    '&.Mui-disabled': {
      opacity: 0.4,
      borderColor: 'rgba(255,255,255,0.1)',
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
    }
  };
});

const ShineElement = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
  zIndex: 1,
  pointerEvents: 'none',
  transform: 'translateX(-150%) skewX(-25deg)',
});

const GlowElement = styled('div')(({ color }) => ({
  position: 'absolute',
  inset: '-20px',
  background: `radial-gradient(circle at center, ${color}, transparent 70%)`,
  zIndex: -1,
  opacity: 0,
  transition: 'opacity 0.4s ease',
  pointerEvents: 'none',
}));

// ============================================
// MAIN COMPONENT
// ============================================

const PremiumButton = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  type = 'button',
  sx = {},
  ...props
}) => {
  const isPrimary = variant === 'primary';
  const accentColor = isPrimary ? '#10B981' : '#3B82F6';
  const glowColor = isPrimary ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)';

  return (
    <StyledButton
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      fullWidth={fullWidth}
      type={type}
      sx={sx}
      disableRipple={false}
      {...props}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative', zIndex: 2 }}>
        {startIcon && (
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', '& svg': { width: 18, height: 18, opacity: 0.8 } }}>
            {startIcon}
          </Box>
        )}

        <Box component="span">
          {children}
        </Box>

        {endIcon && (
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', '& svg': { width: 18, height: 18, opacity: 0.8 } }}>
            {endIcon}
          </Box>
        )}
      </Box>

      {/* Shine Effect */}
      <ShineElement className="shine-element" />

      {/* Background Glow */}
      <GlowElement className="glow-element" color={glowColor} />
    </StyledButton>
  );
};

export default PremiumButton;

