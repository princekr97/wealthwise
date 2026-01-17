import React, { createContext, useContext, useState, useEffect } from 'react';
import { gradients } from '../theme/gradients';

const ThemeContext = createContext();

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeContextProvider');
    }
    return context;
};

export const ThemeContextProvider = ({ children }) => {
    // Default to 'sophisticatedNavy' or load from localStorage
    const [currentGradient, setCurrentGradient] = useState(() => {
        const saved = localStorage.getItem('wealthwise-theme-gradient');
        return saved && gradients[saved] ? saved : 'sophisticatedNavy';
    });

    const setGradient = (gradientKey) => {
        if (gradients[gradientKey]) {
            setCurrentGradient(gradientKey);
            localStorage.setItem('wealthwise-theme-gradient', gradientKey);
        }
    };

    return (
        <ThemeContext.Provider value={{ currentGradient, setGradient }}>
            {children}
        </ThemeContext.Provider>
    );
};
