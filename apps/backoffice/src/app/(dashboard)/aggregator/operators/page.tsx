'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

const kpis = [{ label: 'Total Operators', value: '3' }, { label: 'Active', value: '2' }, { label: 'Total Players', value: '24,300' }, { label: 'GGR (30d)', value: '$153,300' }];

const mock = [
  { id: '1', code: 'betzone', name: 'BetZone Ltd', status: 'ACTIVE', currency: 'USD', players: 12400, ggr: '$84,300', providers: 8 },
  { id: '2', code: 'spinpalace', name: 'Spin Palace', status: 'ACTIVE', currency: 'EUR', players: 8700, ggr: '€56,200', providers: 6 },
  { id: '3', code: 'casinomax', name: 'Casino Max', status: 'SUSPENDED', currency: 'GBP', players: 3200, ggr: '£12,800', providers: 4 },
];

const columns: GridColDef[] = [
  { field: 'code', headerName: 'Code', width: 120, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
  { field: 'name', headerName: 'Operator', flex: 1, minWidth: 160 },
  { field: 'status', headerName: 'Status', width: 110, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'currency', headerName: 'Currency', width: 100 },
  { field: 'players', headerName: 'Players', width: 100, align: 'right', headerAlign: 'right', valueFormatter: (value) => Number(value).toLocaleString() },
  { field: 'ggr', headerName: 'GGR (30d)', width: 130, align: 'right', headerAlign: 'right' },
  { field: 'providers', headerName: 'Providers', width: 100, align: 'center', headerAlign: 'center' },
];

export default function OperatorsPage() {
  return (
    <PageShell title="Operators" subtitle="Operator accounts, commercial terms, provider assignments, and performance" actions={<AddButton label="Add Operator" />}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k) => (
          <Grid key={k.label} size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', textAlign: 'center', py: 1 }}>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 500 }}>{k.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>{k.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <DataTable rows={mock as Record<string, unknown>[]} columns={columns} />
    </PageShell>
  );
}
