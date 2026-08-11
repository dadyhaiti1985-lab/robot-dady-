import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'app_theme';
const DAY_START_HOUR = 7;
const NIGHT_START_HOUR = 19;
const VALID_THEME_MODES = new Set(['dark', 'light', 'auto']);

const ThemeContext = createContext(null);

function sanitizeThemeMode(themeMode) {
  return VALID_THEME_MODES.has(themeMode) ? themeMode : 'dark';
}

function getStoredThemeMode() {
  if (typeof window === 'undefined') return 'dark';
  return sanitizeThemeMode(window.localStorage.getItem(STORAGE_KEY));
}

function resolveTheme(themeMode) {
  const safeThemeMode = sanitizeThemeMode(themeMode);
  if (safeThemeMode === 'dark' || safeThemeMode === 'light') {
    return safeThemeMode;
  }

  const currentHour = new Date().getHours();
  const isNightTime = currentHour >= NIGHT_START_HOUR || currentHour < DAY_START_HOUR;
  return isNightTime ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(getStoredThemeMode);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(getStoredThemeMode()));

  const applyTheme = useCallback((nextThemeMode) => {
    const safeThemeMode = sanitizeThemeMode(nextThemeMode);
    const nextResolvedTheme = resolveTheme(safeThemeMode);
    const root = document.documentElement;

    root.classList.toggle('dark', nextResolvedTheme === 'dark');
    root.classList.toggle('light', nextResolvedTheme === 'light');

    window.localStorage.setItem(STORAGE_KEY, safeThemeMode);
    setResolvedTheme(nextResolvedTheme);
  }, []);

  const setThemeMode = useCallback((nextThemeMode) => {
    setThemeModeState(sanitizeThemeMode(nextThemeMode));
  }, []);

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode, applyTheme]);

  useEffect(() => {
    if (themeMode !== 'auto') return undefined;

    const syncAutoTheme = () => applyTheme('auto');
    syncAutoTheme();

    const intervalId = window.setInterval(syncAutoTheme, 60 * 1000);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => syncAutoTheme();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleMediaChange);
    } else if (typeof media.addListener === 'function') {
      media.addListener(handleMediaChange);
    }

    return () => {
      window.clearInterval(intervalId);
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', handleMediaChange);
      } else if (typeof media.removeListener === 'function') {
        media.removeListener(handleMediaChange);
      }
    };
  }, [themeMode, applyTheme]);

  const contextValue = useMemo(() => ({
    themeMode,
    resolvedTheme,
    setThemeMode,
  }), [themeMode, resolvedTheme, setThemeMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemePreference must be used within ThemeProvider');
  }
  return context;
}
