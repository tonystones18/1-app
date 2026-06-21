'use client';
import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { PageShell } from '@/components/ui/DataTable';

const kpis = [
  { code: 'GGR', name: 'Gross Gaming Revenue', formula: 'SUM(bets) - SUM(wins)', category: 'B2C', value: '—', target: '—', pct: 0 },
  { code: 'NGR', name: 'Net Gaming Revenue', formula: 'GGR - bonus_cost - fees', category: 'B2C', value: '—', target: '—', pct: 0 },
  { code: 'ARPU', name: 'Avg Revenue Per User', formula: 'GGR / active_players', category: 'B2C', value: '—', target: '—', pct: 0 },
  { code: 'PROVIDER_MARGIN', name: 'Provider Margin', formula: '(sell_bps - buy_bps) / sell_bps', category: 'Aggregator', value: '—', target: '15%+', pct: 0 },
  { code: 'ROUTE_SUCCESS', name: 'Route Success Rate', formula: 'successful / total_decisions', category: 'Operations', value: '—', target: '99%+', pct: 0 },
  { code: 'DEPOSIT_RATE', name: 'Deposit Acceptance Rate', formula: 'completed / attempted', category: 'Payments', value: '—', target: '95%+', pct: 0 },
  { code: 'CHURN_RATE', name: 'Player Churn Rate', formula: 'churned / active_start', category: 'B2C', value: '—', target: '<5%', pct: 0 },
  { code: 'BONUS_RATIO', name: 'Bonus Cost Ratio', formula: 'bonus_cost / GGR', category: 'B2C', value: '—', target: '<20%', pct: 0 },
];

const catColor: Record<string, string> = { 'B2C': '#2563eb', 'Aggregator': '#7c3aed', 'Operations': '#059669', 'Payments': '#d97706' };

export default function KPIPage() {
  return (
    <PageShell title="KPI Dashboard" subtitle="Governed KPI definitions, values, and targets">
      <Grid container spacing={2}>
        {kpis.map((k) => (
          <Grid key={k.code} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: catColor[k.category] ?? 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {k.category}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{k.code}</Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{k.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontFamily: 'monospace' }}>{k.formula}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{k.value}</Typography>
                  <Typography variant="caption" color="text.secondary">Target: {k.target}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={k.pct} sx={{ borderRadius: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageShell>
  );
}
