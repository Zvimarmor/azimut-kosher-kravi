import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

export type Theme = 'default' | 'ranger-green';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('app-theme');
    return (stored as Theme) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);

    // Update CSS variables based on theme
    const root = document.documentElement;

    if (theme === 'ranger-green') {
      // Ranger Green (Dark) Theme
      root.style.setProperty('--color-bg-primary', '#1a1f16');
      root.style.setProperty('--color-bg-neutral', '#242b20');
      root.style.setProperty('--color-accent-primary', '#4b5d3f');
      root.style.setProperty('--color-accent-secondary', '#5a6b4e');
      root.style.setProperty('--color-highlight', '#7fb069');
      root.style.setProperty('--color-text-light', '#f1f5f9');
      root.style.setProperty('--color-text-dark', '#1a1f16');
    } else {
      // Default (Original) Theme
      root.style.setProperty('--color-bg-primary', '#000000');
      root.style.setProperty('--color-bg-neutral', '#F5F5DC');
      root.style.setProperty('--color-accent-primary', '#4B5320');
      root.style.setProperty('--color-accent-secondary', '#6B8E23');
      root.style.setProperty('--color-highlight', '#A6C36F');
      root.style.setProperty('--color-text-light', '#F8F8F8');
      root.style.setProperty('--color-text-dark', '#4B5320');
    }

    // Update body class for theme-specific styles
    document.body.className = document.body.className.replace(/theme-\w+/, '');
    document.body.classList.add(`theme-${theme}`);
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