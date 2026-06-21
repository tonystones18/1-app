'use client';
import React from 'react';
import { Grid, Card, CardContent, CardActionArea, Typography, Box, Chip, Button } from '@mui/material';
import { BarChart, Download } from '@mui/icons-material';
import { PageShell } from '@/components/ui/DataTable';

const reports = [
  { code: 'PROVIDER_PL', name: 'Provider P&L', domain: 'Aggregator', description: 'Revenue, cost, margin, fees by provider', formats: ['JSON', 'CSV', 'XLSX'] },
  { code: 'OPERATOR_PL', name: 'Operator P&L', domain: 'Aggregator', description: 'Operator revenue, costs, bonuses per period', formats: ['JSON', 'CSV', 'XLSX'] },
  { code: 'GGR_REPORT', name: 'GGR Report', domain: 'B2C', description: 'Gross gaming revenue by operator, game, cohort', formats: ['JSON', 'CSV', 'XLSX', 'PDF'] },
  { code: 'DEPOSITS_REPORT', name: 'Deposits Report', domain: 'B2C', description: 'Deposit volume, acceptance, PSP breakdown', formats: ['JSON', 'CSV', 'XLSX'] },
  { code: 'COMPLIANCE_KYC', name: 'KYC Compliance', domain: 'Compliance', description: 'KYC queue status, document approvals, evidence', formats: ['JSON', 'CSV', 'PDF'] },
  { code: 'SETTLEMENT_REPORT', name: 'Settlement Report', domain: 'Finance', description: 'Provider, vendor, operator settlement reconciliation', formats: ['JSON', 'CSV', 'XLSX'] },
];

const domainColors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  Aggregator: 'primary', B2C: 'success', Compliance: 'warning', Finance: 'info',
};

export default function ReportsPage() {
  return (
    <PageShell title="Reports" subtitle="Governed reports for Aggregator, B2C, B2B, Finance, and Compliance">
      <Grid container spacing={2}>
        {reports.map((r) => (
          <Grid key={r.code} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                  <Chip label={r.domain} size="small" color={domainColors[r.domain] ?? 'default'} />
                  {r.formats.map((f) => <Chip key={f} label={f} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />)}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{r.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{r.description}</Typography>
                <Button size="small" variant="outlined" startIcon={<Download />}>Generate Report</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageShell>
  );
}
