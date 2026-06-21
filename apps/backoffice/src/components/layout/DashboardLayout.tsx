'use client';
import React, { useState, useCallback } from 'react';
import {
  Box, AppBar, Toolbar, IconButton, Typography, Tooltip, Badge, InputBase,
  Popover, List, ListItem, ListItemText, ListItemIcon, Divider, Avatar,
  Breadcrumbs, Link as MuiLink, Chip,
} from '@mui/material';
import {
  Search, Notifications, LightMode, DarkMode, Settings,
  CreditCard, Shield, TrendingUp, Warning, CheckCircle,
  Menu, Refresh, Apps, Fullscreen, FullscreenExit,
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { useThemeMode } from '@/theme/MuiThemeProvider';
import { useAuthStore } from '@/lib/store/auth.store';

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

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<HTMLButtonElement | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { mode, toggleMode } = useThemeMode();
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', color: 'text.primary' }}
        >
          <Toolbar sx={{ gap: 0.75, minHeight: '56px !important', px: { xs: 1.5, sm: 2 } }}>
            {/* ── Left: hamburger | refresh | apps | breadcrumbs ── */}
            <Tooltip title="Toggle sidebar">
              <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ color: 'text.secondary' }}>
                <Menu sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton size="small" onClick={() => router.refresh()} sx={{ color: 'text.secondary' }}>
                <Refresh sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Dashboard">
              <IconButton size="small" component={Link} href="/dashboard" sx={{ color: 'text.secondary' }}>
                <Apps sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            {/* Breadcrumbs */}
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

            {/* Dark mode toggle */}
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton size="small" onClick={toggleMode}>
                {mode === 'light' ? <DarkMode sx={{ fontSize: 20 }} /> : <LightMode sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

            {/* Settings */}
            <Tooltip title="Settings">
              <IconButton size="small" component={Link} href="/platform/settings">
                <Settings sx={{ fontSize: 20 }} />
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

        {/* Main content */}
        <Box component="main" sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
