/**
 * ThemeProvider — runtime theme switching for PR-16.
 *
 * Components consume theme via useTheme() hook:
 *   const { palette, theme, setTheme } = useTheme();
 *
 * For backwards compat the default export `C` from tokens.ts still resolves
 * to the light palette — components that import `C` directly continue working.
 * Only screens that need dark mode should adopt useTheme().
 */

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, type Palette, type ThemeName } from './tokens';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeCtx = {
  palette: Palette;
  theme: ThemeName;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const value = useMemo<ThemeCtx>(() => {
    const theme: ThemeName =
      mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
    return {
      palette: palettes[theme],
      theme,
      mode,
      setMode,
    };
  }, [mode, system]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Allow components to be used outside the provider (tests, storybook).
    // Default to light without breaking.
    return {
      palette: palettes.light,
      theme: 'light',
      mode: 'system',
      setMode: () => undefined,
    };
  }
  return v;
}
