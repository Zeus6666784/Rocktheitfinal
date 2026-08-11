import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

/**
 * Theme context. Light/Dark switcher with localStorage persistence.
 * Default: 'dark' (current product). Falls back to 'dark' if localStorage
 * is unavailable. Switching sets `data-theme` on <html> so CSS variables
 * can drive the look.
 */
const STORAGE_KEY = 'learnify.theme';
const DEFAULT_THEME = 'dark';
const VALID = new Set(['light', 'dark']);

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  toggleTheme: () => {},
});

function readStoredTheme() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return VALID.has(raw) ? raw : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function writeStoredTheme(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore - private mode or quota */
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  // ponytail: drive the data-theme attribute on the root so CSS can
  // switch variables without us threading props through every component.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    const safe = VALID.has(next) ? next : DEFAULT_THEME;
    setThemeState(safe);
    writeStoredTheme(safe);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
