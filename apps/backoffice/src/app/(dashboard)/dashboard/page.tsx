'use client';
import React, { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Avatar,
  Tab, Tabs, Table, TableHead, TableBody, TableRow, TableCell,
  LinearProgress, Chip, IconButton, List, ListItem, ListItemAvatar,
  ListItemText, Checkbox, useTheme,
} from '@mui/material';
import {
  TrendingUp, People, CreditCard, Route,
  CheckCircle, MoreVert,
} from '@mui/icons-material';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer,
} from 'recharts';

const monthlyGGR = [
  { month: 'Jan', ggr: 4200 }, { month: 'Feb', ggr: 9800 }, { month: 'Mar', ggr: 5600 },
  { month: 'Apr', ggr: 7200 }, { month: 'May', ggr: 18400 }, { month: 'Jun', ggr: 6400 },
  { month: 'Jul', ggr: 15600 }, { month: 'Aug', ggr: 10800 }, { month: 'Sep', ggr: 14200 },
];

const visitData = [
  { month: 'Jan', v: 48 }, { month: 'Feb', v: 38 }, { month: 'Mar', v: 22 },
  { month: 'Apr', v: 40 }, { month: 'May', v: 68 }, { month: 'Jun', v: 62 },
  { month: 'Jul', v: 64 }, { month: 'Aug', v: 30 }, { month: 'Sep', v: 42 },
  { month: 'Oct', v: 35 }, { month: 'Nov', v: 28 }, { month: 'Dec', v: 45 },
];

const newPlayers = [
  { name: 'Player #4821', region: 'Malta', gender: 'M', progress: 80 },
  { name: 'Player #3147', region: 'UK', gender: 'F', progress: 60 },
  { name: 'Player #9203', region: 'DE', gender: 'M', progress: 40 },
  { name: 'Player #6614', region: 'ES', gender: 'F', progress: 75 },
  { name: 'Player #2085', region: 'FR', gender: 'M', progress: 20 },
];

const activityFeed = [
  { id: 1, user: 'Player #4821', action: 'made a deposit', detail: '$250', time: '2m ago', color: '#3b82f6' },
  { id: 2, user: 'Player #3147', action: 'KYC approved', detail: 'Identity verified', time: '8m ago', color: '#16A34A' },
  { id: 3, user: 'Player #9203', action: 'withdrawal request', detail: '$1,200', time: '15m ago', color: '#D97706' },
  { id: 4, user: 'Player #6614', action: 'claimed bonus', detail: 'Free Spins x50', time: '22m ago', color: '#7C3AED' },
  { id: 5, user: 'AML System', action: 'flagged activity', detail: 'Player #2085', time: '41m ago', color: '#DC2626' },
  { id: 6, user: 'Evolution', action: 'provider health OK', detail: 'All systems OK', time: '1h ago', color: '#16A34A' },
];

const tasks = [
  { id: 1, text: 'Review pending KYC cases (37)', done: false },
  { id: 2, text: 'Approve withdrawal $1,200', done: false },
  { id: 3, text: 'Monthly GGR report ready', done: true },
  { id: 4, text: 'Update operator contract — BetKing', done: false },
  { id: 5, text: 'Check AML alert — Player #2085', done: false },
];

interface StatCardProps {
  label: string; value: string; change: number; unit?: string;
  icon: React.ReactNode; iconColor: string;
}

