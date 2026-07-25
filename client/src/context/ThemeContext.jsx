import { createContext, useContext, useMemo } from 'react';

/**
 * Theme context. Dark mode is the only theme per docs/UI_STYLE.md.
 * Kept as context so a future light-mode toggle can be added without
 * touching consumers.
 */
const ThemeContext = createContext({ theme: 'dark' });

export function ThemeProvider({ children }) {
  const value = useMemo(() => ({ theme: 'dark' }), []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
