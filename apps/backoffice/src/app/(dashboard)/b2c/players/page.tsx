'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';
const mock = [
  { id: '1', email: 'player1@example.com', country: 'GB', currency: 'GBP', status: 'ACTIVE', kycStatus: 'PASSED', balance: '£234.50', createdAt: '2026-05-12' },
  { id: '2', email: 'player2@example.com', country: 'MT', currency: 'EUR', status: 'ACTIVE', kycStatus: 'IN_PROGRESS', balance: '€89.00', createdAt: '2026-06-01' },
  { id: '3', email: 'player3@example.com', country: 'US', currency: 'USD', status: 'SUSPENDED', kycStatus: 'FAILED', balance: '$0.00', createdAt: '2026-04-22' },
  { id: '4', email: 'highroller@example.com', country: 'CY', currency: 'EUR', status: 'ACTIVE', kycStatus: 'PASSED', balance: '€12,450.00', createdAt: '2026-03-15' },
];
const columns: GridColDef[] = [
  { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
  { field: 'country', headerName: 'Country', width: 90 },
  { field: 'currency', headerName: 'Currency', width: 90 },
  { field: 'status', headerName: 'Status', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'kycStatus', headerName: 'KYC', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'balance', headerName: 'Balance', width: 120, align: 'right', headerAlign: 'right' },
  { field: 'createdAt', headerName: 'Registered', width: 130 },
];
export default function PlayersPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['players'],
    queryFn: () => apiGet<{ players: typeof mock }>('/b2c/players').catch(() => ({ players: mock })),
  });
  return (
    <PageShell title="Players" subtitle="Player accounts, profiles, KYC status, and account history" actions={<AddButton label="Add Player" />}>
      <DataTable rows={(data?.players ?? mock) as Record<string, unknown>[]} columns={columns} loading={isLoading} onRefresh={() => void refetch()} />
    </PageShell>
  );
}
