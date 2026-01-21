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
    // Default to 'emeraldFinance' or load from localStorage
    const [currentGradient, setCurrentGradient] = useState(() => {
        const saved = localStorage.getItem('wealthwise-theme-gradient');
        return saved && gradients[saved] ? saved : 'emeraldFinance';
    });

    const setGradient = (gradientKey) => {
        console.log('🎨 Setting gradient:', gradientKey, gradients[gradientKey]);
        if (gradients[gradientKey]) {
            setCurrentGradient(gradientKey);
            localStorage.setItem('wealthwise-theme-gradient', gradientKey);
            // Force immediate CSS variable update
            const gradientValue = gradients[gradientKey].gradient;
            document.documentElement.style.setProperty('--active-gradient', gradientValue);
            console.log('✅ CSS variable set:', gradientValue);
        } else {
            console.error('❌ Gradient not found:', gradientKey);
        }
    };

    // Apply gradient on mount
    useEffect(() => {
        console.log('🔄 Applying gradient on mount/change:', currentGradient);
        if (gradients[currentGradient]) {
            const gradientValue = gradients[currentGradient].gradient;
            document.documentElement.style.setProperty('--active-gradient', gradientValue);
            console.log('✅ Initial gradient applied:', gradientValue);
        }
    }, [currentGradient]);

    return (
        <ThemeContext.Provider value={{ currentGradient, setGradient }}>
            {children}
        </ThemeContext.Provider>
    );
};
