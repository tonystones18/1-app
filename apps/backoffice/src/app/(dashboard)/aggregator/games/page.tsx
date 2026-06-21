'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { PageShell, DataTable, StatusChip } from '@/components/ui/DataTable';

const mock = [
  { id: '1', name: 'Gates of Olympus', provider: 'Pragmatic Play', category: 'Slots', rtp: '96.50%', volatility: 'High', status: 'ACTIVE', jurisdictions: 42 },
  { id: '2', name: 'Sweet Bonanza', provider: 'Pragmatic Play', category: 'Slots', rtp: '96.51%', volatility: 'High', status: 'ACTIVE', jurisdictions: 38 },
  { id: '3', name: 'Lightning Roulette', provider: 'Evolution', category: 'Live Casino', rtp: '97.30%', volatility: 'Low', status: 'ACTIVE', jurisdictions: 55 },
  { id: '4', name: 'Crazy Time', provider: 'Evolution', category: 'Game Shows', rtp: '96.08%', volatility: 'High', status: 'ACTIVE', jurisdictions: 50 },
  { id: '5', name: 'Mahjong Ways', provider: 'PG Soft', category: 'Slots', rtp: '96.71%', volatility: 'High', status: 'ACTIVE', jurisdictions: 33 },
];

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Game Name', flex: 1, minWidth: 200 },
  { field: 'provider', headerName: 'Provider', width: 160 },
  { field: 'category', headerName: 'Category', width: 130, renderCell: ({ value }) => <Chip label={String(value)} size="small" color="info" variant="outlined" /> },
  { field: 'rtp', headerName: 'RTP', width: 90, align: 'right', headerAlign: 'right' },
  { field: 'volatility', headerName: 'Volatility', width: 110 },
  { field: 'status', headerName: 'Status', width: 100, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'jurisdictions', headerName: 'Jurisdictions', width: 120, align: 'right', headerAlign: 'right' },
];

export default function GamesPage() {
  return (
    <PageShell title="Game Catalog" subtitle="Master game catalog with RTP, jurisdictions, and provider mappings">
      <DataTable rows={mock as Record<string, unknown>[]} columns={columns} />
    </PageShell>
  );
}
