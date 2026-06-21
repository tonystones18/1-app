'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { deepmerge } from '@mui/utils';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3b82f6', light: '#60A5FA', dark: '#1d4ed8' },
    secondary: { main: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
    success: { main: '#16A34A', light: '#4ADE80', dark: '#15803D' },
    warning: { main: '#D97706', light: '#FCD34D', dark: '#B45309' },
    error: { main: '#DC2626', light: '#F87171', dark: '#B91C1C' },
    background: { default: '#f5f7fb', paper: '#FFFFFF' },
    grey: {
      50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1',
      400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155',
      800: '#1E293B', 900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F8FAFC',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#64748B',
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#F8FAFC',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#64748B',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundImage: 'none' },
      },
    },
  },
});

const darkTheme = createTheme(deepmerge(lightTheme, {
  palette: {
    mode: 'dark',
    background: { default: '#0F172A', paper: '#1E293B' },
    primary: { main: '#60A5FA' },
  },
}));

interface ThemeContextValue {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ mode: 'light', toggleMode: () => {} });

export function useThemeMode() {
  return useContext(ThemeContext);
}

export function MuiThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  // Persist dark mode preference
  React.useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('vs-theme-mode') : null;
    if (saved === 'dark' || saved === 'light') setMode(saved);
  }, []);

  const theme = mode === 'light' ? lightTheme : darkTheme;

  const toggleMode = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('vs-theme-mode', next);
    setMode(next);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
