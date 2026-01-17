/**
 * @file AnimatedButton.jsx
 * @description Premium animated button with stars, glow effects, and gradient borders
 * Inspired by space-themed design, adapted for WealthWise brand
 */

import React from 'react';
import { Button } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// ============================================
// ANIMATIONS
// ============================================

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
`;

const animStar = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-135rem);
  }
`;

const animStarRotate = keyframes`
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0);
  }
`;

// ============================================
// STYLED COMPONENTS
// ============================================

const StarsContainer = styled('div')({
    position: 'absolute',
    zIndex: -1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    transition: '0.5s',
    backdropFilter: 'blur(1rem)',
    borderRadius: '5rem',
});

const Stars = styled('div')({
    position: 'relative',
    background: 'transparent',
    width: '200rem',
    height: '200rem',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '-10rem',
        left: '-100rem',
        width: '100%',
        height: '100%',
        animation: `${animStarRotate} 90s linear infinite`,
        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1%)',
        backgroundSize: '50px 50px',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-50%',
        width: '170%',
        height: '500%',
        animation: `${animStar} 60s linear infinite`,
        backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1%)',
        backgroundSize: '50px 50px',
        opacity: 0.5,
    },
});

const Glow = styled('div')({
    position: 'absolute',
    display: 'flex',
    width: '12rem',
    height: '100%',
    left: 0,
    top: 0,
});

const Circle = styled('div')(({ index }) => ({
    width: '100%',
    height: '30px',
    filter: 'blur(2rem)',
    animation: `${pulse} 4s infinite`,
    zIndex: -1,
    background: index === 1
        ? 'rgba(16, 185, 129, 0.636)'  // Emerald
        : 'rgba(6, 182, 212, 0.704)',   // Cyan
}));

const AnimatedButton = styled(Button)(({ variant = 'primary' }) => ({
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '13rem',
    overflow: 'hidden',
    height: '3rem',
    backgroundSize: '300% 300%',
    cursor: 'pointer',
    backdropFilter: 'blur(1rem)',
    borderRadius: '5rem',
    transition: '0.5s',
    animation: `${gradientShift} 5s ease infinite`,
    border: 'double 4px transparent',
    backgroundImage:
        variant === 'primary'
            ? 'linear-gradient(#0f172a, #0f172a), linear-gradient(137.48deg, #10B981 10%, #06B6D4 45%, #3B82F6 67%, #8B5CF6 87%)'
            : 'linear-gradient(#1e293b, #1e293b), linear-gradient(137.48deg, #8B5CF6 10%, #3B82F6 45%, #06B6D4 67%, #10B981 87%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'content-box, border-box',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: '#ffffff',
    textShadow: '0 0 4px rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',

    '&:hover': {
        transform: 'scale(1.05)',
        '& .stars-container': {
            zIndex: 1,
            backgroundColor: '#0f172a',
        },
    },

    '&:active': {
        border: 'double 4px #10B981',
        backgroundOrigin: 'border-box',
        backgroundClip: 'content-box, border-box',
        animation: 'none',
        '& .glow-circle': {
            background: '#10B981',
        },
    },

    '&.Mui-disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none',
    },
}));

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Premium animated button with star effects
 * @param {Object} props - Button props
 * @param {string} props.children - Button text
 * @param {Function} props.onClick - Click handler
 * @param {string} props.variant - 'primary' or 'secondary'
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.fullWidth - Full width button
 * @param {Object} props.sx - Additional MUI sx styles
 * @returns {JSX.Element}
 * 
 * @example
 * <AnimatedButton onClick={handleClick}>
 *   Save Changes
 * </AnimatedButton>
 */
const PremiumButton = ({
    children,
    onClick,
    variant = 'primary',
    disabled = false,
    fullWidth = false,
    startIcon,
    endIcon,
    type = 'button',
    ...props
}) => {
    return (
        <AnimatedButton
            onClick={onClick}
            variant={variant}
            disabled={disabled}
            fullWidth={fullWidth}
            startIcon={startIcon}
            endIcon={endIcon}
            type={type}
            {...props}
        >
            <strong style={{ zIndex: 2 }}>{children}</strong>

            <StarsContainer className="stars-container">
                <Stars />
            </StarsContainer>

            <Glow>
                <Circle className="glow-circle" index={1} />
                <Circle className="glow-circle" index={2} />
            </Glow>
        </AnimatedButton>
    );
};

export default PremiumButton;
