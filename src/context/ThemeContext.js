// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 👇 default: light
  const [theme, setTheme] = useState('light'); // 'light' | 'dark'

  const isDark = theme === 'dark';

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    // Optional: persist in localStorage
    localStorage.setItem('tt-theme', theme);
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem('tt-theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
