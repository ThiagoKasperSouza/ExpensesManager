import React, { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

type ThemeColors = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
};

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const palettes: Record<ThemeMode, ThemeColors> = {
  light: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#171717',
    muted: '#6B7280',
    border: '#E5E7EB',
    primary: '#007AFF',
  },
  dark: {
    background: '#111318',
    surface: '#1C1F26',
    text: '#F5F5F5',
    muted: '#A1A1AA',
    border: '#343842',
    primary: '#66A9FF',
  },
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemColorScheme ?? 'light');

  const value = useMemo(
    () => ({
      mode,
      colors: palettes[mode],
      toggleTheme: () =>
        setMode(currentMode => (currentMode === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }

  return context;
}
