/**
 * @file PageLoader.jsx
 * @description Warp Loader animation for app-level loading states.
 * Design from Uiverse.io by risabbir
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Keyframes
const pulse = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 1;
  }
  70% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.15;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
`;

const corePulse = keyframes`
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
`;

// Styled Components

const LoaderContainer = styled(Box)({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a', // Consistent dark theme background
    zIndex: 9999,
});

const WarpLoaderWrapper = styled(Box)({
    position: 'relative',
    width: '160px',
    height: '160px',
});

const Ring = styled(Box)(({ delay }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'radial-gradient(circle, rgba(0, 255, 255, 0.15) 30%, transparent 70%)',
    animation: `${pulse} 2.2s ease-out infinite`,
    opacity: 0,
    boxShadow: '0 0 12px #00d1ff66, 0 0 24px #00d1ff33',
    border: '2px solid rgba(0, 255, 255, 0.2)',
    animationDelay: delay,
}));

const CoreGlow = styled(Box)({
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '24px',
    height: '24px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    background: 'radial-gradient(circle at center, #00e5ff, #0099cc)',
    boxShadow: '0 0 25px #00e5ff, 0 0 60px #00e5ff88, 0 0 100px #00e5ff33',
    animation: `${corePulse} 1.6s ease-in-out infinite`,
});

const MessageContainer = styled(Box)({
    marginTop: '40px',
    textAlign: 'center',
    opacity: 0.9,
    position: 'relative',
    zIndex: 10 // Ensure text is above any potential glow spill
});

/**
 * Warp Animation Page Loader
 * @param {Object} props
 * @param {string} props.message - Loading message
 * @param {string} props.subMessage - Optional sub-message
 */
const PageLoader = ({ message = 'Warping...', subMessage }) => {
    return (
        <LoaderContainer>
            <WarpLoaderWrapper>
                <Ring delay="0s" />
                <Ring delay="0.4s" />
                <Ring delay="0.8s" />
                <Ring delay="1.2s" />
                <CoreGlow />
            </WarpLoaderWrapper>

            {(message || subMessage) && (
                <MessageContainer>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#00e5ff', // Match the cyan/teal theme of the loader
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            fontSize: '1.0rem',
                            textShadow: '0 0 10px rgba(0, 229, 255, 0.5)'
                        }}
                    >
                        {message}
                    </Typography>
                    {subMessage && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.6)',
                                mt: 0.5,
                                fontSize: '0.65rem'
                            }}
                        >
                            {subMessage}
                        </Typography>
                    )}
                </MessageContainer>
            )}
        </LoaderContainer>
    );
};

export default PageLoader;
