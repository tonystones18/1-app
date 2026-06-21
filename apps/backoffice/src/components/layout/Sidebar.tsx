'use client';
import React from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Typography, Divider, Avatar, Tooltip, IconButton,
} from '@mui/material';
import {
  Dashboard, Speed, Extension, Business, SportsEsports, Group, SupervisorAccount,
  Route, AccountBalance, People, AccountBalanceWallet, CreditCard, CardGiftcard,
  Star, Security, Dns, CorporateFare, Receipt, Groups, Image, SmartToy,
  BarChart, Settings, VerifiedUser, ChevronLeft,
  ChevronRight, Logout, CalendarMonth, ViewKanban, Person,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED = 72;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: NavItem[];
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <Dashboard />, href: '/dashboard' },
  {
    label: 'Aggregator', icon: <Speed />, section: 'Aggregator',
    children: [
      { label: 'Providers', icon: <Extension />, href: '/aggregator/providers' },
      { label: 'Vendors', icon: <Business />, href: '/aggregator/vendors' },
      { label: 'Games', icon: <SportsEsports />, href: '/aggregator/games' },
      { label: 'Operators', icon: <CorporateFare />, href: '/aggregator/operators' },
      { label: 'Agents', icon: <SupervisorAccount />, href: '/aggregator/agents' },
      { label: 'Route Center', icon: <Route />, href: '/aggregator/routes' },
      { label: 'Settlements', icon: <AccountBalance />, href: '/aggregator/settlements' },
    ],
  },
  {
    label: 'Player Ops', icon: <People />, section: 'B2C',
    children: [
      { label: 'Players', icon: <Group />, href: '/b2c/players' },
      { label: 'Wallets & Ledger', icon: <AccountBalanceWallet />, href: '/b2c/wallets' },
      { label: 'Payments', icon: <CreditCard />, href: '/b2c/payments' },
      { label: 'Bonuses', icon: <CardGiftcard />, href: '/b2c/bonuses' },
      { label: 'VIP', icon: <Star />, href: '/b2c/vip' },
      { label: 'Compliance / KYC', icon: <Security />, href: '/b2c/compliance' },
    ],
  },
  {
    label: 'B2B Operations', icon: <Dns />, section: 'B2B',
    children: [
      { label: 'White Labels', icon: <VerifiedUser />, href: '/b2b/white-labels' },
      { label: 'CRM', icon: <CorporateFare />, href: '/b2b/crm' },
      { label: 'Invoices', icon: <Receipt />, href: '/b2b/invoices' },
      { label: 'Affiliates', icon: <Groups />, href: '/b2b/affiliates' },
    ],
  },
  {
    label: 'Media & AI', icon: <Image />, section: 'Media',
    children: [
      { label: 'Media Center', icon: <Image />, href: '/media' },
      { label: 'AI Copilot', icon: <SmartToy />, href: '/ai' },
    ],
  },
  {
    label: 'Analytics', icon: <BarChart />, section: 'Analytics',
    children: [
      { label: 'Reports', icon: <BarChart />, href: '/analytics/reports' },
      { label: 'KPI Dashboard', icon: <Dashboard />, href: '/analytics/kpis' },
    ],
  },
  {
    label: 'Platform', icon: <Settings />, section: 'Platform',
    children: [
      { label: 'Audit Log', icon: <VerifiedUser />, href: '/platform/audit' },
      { label: 'Settings', icon: <Settings />, href: '/platform/settings' },
    ],
  },
  {
    label: 'Workspace', icon: <CalendarMonth />, section: 'Workspace',
    children: [
      { label: 'Calendar', icon: <CalendarMonth />, href: '/calendar' },
      { label: 'Kanban Board', icon: <ViewKanban />, href: '/kanban' },
      { label: 'My Profile', icon: <Person />, href: '/profile' },
    ],
  },
];

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          transition: 'width 0.2s ease',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Brand */}
      <Box sx={{ px: collapsed ? 1.5 : 2.5, py: 0, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 64, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Speed sx={{ fontSize: 18, color: 'white' }} />
        </Box>
        {!collapsed && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1, color: 'text.primary' }}>
              VisioneSoft
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
              Admin Portal
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1.5 }}>
        <List dense disablePadding>
          {navItems.map((item) => {
            if (item.children) {
              const anyChildActive = item.children.some((c) => c.href && isActive(c.href));
              return (
                <React.Fragment key={item.label}>
                  {!collapsed && (
                    <Typography
                      variant="caption"
                      sx={{ px: 2.5, py: 0.5, display: 'block', color: 'text.disabled', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', mt: 1 }}
                    >
                      {item.label}
                    </Typography>
                  )}
                  {collapsed && (
                    <Tooltip title={item.label} placement="right">
                      <ListItemButton
                        sx={{
                          px: 1.5, py: 1, mx: 0.75, borderRadius: 1.5,
                          color: anyChildActive ? 'primary.main' : 'text.secondary',
                          bgcolor: anyChildActive ? 'action.selected' : 'transparent',
                          '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                          mb: 0.25,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 'unset', color: 'inherit' }}>{item.icon}</ListItemIcon>
                      </ListItemButton>
                    </Tooltip>
                  )}
                  {!collapsed && (
                    <Collapse in timeout="auto">
                      <List dense disablePadding>
                        {item.children.map((child) => {
                          const active = !!(child.href && isActive(child.href));
                          return (
                            <ListItemButton
                              key={child.href}
                              component={Link}
                              href={child.href!}
                              sx={{
                                pl: 2.5, pr: 2, py: 0.6, mx: 0.75, borderRadius: 1.5, mb: 0.25,
                                color: active ? 'primary.main' : 'text.secondary',
                                bgcolor: active ? 'primary.50' : 'transparent',
                                '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                                '& .MuiListItemIcon-root': { color: active ? 'primary.main' : 'text.disabled' },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 28, '& svg': { fontSize: 16 } }}>{child.icon}</ListItemIcon>
                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400 }}
                              />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            }

            const active = !!(item.href && isActive(item.href));
            return (
              <Tooltip key={item.href} title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  component={Link}
                  href={item.href!}
                  sx={{
                    px: collapsed ? 1.5 : 2.5, py: collapsed ? 1 : 0.75, mx: 0.75, borderRadius: 1.5, mb: 0.25,
                    color: active ? 'primary.main' : 'text.secondary',
                    bgcolor: active ? 'primary.50' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                    '& .MuiListItemIcon-root': { color: active ? 'primary.main' : 'text.disabled' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? 'unset' : 32 }}>{item.icon}</ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400 }} />}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      <Divider />

      {/* User footer */}
      <Box sx={{ px: collapsed ? 1.5 : 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem', flexShrink: 0 }}>
          {user?.displayName?.[0]?.toUpperCase() ?? 'A'}
        </Avatar>
        {!collapsed && (
          <>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2, color: 'text.primary' }} noWrap>
                {user?.displayName ?? 'Admin'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', display: 'block' }} noWrap>
                {user?.roleId?.replace(/_/g, ' ')}
              </Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton size="small" onClick={handleLogout}>
                <Logout sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Collapse toggle */}
      <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', px: 1, pb: 1 }}>
        <IconButton size="small" onClick={onToggle}>
          {collapsed ? <ChevronRight sx={{ fontSize: 18 }} /> : <ChevronLeft sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>
    </Drawer>
  );
}
