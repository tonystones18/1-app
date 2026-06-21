'use client';
import React from 'react';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { LinearProgress, Box, Typography } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';
const mock: Record<string, unknown>[] = [
  { id: 'b1', type: 'deposit_match', player: 'player1@example.com', amount: '£100.00', wageringDone: 1250, wageringReq: 3500, status: 'wagering', expiresAt: '2026-07-20' },
  { id: 'b2', type: 'free_spins', player: 'player2@example.com', amount: '€25.00', wageringDone: 25, wageringReq: 25, status: 'completed', expiresAt: '2026-07-01' },
  { id: 'b3', type: 'cashback', player: 'highroller@example.com', amount: '€500.00', wageringDone: 0, wageringReq: 500, status: 'active', expiresAt: '2026-08-01' },
];
const columns: GridColDef[] = [
  { field: 'type', headerName: 'Type', width: 150 },
  { field: 'player', headerName: 'Player', flex: 1, minWidth: 180 },
  { field: 'amount', headerName: 'Amount', width: 120, align: 'right', headerAlign: 'right' },
  {
    field: 'wagering', headerName: 'Wagering', width: 220,
    renderCell: (p: GridRenderCellParams) => {
      const pct = Math.min(100, Math.round(((p.row.wageringDone as number) / (p.row.wageringReq as number)) * 100));
      return (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
          <Typography variant="caption" sx={{ minWidth: 30 }}>{pct}%</Typography>
        </Box>
      );
    },
    valueGetter: (_, row) => `${row.wageringDone} / ${row.wageringReq}`,
  },
  { field: 'status', headerName: 'Status', width: 110, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'expiresAt', headerName: 'Expires', width: 120 },
];
export default function BonusesPage() {
  return <PageShell title="Bonuses" subtitle="Templates, player instances, wagering progress, and bonus cost analytics" actions={<AddButton label="Create Template" />}><DataTable rows={mock} columns={columns} /></PageShell>;
}
