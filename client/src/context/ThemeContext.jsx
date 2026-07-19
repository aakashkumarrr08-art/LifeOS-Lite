import { createContext, useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'lifeos_lite_theme';

const ThemeContext = createContext(null);

const resolveInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(resolveInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode: theme === 'dark',
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeContext, THEME_STORAGE_KEY, ThemeProvider };

