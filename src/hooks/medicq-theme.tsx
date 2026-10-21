import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { palette, type AppColors } from '../constants/colors';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  colors: AppColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  /** Ganti berikutnya: system → light → dark → system */
  cycleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const colors = isDark ? palette.dark : palette.light;

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      mode,
      isDark,
      setMode,
      cycleMode: () => {
        setMode((prev) => (prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system'));
      },
    }),
    [colors, mode, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme harus dipakai di dalam ThemeProvider');
  return ctx;
}

/** Warna aktif sesuai mode tema (system/light/dark). */
export function useColors(): AppColors {
  return useTheme().colors;
}
