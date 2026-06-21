'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { PageShell, DataTable, StatusChip } from '@/components/ui/DataTable';
const kpis = [{ label: 'Open KYC Cases', value: '47', color: '#dc2626' }, { label: 'AML Alerts', value: '12', color: '#dc2626' }, { label: 'Active RG Limits', value: '284', color: '#1e293b' }, { label: 'Self-Exclusions', value: '38', color: '#1e293b' }];
const kyc: Record<string, unknown>[] = [
  { id: '1', player: 'player2@example.com', level: 'basic', status: 'open', assignedTo: 'Unassigned', createdAt: '2026-06-21' },
  { id: '2', player: 'newplayer@example.com', level: 'enhanced', status: 'in_review', assignedTo: 'KYC Team', createdAt: '2026-06-20' },
  { id: '3', player: 'flagged@example.com', level: 'pep_sanctions', status: 'failed', assignedTo: 'Compliance', createdAt: '2026-06-19' },
];
const columns: GridColDef[] = [
  { field: 'player', headerName: 'Player', flex: 1 },
  { field: 'level', headerName: 'KYC Level', width: 150 },
  { field: 'status', headerName: 'Status', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'assignedTo', headerName: 'Assigned To', width: 160 },
  { field: 'createdAt', headerName: 'Opened', width: 130 },
];
export default function CompliancePage() {
  return (
    <PageShell title="Compliance & KYC" subtitle="KYC cases, AML alerts, responsible gaming limits, and self-exclusions">
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k) => (
          <Grid key={k.label} size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', textAlign: 'center', py: 1 }}>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 500 }}>{k.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: k.color }}>{k.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <DataTable rows={kyc} columns={columns} />
    </PageShell>
  );
}
