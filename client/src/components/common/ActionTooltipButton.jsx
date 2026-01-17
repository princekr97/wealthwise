import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const ActionTooltipButton = ({ icon, label, onClick, color = 'white', isLoading = false }) => (
    <Box className="action-tooltip-btn" onClick={onClick}>
        <Box
            className="icon-container"
            sx={{
                color: color,
                backgroundColor: color === '#14B8A6' ? 'rgba(20, 184, 166, 0.1)' : undefined,
                borderColor: color === '#14B8A6' ? 'rgba(20, 184, 166, 0.2)' : undefined
            }}
        >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : icon}
        </Box>
        <span className="tooltip-text">{label}</span>
    </Box>
);

export default ActionTooltipButton;
