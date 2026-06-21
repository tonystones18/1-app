'use client';
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline, alpha } from '@mui/material';

export const COLOR_PRESETS = [
  { name: 'Blue',   value: '#3b82f6' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Cyan',   value: '#0891b2' },
  { name: 'Green',  value: '#16a34a' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Rose',   value: '#e11d48' },
];

function buildTheme(mode: 'light' | 'dark', primaryColor: string) {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: primaryColor },
      secondary: { main: '#7C3AED' },
      success:   { main: '#16A34A' },
      warning:   { main: '#D97706' },
      error:     { main: '#DC2626' },
      background: isDark
        ? { default: '#0f172a', paper: '#1e293b' }
        : { default: '#f5f7fb', paper: '#ffffff' },
      text: isDark
        ? { primary: '#f1f5f9', secondary: '#94a3b8', disabled: '#475569' }
        : { primary: '#0f172a', secondary: '#64748b', disabled: '#94a3b8' },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { scrollbarWidth: 'thin' },
        },
      },
      MuiButton: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 500, borderRadius: 8 } },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark
              ? '0 1px 3px 0 rgba(0,0,0,0.4)'
              : '0 1px 3px 0 rgba(0,0,0,0.08)',
          },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#f1f5f9' : '#0f172a',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: { paper: { backgroundImage: 'none' } },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: isDark ? '#1e293b' : '#f8fafc',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isDark ? '#94a3b8' : '#64748b',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: alpha(primaryColor, 0.1),
              color: primaryColor,
              '&:hover': { backgroundColor: alpha(primaryColor, 0.15) },
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: { root: { fontSize: '0.875rem' } },
      },
    },
  });
}

interface ThemeContextValue {
  mode: 'light' | 'dark';
  toggleMode: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  toggleMode: () => {},
  primaryColor: '#3b82f6',
  setPrimaryColor: () => {},
});

export function useThemeMode() {
  return useContext(ThemeContext);
}

export function MuiThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  const [primaryColor, setPrimaryColorState] = React.useState('#3b82f6');

  React.useEffect(() => {
    const savedMode  = localStorage.getItem('vs-theme-mode');
    const savedColor = localStorage.getItem('vs-theme-color');
    if (savedMode  === 'dark' || savedMode  === 'light') setMode(savedMode);
    if (savedColor) setPrimaryColorState(savedColor);
  }, []);

  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('vs-theme-mode', next);
    setMode(next);
  };

  const setPrimaryColor = (color: string) => {
    localStorage.setItem('vs-theme-color', color);
    setPrimaryColorState(color);
  };

  const theme = useMemo(() => buildTheme(mode, primaryColor), [mode, primaryColor]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, primaryColor, setPrimaryColor }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
