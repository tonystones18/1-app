'use client';
import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, Tooltip, Badge, InputBase, Chip } from '@mui/material';
import { Search, Notifications, LightMode, DarkMode, Settings } from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { useThemeMode } from '@/theme/MuiThemeProvider';

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
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { mode, toggleMode } = useThemeMode();

  const title = PAGE_TITLES[pathname] ?? 'VisioneSoft Admin';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ gap: 2, minHeight: '56px !important' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              {title}
            </Typography>

            <Chip
              label="Phase 0 → Build"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />

            <Box sx={{ flex: 1 }} />

            {/* Search */}
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                bgcolor: 'action.hover', borderRadius: 1, px: 1.5, py: 0.5,
                border: '1px solid', borderColor: 'divider',
                '&:focus-within': { borderColor: 'primary.main', bgcolor: 'background.paper' },
              }}
            >
              <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
              <InputBase placeholder="Search anything… ⌘K" sx={{ fontSize: '0.8125rem', minWidth: 180 }} />
            </Box>

            {/* Actions */}
            <Tooltip title="Notifications">
              <IconButton size="small">
                <Badge badgeContent={3} color="error">
                  <Notifications sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton size="small" onClick={toggleMode}>
                {mode === 'light' ? <DarkMode sx={{ fontSize: 20 }} /> : <LightMode sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Settings">
              <IconButton size="small" component={Link} href="/platform/settings">
                <Settings sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box
          component="main"
          sx={{ flex: 1, p: 3, overflow: 'auto' }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
