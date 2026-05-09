import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

export type Theme = 'tactical';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('tactical');

  useEffect(() => {
    localStorage.setItem('app-theme', theme);

    // Apply tactical dark palette via CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--color-bg-primary', '#0a0f0a');
    root.style.setProperty('--color-bg-neutral', '#0a0f0a');
    root.style.setProperty('--color-accent-primary', '#7fb069');
    root.style.setProperty('--color-accent-secondary', '#6a9a56');
    root.style.setProperty('--color-highlight', '#a6c36f');
    root.style.setProperty('--color-text-light', '#e8ede4');
    root.style.setProperty('--color-text-dark', '#e8ede4');

    document.body.className = 'theme-tactical';
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}