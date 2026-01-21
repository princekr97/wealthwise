/**
 * @file PageLoader.jsx
 * @description Solar System Loader animation for app-level loading states.
 * Design from Uiverse.io by BlackisPlay
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const trails1 = keyframes`
  0% { transform: rotate(0deg); }
  40% { transform: rotate(360deg); width: 96px; height: 96px; }
  50% { width: 0px; height: 0px; }
  90% { width: 0px; height: 0px; }
  100% { width: 96px; height: 96px; }
`;

const trails2 = keyframes`
  0% { transform: rotate(0deg); }
  40% { transform: rotate(250deg); width: 136px; height: 136px; }
  50% { width: 0px; height: 0px; }
  90% { width: 0px; height: 0px; }
  100% { width: 136px; height: 136px; }
`;

const trails3 = keyframes`
  0% { transform: rotate(0deg); }
  40% { transform: rotate(170deg); width: 176px; height: 176px; }
  50% { width: 0px; height: 0px; }
  90% { width: 0px; height: 0px; }
  100% { width: 176px; height: 176px; }
`;

const bouncingStar = keyframes`
  0% { transform: translate(-50%, -50%); }
  10% { transform: translate(-50%, -30%); }
  20% { transform: translate(-50%, -50%); }
  30% { transform: translate(-50%, -30%); }
  40% { transform: translate(-50%, -50%); width: 40px; height: 40px; }
  50% { width: 0px; height: 0px; }
  90% { width: 0px; height: 0px; }
  100% { width: 40px; height: 40px; }
`;

const shadowAnimation = keyframes`
  0% { opacity: 0.1; }
  10% { opacity: 0.4; }
  20% { opacity: 0.1; }
  30% { opacity: 0.4; }
  40% { opacity: 0.1; }
  50% { opacity: 0; }
  90% { opacity: 0; }
  100% { opacity: 0.1; }
`;

const bouncingBlackHole = keyframes`
  0% { height: 0px; width: 0px; }
  40% { width: 0px; height: 0px; }
  50% { width: 40px; height: 40px; }
  90% { width: 40px; height: 40px; }
  100% { width: 0px; height: 0px; }
`;

const diskAn = keyframes`
  0% { height: 0px; width: 0px; border: orange 0px solid; }
  40% { width: 0px; height: 0px; border: orange 0px solid; }
  50% { width: 70px; height: 70px; border: orange 14px solid; }
  90% { width: 70px; height: 70px; border: orange 14px solid; }
  100% { width: 0px; height: 0px; border: orange 0px solid; }
`;

const planetAn = keyframes`
  0% { opacity: 0; transform: translate(0px, 0px); z-index: 1; }
  50% { opacity: 0; transform: translate(0px, 0px); z-index: 1; }
  58% { opacity: 1; }
  70% { opacity: 1; transform: translate(100px, 40px); z-index: 1; }
  71% { z-index: 0; }
  90% { z-index: 0; opacity: 1; transform: translate(-10px, 70px); }
  100% { transform: translate(-10px, 70px); opacity: 0; }
`;

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
    background: '#0f172a',
    zIndex: 9999,
});

const PlanetsWrapper = styled(Box)({
    position: 'relative',
    height: '176px',
    width: '176px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const PlanetTrail = styled(Box)(({ size, animationName }) => ({
    outline: 'solid rgb(101, 101, 101) 1px',
    borderRadius: '50%',
    position: 'absolute',
    width: size,
    height: size,
    animation: `${animationName} 4s infinite`,
    '&::after': {
        content: '""',
        width: '10px',
        height: '10px',
        position: 'absolute',
        borderRadius: '50%',
        top: '-5px',
        left: '50%',
        transform: 'translateX(-50%)',
    },
}));

const PlanetTrail1 = styled(PlanetTrail)({
    '&::after': { backgroundColor: 'rgb(213, 213, 120)' },
});

const PlanetTrail2 = styled(PlanetTrail)({
    '&::after': { backgroundColor: 'rgb(115, 174, 231)' },
});

const PlanetTrail3 = styled(PlanetTrail)({
    '&::after': { backgroundColor: 'rgb(180, 73, 49)' },
});

const Planets = styled(Box)({
    position: 'relative',
    height: '80px',
    width: '80px',
    display: 'flex',
});

const Star = styled(Box)({
    position: 'absolute',
    width: '40px',
    height: '40px',
    backgroundColor: 'rgb(255, 170, 0)',
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animation: `${bouncingStar} 4s infinite`,
});

const StarShadow = styled(Box)({
    position: 'absolute',
    width: '40px',
    height: '16px',
    backgroundColor: 'rgb(255, 170, 0)',
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, 100%)',
    filter: 'blur(4px)',
    opacity: 0.3,
    animation: `${shadowAnimation} 4s infinite`,
});

const BlackHole = styled(Box)({
    position: 'absolute',
    width: '40px',
    height: '40px',
    backgroundColor: 'rgb(0, 0, 0)',
    outline: 'orange solid 4px',
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animation: `${bouncingBlackHole} 4s infinite`,
});

const BlackHoleDisk1 = styled(Box)({
    position: 'absolute',
    width: '54px',
    height: '54px',
    clipPath: 'inset(50% 0 0 0)',
    border: 'black 8px solid',
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotateX(70deg)',
    animation: `${diskAn} 4s infinite`,
});

const BlackHoleDisk2 = styled(Box)({
    position: 'absolute',
    width: '56px',
    height: '56px',
    clipPath: 'inset(0 0 50% 0)',
    border: 'rgb(245, 174, 8) 8px solid',
    borderRadius: '50%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotateX(55deg)',
    animation: `${diskAn} 4s infinite`,
});

const Planet = styled(Box)({
    position: 'absolute',
    width: '10px',
    height: '10px',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: '50%',
    animation: `${planetAn} 4s infinite`,
});

const MessageContainer = styled(Box)({
    marginTop: '40px',
    textAlign: 'center',
    opacity: 0.9,
});

const PageLoader = ({ message = 'Loading...', subMessage }) => {
    return (
        <LoaderContainer>
            <PlanetsWrapper>
                <PlanetTrail1 size="96px" animationName={trails1} />
                <PlanetTrail2 size="136px" animationName={trails2} />
                <PlanetTrail3 size="176px" animationName={trails3} />
                <Planets>
                    <Planet />
                    <Star />
                    <StarShadow />
                    <BlackHoleDisk2 />
                    <BlackHole />
                    <BlackHoleDisk1 />
                </Planets>
            </PlanetsWrapper>

            {(message || subMessage) && (
                <MessageContainer>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgb(255, 170, 0)',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            fontSize: '1.0rem',
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
