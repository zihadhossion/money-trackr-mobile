import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, Colors } from '../theme/colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  colors: Colors;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
});

const THEME_STORAGE_KEY = 'theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const system = Appearance.getColorScheme();
    return system === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark') {
        setThemeState(stored);
      }
    });

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
        if (!stored) {
          setThemeState(colorScheme === 'dark' ? 'dark' : 'light');
        }
      });
    });

    return () => subscription.remove();
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: theme === 'dark' ? darkColors : lightColors,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
