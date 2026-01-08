import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'nova-admin-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return (stored as Theme) || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'dark' || (theme === 'system' && systemDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return { theme, setTheme };
}
