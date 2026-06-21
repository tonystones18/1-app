'use client';
import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import { useTheme } from '@mui/material';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, ResponsiveContainer } from 'recharts';
import { PageShell } from '@/components/ui/DataTable';

const ggrData = [
  { month: 'Jan', Pragmatic: 284000, Evolution: 192000, PGSoft: 88000, Hacksaw: 42000 },
  { month: 'Feb', Pragmatic: 312000, Evolution: 210000, PGSoft: 94000, Hacksaw: 48000 },
  { month: 'Mar', Pragmatic: 298000, Evolution: 224000, PGSoft: 102000, Hacksaw: 52000 },
  { month: 'Apr', Pragmatic: 340000, Evolution: 238000, PGSoft: 118000, Hacksaw: 61000 },
  { month: 'May', Pragmatic: 376000, Evolution: 258000, PGSoft: 128000, Hacksaw: 68000 },
  { month: 'Jun', Pragmatic: 398000, Evolution: 274000, PGSoft: 142000, Hacksaw: 74000 },
];

const retentionData = [
  { month: 'Jan', D1: 78, D7: 52, D30: 28 },
  { month: 'Feb', D1: 80, D7: 54, D30: 29 },
  { month: 'Mar', D1: 79, D7: 55, D30: 31 },
  { month: 'Apr', D1: 82, D7: 57, D30: 33 },
  { month: 'May', D1: 84, D7: 59, D30: 35 },
  { month: 'Jun', D1: 85, D7: 61, D30: 37 },
];

const topOperators = [
  { name: 'BetZone Ltd', ggr: 842300, players: 124000, margin: 8.4 },
  { name: 'Diamond Club Casino', ggr: 408200, players: 61400, margin: 7.9 },
  { name: 'Spin Palace Group', ggr: 562000, players: 87000, margin: 8.1 },
  { name: 'Lucky Star Casino', ggr: 289400, players: 45200, margin: 7.6 },
  { name: 'Venus Gaming SA', ggr: 187600, players: 29800, margin: 7.2 },
];

const statCards = [
  { label: 'Total GGR (MTD)', value: '$2.29M', sub: '+12.4% vs last month', color: 'primary.main' },
  { label: 'Total NGR (MTD)', value: '$1.84M', sub: 'After bonuses & taxes', color: 'success.main' },
  { label: 'Active Players', value: '386,500', sub: '+8.2% vs last month', color: 'info.main' },
  { label: 'Route Success Rate', value: '98.7%', sub: 'Avg across all routes', color: 'warning.main' },
  { label: 'Total Deposits (MTD)', value: '$5.12M', sub: '+15.6% vs last month', color: 'primary.main' },
  { label: 'Total Withdrawals (MTD)', value: '$3.48M', sub: '68% withdrawal ratio', color: 'secondary.main' },
  { label: 'Bonus Cost (MTD)', value: '$248K', sub: '13.5% of GGR', color: 'error.main' },
  { label: 'Provider Uptime', value: '99.4%', sub: 'Avg last 30 days', color: 'success.main' },
];

export default function KPIPage() {
  const theme = useTheme();

  return (
    <PageShell title="KPI Dashboard" subtitle="Real-time platform performance metrics and business intelligence">
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map(s => (
          <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 500 }}>{s.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Monthly GGR by Provider</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ggrData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                <ReTooltip formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="Pragmatic" fill={theme.palette.primary.main} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Evolution" fill={theme.palette.secondary.main} radius={[3, 3, 0, 0]} />
                <Bar dataKey="PGSoft" fill={theme.palette.success.main} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Hacksaw" fill={theme.palette.warning.main} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Player Retention Trend (%)</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={retentionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="d1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="d7" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="d30" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <ReTooltip formatter={(v: number) => [`${v}%`, '']} />
                <Legend />
                <Area type="monotone" dataKey="D1" name="Day 1" stroke={theme.palette.primary.main} fill="url(#d1)" strokeWidth={2} />
                <Area type="monotone" dataKey="D7" name="Day 7" stroke={theme.palette.success.main} fill="url(#d7)" strokeWidth={2} />
                <Area type="monotone" dataKey="D30" name="Day 30" stroke={theme.palette.warning.main} fill="url(#d30)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Top 5 Operators by GGR (MTD)</Typography>
          <Paper elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell><Typography variant="caption" fontWeight={700}>#</Typography></TableCell>
                  <TableCell><Typography variant="caption" fontWeight={700}>Operator</Typography></TableCell>
                  <TableCell align="right"><Typography variant="caption" fontWeight={700}>GGR</Typography></TableCell>
                  <TableCell align="right"><Typography variant="caption" fontWeight={700}>Players</Typography></TableCell>
                  <TableCell align="right"><Typography variant="caption" fontWeight={700}>Margin %</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topOperators.map((op, i) => (
                  <TableRow key={op.name} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{i + 1}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{op.name}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2">${op.ggr.toLocaleString()}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2">{op.players.toLocaleString()}</Typography></TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2" color="success.main" fontWeight={600}>{op.margin}%</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>
    </PageShell>
  );
}