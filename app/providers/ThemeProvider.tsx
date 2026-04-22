'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Admin uses a fixed light theme; the public site can still honor saved preference.
    const savedTheme = localStorage.getItem('admin-theme') as Theme | null;
    const initialTheme = isAdminRoute ? 'light' : (savedTheme || 'dark');
    setTheme(initialTheme);
    localStorage.setItem('admin-theme', initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, [isAdminRoute]);

  const toggleTheme = () => {
    if (isAdminRoute) return;

    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const effectiveTheme = isAdminRoute ? 'light' : theme;

  return (
    <ThemeContext.Provider value={{ theme: effectiveTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
