'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';
const mock: Record<string, unknown>[] = [
  { id: '1', code: 'casino-primary', type: 'GAME_LAUNCH', provider: 'Pragmatic Play', priority: 'PRIMARY', status: 'ACTIVE', successRate: '99.2%' },
  { id: '2', code: 'casino-fallback', type: 'GAME_LAUNCH', provider: 'PG Soft', priority: 'FALLBACK', status: 'ACTIVE', successRate: '98.7%' },
  { id: '3', code: 'live-primary', type: 'GAME_LAUNCH', provider: 'Evolution', priority: 'PRIMARY', status: 'ACTIVE', successRate: '99.8%' },
  { id: '4', code: 'payment-usd', type: 'PAYMENT', provider: 'Stripe', priority: 'PRIMARY', status: 'ACTIVE', successRate: '97.4%' },
];
const columns: GridColDef[] = [
  { field: 'code', headerName: 'Policy Code', width: 180, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
  { field: 'type', headerName: 'Route Type', width: 130, renderCell: ({ value }) => <Chip label={String(value)} size="small" color="info" variant="outlined" /> },
  { field: 'provider', headerName: 'Provider', flex: 1, minWidth: 150 },
  { field: 'priority', headerName: 'Priority', width: 110, renderCell: ({ value }) => <Chip label={String(value)} size="small" variant="outlined" /> },
  { field: 'status', headerName: 'Status', width: 100, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'successRate', headerName: 'Success Rate', width: 130, align: 'right', headerAlign: 'right' },
];
export default function RoutesPage() {
  return <PageShell title="Route Center" subtitle="Game launch, wallet, callback, and payment route policies" actions={<AddButton label="New Policy" />}><DataTable rows={mock} columns={columns} /></PageShell>;
}
