import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(() => {
    return localStorage.getItem('gcircle_theme_mode') || 'light';
  });

  const [themeIntensity, setThemeIntensityState] = useState(() => {
    return localStorage.getItem('gcircle_theme_intensity') || 'classic';
  });

  useEffect(() => {
    const root = document.documentElement;

    let effectiveMode = themeMode;
    if (themeMode === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveMode = prefersDark ? 'dark' : 'light';
    }

    root.setAttribute('data-theme', effectiveMode);
    root.setAttribute('data-intensity', themeIntensity);

    localStorage.setItem('gcircle_theme_mode', themeMode);
    localStorage.setItem('gcircle_theme_intensity', themeIntensity);
  }, [themeMode, themeIntensity]);

  // Listen for system appearance changes if mode is 'system'
  useEffect(() => {
    if (themeMode !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode]);

  const setThemeMode = (mode) => {
    setThemeModeState(mode);
  };

  const setThemeIntensity = (intensity) => {
    setThemeIntensityState(intensity);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        themeIntensity,
        setThemeMode,
        setThemeIntensity,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
