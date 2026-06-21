'use client';
import React, { useState, useCallback } from 'react';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Tooltip, Badge, InputBase,
  Popover, List, ListItem, ListItemText, ListItemIcon, Divider, Avatar,
  Breadcrumbs, Link as MuiLink, Chip, Switch, Select, MenuItem, Button, LinearProgress,
} from '@mui/material';
import {
  Search, Notifications, LightMode, DarkMode, Tune,
  CreditCard, Shield, TrendingUp, Warning, CheckCircle,
  Menu, Refresh, Apps, Fullscreen, FullscreenExit, Translate, Close,
  Add, Remove, SmartToy,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, navItems } from './Sidebar';
import { useThemeMode, COLOR_PRESETS } from '@/theme/MuiThemeProvider';
import { useAuthStore } from '@/lib/store/auth.store';

const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'zh', label: 'Chinese',    flag: '🇨🇳' },
  { code: 'de', label: 'German',     flag: '🇩🇪' },
  { code: 'fr', label: 'French',     flag: '🇫🇷' },
  { code: 'es', label: 'Spanish',    flag: '🇪🇸' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', label: 'Russian',    flag: '🇷🇺' },
  { code: 'tr', label: 'Turkish',    flag: '🇹🇷' },
  { code: 'he', label: 'Hebrew',     flag: '🇮🇱' },
  { code: 'ar', label: 'Arabic',     flag: '🇸🇦' },
] as const;

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/aggregator/providers': 'Providers',
  '/aggregator/vendors': 'Vendors',
  '/aggregator/games': 'Games',
  '/aggregator/operators': 'Operators',
  '/aggregator/agents': 'Agents',
  '/aggregator/routes': 'Route Center',
  '/aggregator/settlements': 'Settlements',
  '/b2c/players': 'Players',
  '/b2c/wallets': 'Wallets & Ledger',
  '/b2c/payments': 'Payments',
  '/b2c/bonuses': 'Bonuses',
  '/b2c/vip': 'VIP Management',
  '/b2c/compliance': 'Compliance & KYC',
  '/b2b/white-labels': 'White Labels',
  '/b2b/crm': 'Operator CRM',
  '/b2b/invoices': 'Invoices',
  '/b2b/affiliates': 'Affiliates',
  '/media': 'Media Center',
  '/ai': 'AI Copilot',
  '/analytics/reports': 'Reports',
  '/analytics/kpis': 'KPI Dashboard',
  '/platform/audit': 'Audit Log',
  '/platform/settings': 'Settings',
  '/profile': 'My Profile',
  '/calendar': 'Calendar',
  '/kanban': 'Kanban Board',
};

const SECTION_MAP: Record<string, string> = {
  aggregator: 'Aggregator',
  b2c: 'Player Ops',
  b2b: 'B2B Operations',
  media: 'Media & AI',
  ai: 'Media & AI',
  analytics: 'Analytics',
  platform: 'Platform',
  profile: 'Account',
  calendar: 'Workspace',
  kanban: 'Workspace',
};

const NOTIFICATIONS = [
  { id: 1, icon: <Warning color="error" fontSize="small" />, title: 'AML Alert — Player #2085', sub: '41 minutes ago', unread: true },
  { id: 2, icon: <Shield color="warning" fontSize="small" />, title: '37 KYC cases pending review', sub: '2 hours ago', unread: true },
  { id: 3, icon: <CreditCard color="info" fontSize="small" />, title: 'Withdrawal $1,200 needs approval', sub: '3 hours ago', unread: true },
  { id: 4, icon: <TrendingUp color="success" fontSize="small" />, title: 'Revenue target 80% reached', sub: 'Yesterday', unread: false },
  { id: 5, icon: <CheckCircle color="success" fontSize="small" />, title: 'Provider Evolution health: OK', sub: 'Yesterday', unread: false },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="caption"
      sx={{ fontWeight: 600, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1.5 }}
    >
      {children}
    </Typography>
  );
}

function SettingRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{label}</Typography>
      <Switch size="small" checked={value} onChange={(_, v) => onChange(v)} />
    </Box>
  );
}

function LayoutThumb({ type, label, selected, onClick }: { type: string; label: string; selected: boolean; onClick: () => void }) {
  const bc = selected ? 'primary.main' : 'divider';
  const ab = selected ? 'primary.light' : 'action.selected';
  const cb = 'action.hover';
  return (
    <Box sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={onClick}>
      <Box sx={{
        width: 64, height: 48, border: '2px solid', borderColor: bc, borderRadius: 1.5,
        overflow: 'hidden', position: 'relative', mb: 0.75, display: 'flex',
        transition: 'border-color 0.15s', '&:hover': { borderColor: 'primary.main' },
        ...(type === 'horizontal' || type === 'mixed' ? { flexDirection: 'column' } : {}),
      }}>
        {type === 'vertical' && <>
          <Box sx={{ width: '35%', bgcolor: ab }} />
          <Box sx={{ flex: 1, p: '4px 3px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {[0,1,2].map(i => <Box key={i} sx={{ height: 3, bgcolor: cb, borderRadius: 0.5 }} />)}
          </Box>
        </>}
        {type === 'horizontal' && <>
          <Box sx={{ height: '30%', bgcolor: ab }} />
          <Box sx={{ flex: 1, p: '3px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {[0,1].map(i => <Box key={i} sx={{ height: 3, bgcolor: cb, borderRadius: 0.5 }} />)}
          </Box>
        </>}
        {type === 'mixed' && <>
          <Box sx={{ height: '26%', bgcolor: ab }} />
          <Box sx={{ flex: 1, display: 'flex' }}>
            <Box sx={{ width: '30%', bgcolor: ab, opacity: 0.65 }} />
            <Box sx={{ flex: 1, p: '3px 2px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {[0,1].map(i => <Box key={i} sx={{ height: 3, bgcolor: cb, borderRadius: 0.5 }} />)}
            </Box>
          </Box>
        </>}
        {type === 'dual' && <>
          <Box sx={{ width: '22%', bgcolor: ab }} />
          <Box sx={{ width: '28%', bgcolor: ab, opacity: 0.6 }} />
          <Box sx={{ flex: 1, p: '4px 3px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {[0,1,2].map(i => <Box key={i} sx={{ height: 3, bgcolor: cb, borderRadius: 0.5 }} />)}
          </Box>
        </>}
        {selected && (
          <Box sx={{ position: 'absolute', bottom: 3, right: 3, width: 14, height: 14,
            bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: 5, height: 3.5, borderLeft: '1.5px solid white', borderBottom: '1.5px solid white', transform: 'rotate(-45deg)', mt: '-1px' }} />
          </Box>
        )}
      </Box>
      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: selected ? 'primary.main' : 'text.secondary', fontWeight: selected ? 600 : 400 }}>
        {label}
      </Typography>
    </Box>
  );
}

function StyleThumb({ type, label, selected, onClick }: { type: string; label: string; selected: boolean; onClick: () => void }) {
  const bc = selected ? 'primary.main' : 'divider';
  const sidebarBg = type === 'light' ? '#f1f5f9' : type === 'dark' ? '#1e293b' : '#64748b';
  return (
    <Box sx={{ flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={onClick}>
      <Box sx={{
        height: 48, border: '2px solid', borderColor: bc, borderRadius: 1.5,
        overflow: 'hidden', position: 'relative', mb: 0.75, display: 'flex',
        transition: 'border-color 0.15s', '&:hover': { borderColor: 'primary.main' },
      }}>
        <Box sx={{ width: '35%', bgcolor: sidebarBg }} />
        <Box sx={{ flex: 1, p: '4px 3px', display: 'flex', flexDirection: 'column', gap: '3px', bgcolor: 'background.paper' }}>
          {[0,1,2].map(i => <Box key={i} sx={{ height: 3, bgcolor: 'action.hover', borderRadius: 0.5 }} />)}
        </Box>
        {selected && (
          <Box sx={{ position: 'absolute', bottom: 3, right: 3, width: 14, height: 14,
            bgcolor: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: 5, height: 3.5, borderLeft: '1.5px solid white', borderBottom: '1.5px solid white', transform: 'rotate(-45deg)', mt: '-1px' }} />
          </Box>
        )}
      </Box>
      <Typography variant="caption" sx={{ fontSize: '0.7rem', color: selected ? 'primary.main' : 'text.secondary', fontWeight: selected ? 600 : 400 }}>
        {label}
      </Typography>
    </Box>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<HTMLButtonElement | null>(null);
  const [langAnchor, setLangAnchor] = useState<HTMLButtonElement | null>(null);
  const [activeLang, setActiveLang] = useState<typeof LANGUAGES[number]>(LANGUAGES[0]);
  const [fullscreen, setFullscreen] = useState(false);
  const [themeDrawer, setThemeDrawer] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggleMode, primaryColor, setPrimaryColor, settings, updateSetting, resetSettings, copyConfig } = useThemeMode();
  const { showSidebarBtn, showFastEnter, showReloadBtn, showBreadcrumbs, showMultilingual, globalWatermark } = settings;
  const { menuLayout, menuStyle, menuWidth, containerWidth, showWorkTab, showTopProgressBar, sidebarAccordion } = settings;

  // Work Tab: track visited pages
  const [workTabs, setWorkTabs] = React.useState<Array<{ href: string; label: string }>>([]);
  React.useEffect(() => {
    if (!showWorkTab) return;
    const title = PAGE_TITLES[pathname] ?? pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'Page';
    const label = title.charAt(0).toUpperCase() + title.slice(1);
    setWorkTabs((prev) => {
      if (prev.some((t) => t.href === pathname)) return prev;
      return [...prev, { href: pathname, label }].slice(-10);
    });
  }, [pathname, showWorkTab]);
  const closeTab = (href: string) => {
    setWorkTabs((prev) => prev.filter((t) => t.href !== href));
  };
  const { user } = useAuthStore();

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    const label = PAGE_TITLES[href] ?? SECTION_MAP[seg] ?? (seg.charAt(0).toUpperCase() + seg.slice(1));
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  // For mixed layout: track selected section (persists across pages)
  const firstSectionWithChildren = navItems.find((i) => !!i.children);
  const urlSection = navItems.find((item) => item.children?.some((c) => c.href && (pathname === c.href || pathname.startsWith(c.href + '/'))));
  const [mixedSelectedSection, setMixedSelectedSection] = React.useState(urlSection ?? firstSectionWithChildren ?? null);
  // Auto-update selected section when navigating to a URL that matches a section
  React.useEffect(() => {
    const matched = navItems.find((item) => item.children?.some((c) => c.href && (pathname === c.href || pathname.startsWith(c.href + '/'))));
    if (matched) setMixedSelectedSection(matched);
  }, [pathname]);

  // Horizontal nav items (top-level sections for horizontal/mixed layouts)
  const isHorizontal = menuLayout === 'horizontal';
  const isMixedLayout = menuLayout === 'mixed';
  const showSidebar = !isHorizontal;

  // activeSectionItem: used for sidebar children display
  const activeSectionItem = isMixedLayout ? mixedSelectedSection : null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', flexDirection: isHorizontal ? 'column' : 'row' }}>
      {/* Global watermark */}
      {globalWatermark && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 9990, pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute', fontSize: '0.9rem', fontWeight: 700, opacity: 0.06,
                color: 'text.primary', transform: 'rotate(-30deg)',
                left: `${(i % 4) * 27 - 5}%`, top: `${Math.floor(i / 4) * 36 + 5}%`,
                whiteSpace: 'nowrap', userSelect: 'none',
              }}
            >
              VisioneSoft Admin
            </Box>
          ))}
        </Box>
      )}
      {showSidebar && (
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          menuStyle={menuStyle}
          menuLayout={menuLayout}
          menuWidth={menuWidth}
          activeSectionChildren={activeSectionItem?.children}
          activeSectionLabel={activeSectionItem?.label}
          sidebarAccordion={sidebarAccordion}
        />
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* ── Top progress bar ── */}
        {showTopProgressBar && (
          <LinearProgress
            variant="determinate"
            value={100}
            sx={{ height: 3, position: 'sticky', top: 0, zIndex: (theme) => theme.zIndex.drawer + 3, '& .MuiLinearProgress-bar': { transition: 'none' } }}
          />
        )}

        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', color: 'text.primary', zIndex: (theme) => theme.zIndex.drawer + 2 }}
        >
          <Toolbar sx={{ gap: 0.75, minHeight: '56px !important', px: { xs: 1.5, sm: 2 } }}>
            {/* ── Left: hamburger | refresh | apps | breadcrumbs ── */}
            {showSidebarBtn && (
              <Tooltip title="Toggle sidebar">
                <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ color: 'text.secondary' }}>
                  <Menu sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            )}

            {showReloadBtn && (
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={() => router.refresh()} sx={{ color: 'text.secondary' }}>
                  <Refresh sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

            {showFastEnter && (
              <Tooltip title="Dashboard">
                <IconButton size="small" component={Link} href="/dashboard" sx={{ color: 'text.secondary' }}>
                  <Apps sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Breadcrumbs */}
            {showBreadcrumbs && (
              <Breadcrumbs
                separator={<Box component="span" sx={{ color: 'text.disabled', mx: 0.25 }}>/</Box>}
                sx={{ ml: 0.5, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap', alignItems: 'center' } }}
              >
                <MuiLink
                  component={Link}
                  href="/dashboard"
                  underline="hover"
                  sx={{ fontSize: '0.8125rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  {breadcrumbs.length > 0 ? (SECTION_MAP[breadcrumbs[0]?.href.split('/')[1]] ?? 'Dashboard') : 'Dashboard'}
                </MuiLink>
                {breadcrumbs.map(({ href, label, isLast }) =>
                  isLast ? (
                    <Typography key={href} sx={{ fontSize: '0.8125rem', color: 'text.primary', fontWeight: 500 }}>
                      {label}
                    </Typography>
                  ) : null
                )}
              </Breadcrumbs>
            )}

            <Box sx={{ flex: 1 }} />

            {/* ── Right: search | fullscreen | bell | moon | gear | avatar ── */}

            {/* Search */}
            <Box sx={{
              display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.75,
              bgcolor: 'action.hover', borderRadius: 1.5, px: 1.5, py: 0.6,
              border: '1px solid', borderColor: 'divider', cursor: 'text',
              '&:focus-within': { borderColor: 'primary.main', bgcolor: 'background.paper' },
            }}>
              <Search sx={{ fontSize: 15, color: 'text.disabled' }} />
              <InputBase placeholder="Search  ⌘K" sx={{ fontSize: '0.8rem', minWidth: 140, '& input::placeholder': { color: 'text.disabled' } }} />
            </Box>

            {/* Fullscreen */}
            <Tooltip title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              <IconButton size="small" onClick={toggleFullscreen} sx={{ color: 'text.secondary' }}>
                {fullscreen ? <FullscreenExit sx={{ fontSize: 20 }} /> : <Fullscreen sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

            {/* Notifications Bell */}
            <Tooltip title="Notifications">
              <IconButton size="small" onClick={(e) => setNotifAnchor(e.currentTarget)}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notification panel */}
            <Popover
              open={Boolean(notifAnchor)}
              anchorEl={notifAnchor}
              onClose={() => setNotifAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 340, mt: 1, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid', borderColor: 'divider' } }}
            >
              <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notifications</Typography>
                <Chip label={`${unreadCount} new`} size="small" color="error" sx={{ height: 20, fontSize: '0.65rem' }} />
              </Box>
              <Divider />
              <List disablePadding dense>
                {NOTIFICATIONS.map((n, idx) => (
                  <React.Fragment key={n.id}>
                    <ListItem sx={{ py: 1.25, px: 2, bgcolor: n.unread ? 'action.hover' : 'transparent', cursor: 'pointer', '&:hover': { bgcolor: 'action.selected' } }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: 'action.hover' }}>{n.icon}</Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography component="span" variant="body2" sx={{ fontSize: '0.8rem', fontWeight: n.unread ? 600 : 400 }}>{n.title}</Typography>}
                        secondary={<Typography component="span" variant="caption" color="text.disabled">{n.sub}</Typography>}
                      />
                    </ListItem>
                    {idx < NOTIFICATIONS.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Divider />
              <Box sx={{ p: 1.5, textAlign: 'center' }}>
                <Typography variant="caption" color="primary.main" sx={{ cursor: 'pointer', fontWeight: 500 }}>
                  View all notifications
                </Typography>
              </Box>
            </Popover>

            {/* AI Copilot */}
            <Tooltip title="AI Copilot">
              <IconButton size="small" component={Link} href="/ai" sx={{ color: 'text.secondary' }}>
                <SmartToy sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Language picker (conditional) */}
            {showMultilingual && (
              <>
                <Tooltip title="Language">
                  <IconButton size="small" onClick={(e) => setLangAnchor(e.currentTarget)} sx={{ color: 'text.secondary', fontSize: '1.1rem', gap: 0.3 }}>
                    <Box component="span" sx={{ fontSize: '1.1rem', lineHeight: 1 }}>{activeLang.flag}</Box>
                  </IconButton>
                </Tooltip>
                <Popover
                  open={Boolean(langAnchor)}
                  anchorEl={langAnchor}
                  onClose={() => setLangAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid', borderColor: 'divider' } }}
                >
                  <Box sx={{ py: 0.75 }}>
                    {LANGUAGES.map((lang) => (
                      <Box
                        key={lang.code}
                        onClick={() => { setActiveLang(lang); setLangAnchor(null); }}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          px: 2, py: 0.85, cursor: 'pointer',
                          bgcolor: activeLang.code === lang.code ? 'primary.50' : 'transparent',
                          '&:hover': { bgcolor: 'action.hover' },
                          transition: 'background 0.15s',
                        }}
                      >
                        <Box component="span" sx={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>{lang.flag}</Box>
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: activeLang.code === lang.code ? 600 : 400, color: activeLang.code === lang.code ? 'primary.main' : 'text.primary' }}>
                          {lang.label}
                        </Typography>
                        {activeLang.code === lang.code && (
                          <Box sx={{ ml: 'auto', width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Popover>
              </>
            )}

            {/* Dark mode toggle */}
            <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
              <IconButton size="small" onClick={toggleMode} sx={{ color: 'text.secondary' }}>
                {mode === 'light' ? <DarkMode sx={{ fontSize: 20 }} /> : <LightMode sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

            {/* Theme settings (Art Pro style) */}
            <Tooltip title="Theme settings">
              <IconButton size="small" onClick={() => setThemeDrawer(true)} sx={{ color: 'text.secondary' }}>
                <Tune sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* User avatar */}
            <Tooltip title={user?.displayName ?? 'Profile'}>
              <Avatar
                component={Link}
                href="/profile"
                sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'none', ml: 0.5 }}
              >
                {user?.displayName?.[0]?.toUpperCase() ?? 'A'}
              </Avatar>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* ── Work Tab bar ── */}
        {showWorkTab && workTabs.length > 0 && (
          <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', px: 1, display: 'flex', alignItems: 'center', gap: 0.5, overflowX: 'auto', flexShrink: 0, minHeight: 36 }}>
            {workTabs.map((tab) => (
              <Box
                key={tab.href}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: 1,
                  cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none',
                  bgcolor: pathname === tab.href ? 'primary.50' : 'transparent',
                  border: '1px solid', borderColor: pathname === tab.href ? 'primary.200' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'all 0.15s',
                }}
                component={Link}
                href={tab.href}
              >
                <Typography variant="caption" sx={{ fontSize: '0.78rem', color: pathname === tab.href ? 'primary.main' : 'text.secondary', fontWeight: pathname === tab.href ? 600 : 400 }}>
                  {tab.label}
                </Typography>
                <IconButton size="small" sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: 'text.primary' } }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeTab(tab.href); }}>
                  <Close sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* ── Horizontal / Mixed nav bar (below AppBar) ── */}
        {(isHorizontal || isMixedLayout) && (
          <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', px: 2, overflowX: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 0.5, minHeight: 44, alignItems: 'center' }}>
              {navItems.map((item) => {
                const anyActive = item.children
                  ? item.children.some((c) => c.href && (pathname === c.href || pathname.startsWith(c.href + '/')))
                  : !!(item.href && (pathname === item.href || pathname.startsWith(item.href + '/')));
                const isThisSection = isMixedLayout
                  ? mixedSelectedSection?.label === item.label
                  : anyActive;
                return (
                  <Box
                    key={item.label}
                    component={item.href && !item.children ? Link : 'div'}
                    href={item.href && !item.children ? item.href : undefined}
                    onClick={() => {
                      if (item.children) {
                        if (isMixedLayout) setMixedSelectedSection(item);
                        if (item.children[0]?.href) router.push(item.children[0].href);
                      }
                    }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75,
                      borderRadius: 1.5, cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
                      color: (anyActive || isThisSection) ? 'primary.main' : 'text.secondary',
                      bgcolor: (anyActive || isThisSection) ? 'primary.50' : 'transparent',
                      borderBottom: (anyActive || isThisSection) ? '2px solid' : '2px solid transparent',
                      borderBottomColor: (anyActive || isThisSection) ? 'primary.main' : 'transparent',
                      borderRadius: 0, py: 1,
                      '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
                      transition: 'all 0.15s',
                    }}
                  >
                    <Box sx={{ '& svg': { fontSize: 16 }, display: 'flex', alignItems: 'center', color: 'inherit' }}>{item.icon}</Box>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: (anyActive || isThisSection) ? 600 : 400, color: 'inherit' }}>
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ── Theme Settings Panel (fixed overlay, no MUI Drawer) ── */}
        <Box
          sx={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 320,
            bgcolor: 'background.paper',
            borderLeft: '1px solid', borderColor: 'divider',
            boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column',
            zIndex: 1400,
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          style={{
            transform: themeDrawer ? 'translateX(0)' : 'translateX(100%)',
            pointerEvents: themeDrawer ? 'auto' : 'none',
          }}
        >
          {/* Panel header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.75, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Theme Settings</Typography>
            <IconButton size="small" onClick={() => setThemeDrawer(false)}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* Scrollable body */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2.5 }}>

            {/* ── SECTION 1: Theme Style ── */}
            <SectionLabel>Theme Style</SectionLabel>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              {([{ k: 'light', label: 'Light', icon: '☀️' }, { k: 'dark', label: 'Dark', icon: '🌙' }, { k: 'system', label: 'System', icon: '💻' }] as const).map(({ k, label, icon }) => (
                <Box
                  key={k}
                  onClick={() => updateSetting('themeStyle', k)}
                  sx={{
                    flex: 1, border: '2px solid', borderRadius: 2, p: 1.25, cursor: 'pointer', textAlign: 'center',
                    borderColor: settings.themeStyle === k ? 'primary.main' : 'divider',
                    bgcolor: settings.themeStyle === k ? 'primary.main' : 'transparent',
                    color: settings.themeStyle === k ? 'white' : 'text.secondary',
                    transition: 'all 0.15s', '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <Box sx={{ fontSize: 18, mb: 0.5 }}>{icon}</Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', color: 'inherit' }}>{label}</Typography>
                </Box>
              ))}
            </Box>

            {/* ── SECTION 2: Menu Layout ── */}
            <SectionLabel>Menu Layout</SectionLabel>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
              {([{ k: 'vertical', label: 'Vertical' }, { k: 'horizontal', label: 'Horizontal' }, { k: 'mixed', label: 'Mixed' }, { k: 'dual', label: 'Dual' }] as const).map(({ k, label }) => (
                <LayoutThumb key={k} type={k} label={label} selected={settings.menuLayout === k} onClick={() => updateSetting('menuLayout', k)} />
              ))}
            </Box>

            {/* ── SECTION 3: Menu Style ── */}
            <SectionLabel>Menu Style</SectionLabel>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              {([{ k: 'light', label: 'Light' }, { k: 'dark', label: 'Dark' }, { k: 'mixed', label: 'Mixed' }] as const).map(({ k, label }) => (
                <StyleThumb key={k} type={k} label={label} selected={settings.menuStyle === k} onClick={() => updateSetting('menuStyle', k)} />
              ))}
            </Box>

            {/* ── SECTION 4: Theme Color ── */}
            <SectionLabel>Theme Color</SectionLabel>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
              {COLOR_PRESETS.map((preset) => (
                <Tooltip key={preset.value} title={preset.name}>
                  <Box
                    onClick={() => setPrimaryColor(preset.value)}
                    sx={{
                      width: 32, height: 32, borderRadius: '50%', bgcolor: preset.value, cursor: 'pointer',
                      border: '3px solid',
                      borderColor: primaryColor === preset.value ? 'text.primary' : 'transparent',
                      boxShadow: primaryColor === preset.value ? '0 0 0 2px white inset' : 'none',
                      transition: 'transform 0.1s', '&:hover': { transform: 'scale(1.15)' },
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {primaryColor === preset.value && (
                      <Box sx={{ width: 8, height: 5, borderLeft: '2px solid white', borderBottom: '2px solid white', transform: 'rotate(-45deg)', mt: '-2px' }} />
                    )}
                  </Box>
                </Tooltip>
              ))}
            </Box>

            {/* ── SECTION 5: Box Style ── */}
            <SectionLabel>Box Style</SectionLabel>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              {([{ k: 'border', label: 'Border' }, { k: 'shadow', label: 'Shadow' }] as const).map(({ k, label }) => (
                <Box
                  key={k}
                  onClick={() => updateSetting('boxStyle', k)}
                  sx={{
                    flex: 1, py: 1.25, border: '2px solid', borderRadius: 2, textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                    borderColor: settings.boxStyle === k ? 'primary.main' : 'divider',
                    bgcolor: settings.boxStyle === k ? 'primary.main' : 'transparent',
                    color: settings.boxStyle === k ? 'white' : 'text.secondary',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'inherit' }}>{label}</Typography>
                </Box>
              ))}
            </Box>

            {/* ── SECTION 6: Container Width ── */}
            <SectionLabel>Container Width</SectionLabel>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              {([{ k: 'full', label: 'Full' }, { k: 'boxed', label: 'Boxed' }] as const).map(({ k, label }) => (
                <Box
                  key={k}
                  onClick={() => updateSetting('containerWidth', k)}
                  sx={{
                    flex: 1, py: 1.25, border: '2px solid', borderRadius: 2, textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                    borderColor: settings.containerWidth === k ? 'primary.main' : 'divider',
                    bgcolor: settings.containerWidth === k ? 'primary.main' : 'transparent',
                    color: settings.containerWidth === k ? 'white' : 'text.secondary',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'inherit' }}>{label}</Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {/* ── SECTION 7: Basic Config ── */}
            <SectionLabel>Basic Config</SectionLabel>
            <SettingRow label="Show work tab"               value={settings.showWorkTab}        onChange={(v) => updateSetting('showWorkTab', v)} />
            <SettingRow label="Sidebar opens accordion"     value={settings.sidebarAccordion}   onChange={(v) => updateSetting('sidebarAccordion', v)} />
            <SettingRow label="Show sidebar button"         value={settings.showSidebarBtn}     onChange={(v) => updateSetting('showSidebarBtn', v)} />
            <SettingRow label="Show fast enter"             value={settings.showFastEnter}      onChange={(v) => updateSetting('showFastEnter', v)} />
            <SettingRow label="Show reload page button"     value={settings.showReloadBtn}      onChange={(v) => updateSetting('showReloadBtn', v)} />
            <SettingRow label="Show crumb navigation"       value={settings.showBreadcrumbs}    onChange={(v) => updateSetting('showBreadcrumbs', v)} />
            <SettingRow label="Show multilingual selection" value={settings.showMultilingual}   onChange={(v) => updateSetting('showMultilingual', v)} />
            <SettingRow label="Show top progress bar"       value={settings.showTopProgressBar} onChange={(v) => updateSetting('showTopProgressBar', v)} />
            <SettingRow label="Color Weakness Mode"         value={settings.colorWeakMode}      onChange={(v) => updateSetting('colorWeakMode', v)} />
            <SettingRow label="Global watermark"            value={settings.globalWatermark}    onChange={(v) => updateSetting('globalWatermark', v)} />

            {/* ── SECTION 8: Advanced UI Settings ── */}
            {/* Menu width */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>Menu width</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton size="small" onClick={() => updateSetting('menuWidth', Math.max(160, settings.menuWidth - 10))} sx={{ p: 0.5 }}>
                  <Remove sx={{ fontSize: 14 }} />
                </IconButton>
                <Typography variant="body2" sx={{ minWidth: 32, textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                  {settings.menuWidth}
                </Typography>
                <IconButton size="small" onClick={() => updateSetting('menuWidth', Math.min(320, settings.menuWidth + 10))} sx={{ p: 0.5 }}>
                  <Add sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Tab style */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>Tab style</Typography>
              <Select size="small" value={settings.tabStyle} onChange={(e) => updateSetting('tabStyle', e.target.value)} sx={{ fontSize: '0.8rem', minWidth: 110, height: 32 }}>
                {['Default', 'Card', 'Rounded', 'Modern'].map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>{s}</MenuItem>
                ))}
              </Select>
            </Box>

            {/* Page animation */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>Page animation</Typography>
              <Select size="small" value={settings.pageAnimation} onChange={(e) => updateSetting('pageAnimation', e.target.value)} sx={{ fontSize: '0.8rem', minWidth: 110, height: 32 }}>
                {['Slide Left', 'Slide Right', 'Fade', 'Zoom', 'None'].map((s) => (
                  <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>{s}</MenuItem>
                ))}
              </Select>
            </Box>

            {/* Custom radius */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>Custom radius</Typography>
              <Select size="small" value={String(settings.borderRadius)} onChange={(e) => updateSetting('borderRadius', parseFloat(e.target.value))} sx={{ fontSize: '0.8rem', minWidth: 110, height: 32 }}>
                {['0', '0.25', '0.5', '0.75', '1', '1.25', '1.5'].map((v) => (
                  <MenuItem key={v} value={v} sx={{ fontSize: '0.8rem' }}>{v}</MenuItem>
                ))}
              </Select>
            </Box>

          </Box>

          {/* Footer: Copy / Reset */}
          <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.5, flexShrink: 0 }}>
            <Button variant="contained" fullWidth size="small" onClick={copyConfig} sx={{ fontSize: '0.8rem', py: 0.875 }}>
              Copy Config
            </Button>
            <Button variant="outlined" fullWidth size="small" color="error" onClick={resetSettings} sx={{ fontSize: '0.8rem', py: 0.875 }}>
              Reset Config
            </Button>
          </Box>
        </Box>

        {/* Main content */}
        <Box component="main" sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <Box sx={containerWidth === 'boxed' ? { maxWidth: 1400, mx: 'auto' } : {}}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
