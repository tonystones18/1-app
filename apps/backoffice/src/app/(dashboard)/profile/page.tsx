'use client';
import React, { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Avatar, Button, Divider,
  TextField, Chip, List, ListItem, ListItemText, ListItemIcon, Tab, Tabs,
  Switch, FormControlLabel, IconButton, Tooltip,
} from '@mui/material';
import {
  Edit, Save, LockReset, Security, Notifications, History, Person,
  Email, Phone, Business, LocationOn, Shield, Key, CheckCircle,
} from '@mui/icons-material';
import { useAuthStore } from '@/lib/store/auth.store';

const SESSIONS = [
  { id: 1, device: 'Chrome / Windows', ip: '192.168.3.9', location: 'Malta', time: 'Now — current session', current: true },
  { id: 2, device: 'Safari / macOS', ip: '82.14.221.10', location: 'London, UK', time: '2 days ago', current: false },
  { id: 3, device: 'Firefox / Linux', ip: '94.130.15.77', location: 'Frankfurt, DE', time: '5 days ago', current: false },
];

const AUDIT = [
  { action: 'Login', detail: 'Chrome / Windows', time: '2m ago' },
  { action: 'Viewed Players', detail: '/b2c/players', time: '8m ago' },
  { action: 'Updated Provider', detail: 'Evolution Gaming', time: '1h ago' },
  { action: 'Exported Report', detail: 'GGR Monthly', time: '3h ago' },
  { action: 'Login', detail: 'Safari / macOS', time: '2d ago' },
];

interface TabPanelProps { children: React.ReactNode; value: number; index: number; }
function TabPanel({ children, value, index }: TabPanelProps) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.displayName ?? 'Platform Admin');
  const [phone, setPhone] = useState('+356 99 123 456');
  const [timezone, setTimezone] = useState('Europe/Malta (UTC+2)');
  const [twoFa, setTwoFa] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [alertNotifs, setAlertNotifs] = useState(true);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left: avatar + quick info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', textAlign: 'center', p: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: '2rem', mx: 'auto' }}>
                {name.charAt(0).toUpperCase()}
              </Avatar>
              <Tooltip title="Change photo">
                <IconButton size="small" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <Edit sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Chip label="Owner / Admin" size="small" color="primary" sx={{ mt: 1 }} />
            <Divider sx={{ my: 2 }} />
            <List dense disablePadding>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}><Email fontSize="small" color="action" /></ListItemIcon>
                <ListItemText primary={user?.email} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}><Phone fontSize="small" color="action" /></ListItemIcon>
                <ListItemText primary={phone} primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}><Business fontSize="small" color="action" /></ListItemIcon>
                <ListItemText primary="VisioneSoft Platform" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}><LocationOn fontSize="small" color="action" /></ListItemIcon>
                <ListItemText primary="Malta" primaryTypographyProps={{ variant: 'body2' }} />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
              {[{ label: 'Actions', value: '1,248' }, { label: 'Sessions', value: '38' }, { label: 'Days Active', value: '142' }].map((s) => (
                <Box key={s.label}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Right: tabs */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 44 }}>
                <Tab icon={<Person sx={{ fontSize: 16 }} />} iconPosition="start" label="Profile" sx={{ minHeight: 44, fontSize: '0.8rem' }} />
                <Tab icon={<Key sx={{ fontSize: 16 }} />} iconPosition="start" label="Password" sx={{ minHeight: 44, fontSize: '0.8rem' }} />
                <Tab icon={<Security sx={{ fontSize: 16 }} />} iconPosition="start" label="Security" sx={{ minHeight: 44, fontSize: '0.8rem' }} />
                <Tab icon={<Notifications sx={{ fontSize: 16 }} />} iconPosition="start" label="Notifications" sx={{ minHeight: 44, fontSize: '0.8rem' }} />
                <Tab icon={<History sx={{ fontSize: 16 }} />} iconPosition="start" label="Activity" sx={{ minHeight: 44, fontSize: '0.8rem' }} />
              </Tabs>
            </Box>

            <CardContent>
              {/* Profile Tab */}
              <TabPanel value={tab} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Personal Information</Typography>
                  <Button
                    size="small"
                    variant={editing ? 'contained' : 'outlined'}
                    startIcon={editing ? <Save /> : <Edit />}
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { label: 'Full Name', value: name, setter: setName },
                    { label: 'Email Address', value: user?.email ?? '', setter: () => {} },
                    { label: 'Phone Number', value: phone, setter: setPhone },
                    { label: 'Role', value: user?.roleId ?? 'owner_admin', setter: () => {} },
                    { label: 'Tenant ID', value: user?.tenantId ?? '', setter: () => {} },
                    { label: 'Timezone', value: timezone, setter: setTimezone },
                  ].map((f) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={f.label}>
                      <TextField
                        fullWidth size="small" label={f.label} value={f.value}
                        disabled={!editing || f.label === 'Email Address' || f.label === 'Role' || f.label === 'Tenant ID'}
                        onChange={(e) => f.setter(e.target.value)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              {/* Password Tab */}
              <TabPanel value={tab} index={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>Change Password</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                  <TextField fullWidth size="small" label="Current Password" type="password" />
                  <TextField fullWidth size="small" label="New Password" type="password" helperText="Min 12 characters with uppercase, number and special char" />
                  <TextField fullWidth size="small" label="Confirm New Password" type="password" />
                  <Button variant="contained" startIcon={<LockReset />} sx={{ alignSelf: 'flex-start' }}>
                    Update Password
                  </Button>
                </Box>
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value={tab} index={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>Security Settings</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Two-Factor Authentication</Typography>
                        <Typography variant="caption" color="text.secondary">TOTP via Authenticator App</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {twoFa && <Chip label="Enabled" size="small" color="success" icon={<CheckCircle sx={{ fontSize: '14px !important' }} />} />}
                        <Switch checked={twoFa} onChange={(e) => setTwoFa(e.target.checked)} size="small" />
                      </Box>
                    </Box>
                  </Card>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Active Sessions</Typography>
                  {SESSIONS.map((s) => (
                    <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{s.device}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.ip} · {s.location} · {s.time}</Typography>
                      </Box>
                      {s.current ? (
                        <Chip label="Current" size="small" color="primary" variant="outlined" />
                      ) : (
                        <Button size="small" color="error" variant="outlined">Revoke</Button>
                      )}
                    </Box>
                  ))}
                </Box>
              </TabPanel>

              {/* Notifications Tab */}
              <TabPanel value={tab} index={3}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>Notification Preferences</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { label: 'Email Notifications', sub: 'Receive summaries and alerts via email', state: emailNotifs, setter: setEmailNotifs },
                    { label: 'Critical Alerts', sub: 'AML flags, KYC failures, route errors', state: alertNotifs, setter: setAlertNotifs },
                    { label: 'Weekly Reports', sub: 'Platform performance digest every Monday', state: true, setter: () => {} },
                    { label: 'Provider Health Alerts', sub: 'Notify when provider health score drops', state: true, setter: () => {} },
                  ].map((n) => (
                    <Box key={n.label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{n.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{n.sub}</Typography>
                      </Box>
                      <Switch checked={n.state} onChange={(e) => n.setter(e.target.checked)} size="small" />
                    </Box>
                  ))}
                </Box>
              </TabPanel>

              {/* Activity Tab */}
              <TabPanel value={tab} index={4}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Recent Activity</Typography>
                <List disablePadding>
                  {AUDIT.map((a, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem disableGutters sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Shield fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{a.action}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">{a.detail} · {a.time}</Typography>}
                        />
                      </ListItem>
                      {idx < AUDIT.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
