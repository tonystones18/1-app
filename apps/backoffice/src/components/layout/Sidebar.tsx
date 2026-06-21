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
  ChevronRight, Logout, CalendarMonth, ViewKanban, Person, ExpandLess, ExpandMore,
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

export const navItems: NavItem[] = [
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

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  menuStyle?: 'light' | 'dark' | 'mixed';
  menuLayout?: 'vertical' | 'horizontal' | 'mixed' | 'dual';
  menuWidth?: number;
  activeSectionChildren?: NavItem[];
  activeSectionLabel?: string;
  sidebarAccordion?: boolean;
}

export function Sidebar({ collapsed, onToggle, menuStyle = 'light', menuLayout = 'vertical', menuWidth = 256, activeSectionChildren, activeSectionLabel, sidebarAccordion = true }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const handleLogout = () => { logout(); router.push('/login'); };

  // Accordion state: track which section label is open (for sidebarAccordion mode)
  const activeSection = navItems.find((i) => i.children?.some((c) => c.href && isActive(c.href)))?.label ?? null;
  const [openSection, setOpenSection] = React.useState<string | null>(activeSection);
  // When pathname changes, open the matching section automatically
  React.useEffect(() => {
    const matched = navItems.find((i) => i.children?.some((c) => c.href && isActive(c.href)))?.label ?? null;
    if (matched) setOpenSection(matched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleSection = (label: string) => {
    if (sidebarAccordion) {
      setOpenSection((prev) => (prev === label ? null : label));
    } else {
      setOpenSection(label); // non-accordion: just track focus, Collapse is always open
    }
  };

  const isDark = menuStyle === 'dark';
  const isMixed = menuStyle === 'mixed'; // mixed style = icon panel dark, content light
  const sidebarBg = isDark ? '#1e293b' : 'background.paper';
  const iconPanelBg = (isDark || isMixed) ? '#1e293b' : 'background.paper';
  const textPrimary = isDark ? 'rgba(255,255,255,0.9)' : 'text.primary';
  const textSecondary = isDark ? 'rgba(255,255,255,0.55)' : 'text.secondary';
  const textDisabled = isDark ? 'rgba(255,255,255,0.3)' : 'text.disabled';
  const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'action.hover';
  const activeBg = 'primary.50';
  const activeColor = 'primary.main';
  const dividerColor = isDark ? 'rgba(255,255,255,0.1)' : 'divider';

  const isDual = menuLayout === 'dual';
  const ICON_PANEL_WIDTH = 72;
  const textPanelWidth = Math.max(menuWidth - ICON_PANEL_WIDTH, 150);
  const sidebarActualWidth = collapsed
    ? SIDEBAR_COLLAPSED
    : isDual ? ICON_PANEL_WIDTH + textPanelWidth : menuWidth;

  // Dual layout: track which section is shown in the text panel
  const activeDualDefault = navItems.find((i) => i.children?.some((c) => c.href && isActive(c.href))) ?? navItems.find((i) => !!i.children) ?? null;
  const [dualActiveSection, setDualActiveSection] = React.useState(activeDualDefault);
  React.useEffect(() => {
    const matched = navItems.find((i) => i.children?.some((c) => c.href && isActive(c.href)));
    if (matched) setDualActiveSection(matched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderNavItems = (items: NavItem[]) => items.map((item) => {
    if (item.children) {
      const anyChildActive = item.children.some((c) => c.href && isActive(c.href));
      const isSectionOpen = sidebarAccordion ? openSection === item.label : true;
      return (
        <React.Fragment key={item.label}>
          {!collapsed && (
            <Box
              onClick={() => toggleSection(item.label)}
              sx={{ px: 2.5, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
            >
              <Typography variant="caption" sx={{ display: 'block', color: textDisabled, fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {item.label}
              </Typography>
              {sidebarAccordion && (
                isSectionOpen
                  ? <ExpandLess sx={{ fontSize: 14, color: textDisabled }} />
                  : <ExpandMore sx={{ fontSize: 14, color: textDisabled }} />
              )}
            </Box>
          )}
          {collapsed && (
            <Tooltip title={item.label} placement="right">
              <ListItemButton sx={{ px: 1.5, py: 1, mx: 0.75, borderRadius: 1.5, mb: 0.25, color: anyChildActive ? activeColor : textSecondary, bgcolor: anyChildActive ? activeBg : 'transparent', '&:hover': { bgcolor: hoverBg } }}>
                <ListItemIcon sx={{ minWidth: 'unset', color: 'inherit' }}>{item.icon}</ListItemIcon>
              </ListItemButton>
            </Tooltip>
          )}
          {!collapsed && (
            <Collapse in={isSectionOpen} timeout="auto">
              <List dense disablePadding>
                {item.children.map((child) => {
                  const active = !!(child.href && isActive(child.href));
                  return (
                    <ListItemButton key={child.href} component={Link} href={child.href!} sx={{ pl: 2.5, pr: 2, py: 0.6, mx: 0.75, borderRadius: 1.5, mb: 0.25, color: active ? activeColor : textSecondary, bgcolor: active ? activeBg : 'transparent', '&:hover': { bgcolor: hoverBg, color: textPrimary }, '& .MuiListItemIcon-root': { color: active ? activeColor : textDisabled } }}>
                      <ListItemIcon sx={{ minWidth: 28, '& svg': { fontSize: 16 } }}>{child.icon}</ListItemIcon>
                      <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: 'inherit' }} />
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
        <ListItemButton component={Link} href={item.href!} sx={{ px: collapsed ? 1.5 : 2.5, py: collapsed ? 1 : 0.75, mx: 0.75, borderRadius: 1.5, mb: 0.25, color: active ? activeColor : textSecondary, bgcolor: active ? activeBg : 'transparent', '&:hover': { bgcolor: hoverBg, color: textPrimary }, '& .MuiListItemIcon-root': { color: active ? activeColor : textDisabled } }}>
          <ListItemIcon sx={{ minWidth: collapsed ? 'unset' : 32 }}>{item.icon}</ListItemIcon>
          {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: 'inherit' }} />}
        </ListItemButton>
      </Tooltip>
    );
  });

  const renderMixedChildren = (children: NavItem[], sectionLabel?: string) => (
    <>
      {/* Section header in mixed sidebar */}
      {sectionLabel && (
        <Box sx={{ px: 2.5, pt: 1.5, pb: 0.5 }}>
          <Typography variant="caption" sx={{ display: 'block', color: textDisabled, fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {sectionLabel}
          </Typography>
        </Box>
      )}
      {children.map((child) => {
        const active = !!(child.href && isActive(child.href));
        return (
          <ListItemButton key={child.href} component={Link} href={child.href!} sx={{ pl: 2.5, pr: 2, py: 0.6, mx: 0.75, borderRadius: 1.5, mb: 0.25, color: active ? activeColor : textSecondary, bgcolor: active ? activeBg : 'transparent', '&:hover': { bgcolor: hoverBg, color: textPrimary } }}>
            <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: 'inherit' }} />
          </ListItemButton>
        );
      })}
    </>
  );

  const brandContent = (
    <Box sx={{ px: collapsed ? 1.5 : 2.5, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 64, borderBottom: '1px solid', borderColor: dividerColor, flexShrink: 0 }}>
      <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Speed sx={{ fontSize: 18, color: 'white' }} />
      </Box>
      {!collapsed && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, color: textPrimary }}>VisioneSoft</Typography>
          <Typography variant="caption" sx={{ color: textDisabled, fontSize: '0.65rem' }}>Admin Portal</Typography>
        </Box>
      )}
    </Box>
  );

  const userFooter = (
    <>
      <Divider sx={{ borderColor: dividerColor }} />
      <Box sx={{ px: collapsed ? 1.5 : 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem', flexShrink: 0 }}>
          {user?.displayName?.[0]?.toUpperCase() ?? 'A'}
        </Avatar>
        {!collapsed && (
          <>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.2, color: textPrimary }} noWrap>{user?.displayName ?? 'Admin'}</Typography>
              <Typography variant="caption" sx={{ color: textDisabled, fontSize: '0.65rem', display: 'block' }} noWrap>{user?.roleId?.replace(/_/g, ' ')}</Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton size="small" onClick={handleLogout} sx={{ color: textSecondary }}>
                <Logout sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', px: 1, pb: 1 }}>
        <IconButton size="small" onClick={onToggle} sx={{ color: textSecondary }}>
          {collapsed ? <ChevronRight sx={{ fontSize: 18 }} /> : <ChevronLeft sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>
    </>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarActualWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarActualWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: dividerColor,
          bgcolor: sidebarBg,
          transition: 'width 0.2s ease',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: isDual && !collapsed ? 'row' : 'column',
        },
      }}
    >
      {/* ── DUAL layout: icon panel + text panel ── */}
      {isDual && !collapsed ? (
        <>
          {/* Narrow icon+label strip */}
          <Box sx={{ width: ICON_PANEL_WIDTH, display: 'flex', flexDirection: 'column', flexShrink: 0, bgcolor: iconPanelBg, borderRight: '1px solid', borderColor: dividerColor }}>
            {/* Brand logo */}
            <Box sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid', borderColor: dividerColor, flexShrink: 0 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Speed sx={{ fontSize: 18, color: 'white' }} />
              </Box>
            </Box>
            {/* Icon + label items */}
            <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
              {navItems.map((item) => {
                const anyActive = item.children?.some((c) => c.href && isActive(c.href)) ?? (item.href ? isActive(item.href) : false);
                const isPanelActive = dualActiveSection?.label === item.label;
                const iconColor = (isDark || isMixed)
                  ? ((anyActive || isPanelActive) ? activeColor : 'rgba(255,255,255,0.6)')
                  : ((anyActive || isPanelActive) ? activeColor : textSecondary);
                return (
                  <Box
                    key={item.label}
                    onClick={() => {
                      if (item.children) {
                        setDualActiveSection(item);
                      } else if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    sx={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      py: 1, px: 0.5, mb: 0.25, mx: 0.5, borderRadius: 1.5, cursor: 'pointer',
                      color: iconColor,
                      bgcolor: (anyActive || isPanelActive) ? activeBg : 'transparent',
                      '&:hover': { bgcolor: hoverBg },
                      transition: 'all 0.15s',
                    }}
                  >
                    <Box sx={{ '& svg': { fontSize: 20 }, color: 'inherit', mb: 0.5 }}>{item.icon}</Box>
                    <Typography sx={{ fontSize: '0.6rem', lineHeight: 1.1, textAlign: 'center', color: 'inherit', fontWeight: (anyActive || isPanelActive) ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 60 }}>
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            {/* User avatar at bottom */}
            <Divider sx={{ borderColor: dividerColor }} />
            <Box sx={{ py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Tooltip title={user?.displayName ?? 'Profile'} placement="right">
                <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.8rem', cursor: 'pointer' }}>
                  {user?.displayName?.[0]?.toUpperCase() ?? 'A'}
                </Avatar>
              </Tooltip>
              <IconButton size="small" onClick={onToggle} sx={{ color: (isDark || isMixed) ? 'rgba(255,255,255,0.5)' : textSecondary }}>
                <ChevronLeft sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Text labels panel — shows active section's children */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, bgcolor: sidebarBg }}>
            {/* Panel header: active section name */}
            <Box sx={{ px: 2, height: 64, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: dividerColor, flexShrink: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textPrimary }}>
                {dualActiveSection?.label ?? 'Navigation'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', py: 1.5 }}>
              <List dense disablePadding>
                {dualActiveSection?.children ? (
                  dualActiveSection.children.map((child) => {
                    const active = !!(child.href && isActive(child.href));
                    return (
                      <ListItemButton key={child.href} component={Link} href={child.href!} sx={{ pl: 2, pr: 1.5, py: 0.6, mx: 0.5, borderRadius: 1.5, mb: 0.25, color: active ? activeColor : textSecondary, bgcolor: active ? activeBg : 'transparent', '&:hover': { bgcolor: hoverBg, color: textPrimary } }}>
                        <ListItemText primary={child.label} primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 400, color: 'inherit' }} />
                      </ListItemButton>
                    );
                  })
                ) : dualActiveSection?.href ? (
                  <ListItemButton component={Link} href={dualActiveSection.href} sx={{ pl: 2, pr: 1.5, py: 0.6, mx: 0.5, borderRadius: 1.5 }}>
                    <ListItemText primary={dualActiveSection.label} primaryTypographyProps={{ fontSize: '0.8125rem', color: 'inherit' }} />
                  </ListItemButton>
                ) : null}
              </List>
            </Box>
            <Divider sx={{ borderColor: dividerColor }} />
            <Box sx={{ px: 1.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', color: textPrimary }} noWrap>{user?.displayName ?? 'Admin'}</Typography>
                <Typography variant="caption" sx={{ color: textDisabled, fontSize: '0.65rem' }} noWrap>{user?.roleId?.replace(/_/g, ' ')}</Typography>
              </Box>
              <Tooltip title="Sign out">
                <IconButton size="small" onClick={handleLogout} sx={{ color: textSecondary }}>
                  <Logout sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </>
      ) : (
        /* ── Standard layout: vertical / mixed / horizontal (collapsed) ── */
        <>
          {brandContent}
          <Box sx={{ flex: 1, overflow: 'auto', py: 1.5 }}>
            <List dense disablePadding>
              {menuLayout === 'mixed' && activeSectionChildren && activeSectionChildren.length > 0
                ? renderMixedChildren(activeSectionChildren, activeSectionLabel)
                : renderNavItems(navItems)
              }
            </List>
          </Box>
          {userFooter}
        </>
      )}
    </Drawer>
  );
}
