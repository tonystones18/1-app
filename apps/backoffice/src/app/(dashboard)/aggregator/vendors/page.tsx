'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

const mock = [
  { id: '1', code: 'pragmaticgroup', name: 'Pragmatic Group', status: 'ACTIVE', providers: 2, games: 512, currency: 'USD' },
  { id: '2', code: 'evolutiongroup', name: 'Evolution Group', status: 'ACTIVE', providers: 3, games: 300, currency: 'EUR' },
  { id: '3', code: 'pggroup', name: 'PG Holdings', status: 'ACTIVE', providers: 1, games: 220, currency: 'USD' },
];

const columns: GridColDef[] = [
  { field: 'code', headerName: 'Code', width: 160, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
  { field: 'name', headerName: 'Vendor Name', flex: 1, minWidth: 180 },
  { field: 'status', headerName: 'Status', width: 110, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'providers', headerName: 'Providers', width: 100, align: 'right', headerAlign: 'right' },
  { field: 'games', headerName: 'Games', width: 100, align: 'right', headerAlign: 'right' },
  { field: 'currency', headerName: 'Currency', width: 100 },
];

export default function VendorsPage() {
  return (
    <PageShell title="Vendors" subtitle="Game studio and vendor relationships, contracts, and commercial terms" actions={<AddButton label="Add Vendor" />}>
      <DataTable rows={mock as Record<string, unknown>[]} columns={columns} />
    </PageShell>
  );
}
