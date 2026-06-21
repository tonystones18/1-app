'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

// Fallback mock data for when the API isn't available yet
const mockProviders = [
  { id: '1', code: 'pragmatic', name: 'Pragmatic Play', status: 'ACTIVE', metadata: { walletMode: 'seamless', games: 312, health: 'ok' } },
  { id: '2', code: 'evolution', name: 'Evolution Gaming', status: 'ACTIVE', metadata: { walletMode: 'seamless', games: 180, health: 'ok' } },
  { id: '3', code: 'pgsoft', name: 'PG Soft', status: 'ACTIVE', metadata: { walletMode: 'transfer', games: 220, health: 'ok' } },
  { id: '4', code: 'hacksaw', name: 'Hacksaw Gaming', status: 'ACTIVE', metadata: { walletMode: 'seamless', games: 78, health: 'degraded' } },
  { id: '5', code: 'amusnet', name: 'Amusnet Interactive', status: 'DRAFT', metadata: { walletMode: 'transfer', games: 95, health: 'ok' } },
  { id: '6', code: 'jili', name: 'JILI Games', status: 'ACTIVE', metadata: { walletMode: 'seamless', games: 140, health: 'ok' } },
];

const columns: GridColDef[] = [
  { field: 'code', headerName: 'Code', width: 130, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
  { field: 'name', headerName: 'Provider Name', flex: 1, minWidth: 180 },
  { field: 'status', headerName: 'Status', width: 110, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'walletMode', headerName: 'Wallet Mode', width: 130, valueGetter: (_, row) => (row.metadata as Record<string, unknown>)?.walletMode ?? '—', renderCell: ({ value }) => <Chip label={String(value)} size="small" variant="outlined" /> },
  { field: 'games', headerName: 'Games', width: 90, align: 'right', headerAlign: 'right', valueGetter: (_, row) => (row.metadata as Record<string, unknown>)?.games ?? 0 },
  { field: 'health', headerName: 'Health', width: 100, valueGetter: (_, row) => (row.metadata as Record<string, unknown>)?.health ?? '—', renderCell: ({ value }) => <StatusChip status={String(value)} /> },
];

export default function ProvidersPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['providers'],
    queryFn: () => apiGet<{ providers: typeof mockProviders }>('/aggregator/providers'),
  });

  const rows = (data?.providers ?? mockProviders) as Record<string, unknown>[];

  return (
    <PageShell
      title="Providers"
      subtitle="Game provider integrations, health monitoring, and configuration"
      actions={<AddButton label="Add Provider" />}
    >
      <DataTable
        rows={rows}
        columns={columns}
        loading={isLoading}
        error={error ? 'Using mock data — connect API gateway to load live providers' : null}
        onRefresh={() => void refetch()}
      />
    </PageShell>
  );
}
