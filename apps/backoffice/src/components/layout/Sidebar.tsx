'use client';
import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Typography, Divider, Avatar, Tooltip, IconButton,
} from '@mui/material';
import {
  Dashboard, Speed, Extension, Business, SportsEsports, Group, SupervisorAccount,
  Route, AccountBalance, People, AccountBalanceWallet, CreditCard, CardGiftcard,
  Star, Security, Dns, CorporateFare, Receipt, Groups, Image, SmartToy,
  BarChart, Settings, VerifiedUser, ExpandLess, ExpandMore, ChevronLeft,
  ChevronRight, Logout,
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
];

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Aggregator': true, 'B2C': true,
  });

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
          bgcolor: (t) => t.palette.mode === 'dark' ? '#0F172A' : '#1E293B',
          color: 'common.white',
          transition: 'width 0.2s ease',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1, minHeight: 64 }}>
        {!collapsed && (
          <>
            <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Speed sx={{ fontSize: 20, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, lineHeight: 1 }}>
                VisioneSoft
              </Typography>
              <Typography variant="caption" sx={{ color: 'grey.400', fontSize: '0.65rem' }}>
                Admin Portal
              </Typography>
            </Box>
          </>
        )}
        {collapsed && (
          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
            <Speed sx={{ fontSize: 20, color: 'white' }} />
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List dense disablePadding>
          {navItems.map((item) => {
            if (item.children) {
              const isOpen = openSections[item.label] ?? false;
              const anyChildActive = item.children.some((c) => c.href && isActive(c.href));
              return (
                <React.Fragment key={item.label}>
                  <ListItemButton
                    onClick={() => toggleSection(item.label)}
                    sx={{
                      px: collapsed ? 1.5 : 2,
                      py: 0.75,
                      mx: 1,
                      borderRadius: 1,
                      color: anyChildActive ? 'primary.light' : 'grey.400',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'white' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 'unset' : 36, color: 'inherit', mr: collapsed ? 0 : 0 }}>
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: anyChildActive ? 600 : 400 }} />
                        {isOpen ? <ExpandLess sx={{ fontSize: 16 }} /> : <ExpandMore sx={{ fontSize: 16 }} />}
                      </>
                    )}
                  </ListItemButton>
                  {!collapsed && (
                    <Collapse in={isOpen} timeout="auto">
                      <List dense disablePadding>
                        {item.children.map((child) => (
                          <ListItemButton
                            key={child.href}
                            component={Link}
                            href={child.href!}
                            selected={!!(child.href && isActive(child.href))}
                            sx={{
                              pl: 5, pr: 2, py: 0.5, mx: 1, borderRadius: 1,
                              color: child.href && isActive(child.href) ? 'primary.light' : 'grey.400',
                              '&.Mui-selected': {
                                bgcolor: 'rgba(96,165,250,0.12)',
                                color: 'primary.light',
                                '&:hover': { bgcolor: 'rgba(96,165,250,0.18)' },
                              },
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: 'white' },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 28, color: 'inherit', '& svg': { fontSize: 16 } }}>{child.icon}</ListItemIcon>
                            <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: '0.8125rem' }} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            }

            return (
              <Tooltip key={item.href} title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  component={Link}
                  href={item.href!}
                  selected={!!(item.href && isActive(item.href))}
                  sx={{
                    px: collapsed ? 1.5 : 2, py: 0.75, mx: 1, borderRadius: 1,
                    color: item.href && isActive(item.href) ? 'primary.light' : 'grey.400',
                    '&.Mui-selected': { bgcolor: 'rgba(96,165,250,0.12)', color: 'primary.light' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: 'white' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? 'unset' : 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.8125rem' }} />}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* User footer */}
      <Box sx={{ px: 1.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
          {user?.displayName?.[0]?.toUpperCase() ?? 'A'}
        </Avatar>
        {!collapsed && (
          <>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 500, display: 'block', lineHeight: 1.2 }} noWrap>
                {user?.displayName ?? 'Admin'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'grey.500', fontSize: '0.65rem', display: 'block' }} noWrap>
                {user?.roleId?.replace(/_/g, ' ')}
              </Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton size="small" onClick={handleLogout} sx={{ color: 'grey.500', '&:hover': { color: 'white' } }}>
                <Logout sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Collapse toggle */}
      <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', px: 1, pb: 1 }}>
        <IconButton size="small" onClick={onToggle} sx={{ color: 'grey.500', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' } }}>
          {collapsed ? <ChevronRight sx={{ fontSize: 18 }} /> : <ChevronLeft sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>
    </Drawer>
  );
}
