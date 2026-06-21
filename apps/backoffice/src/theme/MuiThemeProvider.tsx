'use client';
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline, alpha } from '@mui/material';

export const COLOR_PRESETS = [
  { name: 'Blue',   value: '#3b82f6' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Green',  value: '#16a34a' },
  { name: 'Cyan',   value: '#0891b2' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Pink',   value: '#ec4899' },
];

export interface UISettings {
  themeStyle: 'light' | 'dark' | 'system';
  menuLayout: 'vertical' | 'horizontal' | 'mixed' | 'dual';
  menuStyle: 'light' | 'dark' | 'mixed';
  boxStyle: 'border' | 'shadow';
  containerWidth: 'full' | 'boxed';
  showSidebarBtn: boolean;
  showFastEnter: boolean;
  showReloadBtn: boolean;
  showBreadcrumbs: boolean;
  showMultilingual: boolean;
  showWorkTab: boolean;
  showTopProgressBar: boolean;
  colorWeakMode: boolean;
  globalWatermark: boolean;
  sidebarAccordion: boolean;
  menuWidth: number;
  tabStyle: string;
  pageAnimation: string;
  borderRadius: number;
}

export const DEFAULT_UI_SETTINGS: UISettings = {
  themeStyle: 'light',
  menuLayout: 'vertical',
  menuStyle: 'dark',
  boxStyle: 'shadow',
  containerWidth: 'full',
  showSidebarBtn: true,
  showFastEnter: true,
  showReloadBtn: true,
  showBreadcrumbs: true,
  showMultilingual: true,
  showWorkTab: false,
  showTopProgressBar: true,
  colorWeakMode: false,
  globalWatermark: false,
  sidebarAccordion: true,
  menuWidth: 240,
  tabStyle: 'Default',
  pageAnimation: 'Slide Left',
  borderRadius: 1.0,
};

function buildTheme(mode: 'light' | 'dark', primaryColor: string, borderRadius: number, colorWeakMode: boolean, boxStyle: 'border' | 'shadow' = 'shadow') {
  const isDark = mode === 'dark';
  const r = Math.max(0, borderRadius);
  const isBorder = boxStyle === 'border';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
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
    shape: { borderRadius: Math.round(8 * r) },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            filter: colorWeakMode ? 'grayscale(100%)' : 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 500, borderRadius: Math.round(8 * r) } },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: Math.round(12 * r),
            boxShadow: isBorder ? 'none' : (isDark ? '0 1px 3px 0 rgba(0,0,0,0.4)' : '0 1px 3px 0 rgba(0,0,0,0.08)'),
            border: isBorder ? `1px solid ${dividerColor}` : 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(isBorder && { boxShadow: 'none', border: `1px solid ${dividerColor}` }),
          },
          elevation1: isBorder ? { boxShadow: 'none', border: `1px solid ${dividerColor}` } : {},
          elevation2: isBorder ? { boxShadow: 'none', border: `1px solid ${dividerColor}` } : {},
          elevation3: isBorder ? { boxShadow: 'none', border: `1px solid ${dividerColor}` } : {},
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
  settings: UISettings;
  updateSetting: <K extends keyof UISettings>(key: K, value: UISettings[K]) => void;
  resetSettings: () => void;
  copyConfig: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  toggleMode: () => {},
  primaryColor: '#3b82f6',
  setPrimaryColor: () => {},
  settings: DEFAULT_UI_SETTINGS,
  updateSetting: () => {},
  resetSettings: () => {},
  copyConfig: () => {},
});

export function useThemeMode() {
  return useContext(ThemeContext);
}

export function MuiThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryColorState] = React.useState('#3b82f6');
  const [settings, setSettings] = React.useState<UISettings>(DEFAULT_UI_SETTINGS);
  const [systemDark, setSystemDark] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  React.useEffect(() => {
    const savedColor    = localStorage.getItem('vs-theme-color');
    const savedSettings = localStorage.getItem('vs-ui-settings');
    if (savedColor) setPrimaryColorState(savedColor);
    if (savedSettings) {
      try { setSettings({ ...DEFAULT_UI_SETTINGS, ...JSON.parse(savedSettings) }); } catch { /* ignore */ }
    }
  }, []);

  const updateSetting = <K extends keyof UISettings>(key: K, value: UISettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('vs-ui-settings', JSON.stringify(next));
      return next;
    });
  };

  const resolvedMode: 'light' | 'dark' =
    settings.themeStyle === 'system' ? (systemDark ? 'dark' : 'light') : settings.themeStyle;
  const mode = resolvedMode;

  const toggleMode = () => updateSetting('themeStyle', resolvedMode === 'light' ? 'dark' : 'light');

  const setPrimaryColor = (color: string) => {
    localStorage.setItem('vs-theme-color', color);
    setPrimaryColorState(color);
  };

  const resetSettings = () => {
    localStorage.removeItem('vs-ui-settings');
    localStorage.removeItem('vs-theme-color');
    setSettings(DEFAULT_UI_SETTINGS);
    setPrimaryColorState('#3b82f6');
  };

  const copyConfig = () => {
    const config = { mode, primaryColor, ...settings };
    navigator.clipboard?.writeText(JSON.stringify(config, null, 2));
  };

  const theme = useMemo(
    () => buildTheme(mode, primaryColor, settings.borderRadius, settings.colorWeakMode, settings.boxStyle),
    [mode, primaryColor, settings.borderRadius, settings.colorWeakMode, settings.boxStyle],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, primaryColor, setPrimaryColor, settings, updateSetting, resetSettings, copyConfig }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