function StatCard({ label, value, change, unit = 'vs last week', icon, iconColor }: StatCardProps) {
  const positive = change >= 0;
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8125rem' }}>{label}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.75rem', lineHeight: 1 }}>{value}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: positive ? 'success.main' : 'error.main' }}>
                {positive ? '+' : ''}{change}%
              </Typography>
              <Typography variant="caption" color="text.disabled">{unit}</Typography>
            </Box>
          </Box>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, bgcolor: `${iconColor}18`, color: iconColor }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const theme = useTheme();
  const primary   = theme.palette.primary.main;
  const success   = theme.palette.success.main;
  const warning   = theme.palette.warning.main;
  const secondary = theme.palette.secondary.main;
  const [playerTab, setPlayerTab] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number[]>([3]);

  const toggleTask = (id: number) =>
    setCompletedTasks((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);

  return (
    <Box sx={{ pb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Workbench</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>Welcome back — here&apos;s what&apos;s happening today</Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard label="Total GGR (MTD)"  value="$111.1k" change={12.4}  icon={<TrendingUp />} iconColor={primary} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard label="Active Players"   value="4,840"   change={8.2}   icon={<People />}      iconColor={success} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard label="Deposits (30d)"   value="$76.1k"  change={-3.1}  icon={<CreditCard />}  iconColor={warning} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard label="Route Success"    value="98.7%"   change={0.4}   icon={<Route />}       iconColor={secondary} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>GGR Overview</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main', fontSize: '0.8125rem' }}>vs last month +23%</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyGGR} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <ReTooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'GGR']} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Bar dataKey="ggr" fill={primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                {[{ label: 'Total Players', value: '32k' }, { label: 'Total Visits', value: '128k' }, { label: 'Daily Visits', value: '1.2k' }, { label: 'Week-on-week', value: '+5%' }].map((s) => (
                  <Box key={s.label} sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Transaction Volume</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                  This year growth{' '}
                  <Box component="span" sx={{ color: 'success.main' }}>+15%</Box>
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={visitData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                  <defs>
                    <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={primary} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <ReTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="v" name="Volume (k)" stroke={primary} strokeWidth={2.5} fill="url(#visitGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>New Players</Typography>
                  <Typography variant="body2" color="success.main" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>This month +20%</Typography>
                </Box>
                <Tabs value={playerTab} onChange={(_, v) => setPlayerTab(v)} sx={{ '& .MuiTab-root': { minHeight: 32, fontSize: '0.75rem', py: 0.5, px: 1.5, minWidth: 'auto' }, minHeight: 32 }}>
                  <Tab label="This Month" />
                  <Tab label="Last Month" />
                  <Tab label="This Year" />
                </Tabs>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Player', 'Region', 'Gender', 'Progress'].map((h) => (
                      <TableCell key={h} sx={{ fontSize: '0.72rem', color: 'text.secondary', border: 0, pb: 0.5, fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {newPlayers.map((p) => (
                    <TableRow key={p.name} hover sx={{ '& td': { border: 0, py: 1 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 26, height: 26, bgcolor: 'primary.main', fontSize: '0.65rem' }}>{p.name.slice(-2)}</Avatar>
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>{p.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{p.region}</Typography></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{p.gender}</Typography></TableCell>
                      <TableCell sx={{ minWidth: 80 }}>
                        <LinearProgress variant="determinate" value={p.progress} sx={{ height: 5, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 3 } }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Activity</Typography>
                  <Chip label="+6 new" size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem', mt: 0.25 }} />
                </Box>
                <IconButton size="small"><MoreVert fontSize="small" /></IconButton>
              </Box>
              <List disablePadding dense>
                {activityFeed.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    <ListItem disableGutters sx={{ py: 0.75, alignItems: 'flex-start' }}>
                      <ListItemAvatar sx={{ minWidth: 36 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: `${item.color}20` }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography component="span" variant="body2" sx={{ fontSize: '0.8rem' }}>
                            <Box component="span" sx={{ fontWeight: 600 }}>{item.user}</Box>{' '}{item.action}
                          </Typography>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'flex', gap: 0.75 }}>
                            <Typography component="span" variant="caption" color="text.secondary">{item.detail}</Typography>
                            <Typography component="span" variant="caption" color="text.disabled">· {item.time}</Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {idx < activityFeed.length - 1 && <Box sx={{ borderBottom: '1px dashed', borderColor: 'divider', mx: 0.5 }} />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tasks</Typography>
                  <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
                    Pending {tasks.filter((t) => !completedTasks.includes(t.id)).length}
                  </Typography>
                </Box>
                <CheckCircle fontSize="small" color="success" />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                {tasks.map((task) => {
                  const done = completedTasks.includes(task.id);
                  return (
                    <Box key={task.id} onClick={() => toggleTask(task.id)} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, cursor: 'pointer', p: 0.75, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
                      <Checkbox size="small" checked={done} onChange={() => toggleTask(task.id)} sx={{ p: 0, mt: 0.25, color: 'primary.main' }} onClick={(e) => e.stopPropagation()} />
                      <Typography variant="caption" sx={{ fontSize: '0.8rem', color: done ? 'text.disabled' : 'text.primary', textDecoration: done ? 'line-through' : 'none', lineHeight: 1.4 }}>
                        {task.text}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
