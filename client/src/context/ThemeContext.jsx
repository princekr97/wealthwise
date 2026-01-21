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
    const [mode, setMode] = useState(() => {
        const saved = localStorage.getItem('wealthwise-theme-mode');
        return saved || 'dark';
    });

    const [currentGradient, setCurrentGradient] = useState(() => {
        const saved = localStorage.getItem('wealthwise-theme-gradient');
        return saved && gradients[saved] ? saved : 'emeraldFinance';
    });

    const toggleMode = () => {
        const newMode = mode === 'dark' ? 'light' : 'dark';
        setMode(newMode);
        localStorage.setItem('wealthwise-theme-mode', newMode);
        document.documentElement.setAttribute('data-theme', newMode);
    };

    const setGradient = (gradientKey) => {
        if (gradients[gradientKey]) {
            setCurrentGradient(gradientKey);
            localStorage.setItem('wealthwise-theme-gradient', gradientKey);
            const gradientValue = gradients[gradientKey].gradient;
            document.documentElement.style.setProperty('--active-gradient', gradientValue);
        }
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        if (gradients[currentGradient]) {
            const gradientValue = gradients[currentGradient].gradient;
            document.documentElement.style.setProperty('--active-gradient', gradientValue);
        }
    }, [currentGradient, mode]);

    return (
        <ThemeContext.Provider value={{ currentGradient, setGradient, mode, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
