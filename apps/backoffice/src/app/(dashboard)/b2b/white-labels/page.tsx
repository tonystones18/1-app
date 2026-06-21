'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';
const mock: Record<string, unknown>[] = [
  { id: '1', name: 'BetZone Casino', domain: 'casino.betzone.com', status: 'published', players: 8400, theme: 'Dark Blue', languages: 'EN, ES, FR' },
  { id: '2', name: 'Spin Palace', domain: 'spinpalace.eu', status: 'draft', players: 0, theme: 'Purple', languages: 'EN, DE' },
  { id: '3', name: 'Lucky Star', domain: 'luckystar.io', status: 'published', players: 3200, theme: 'Gold', languages: 'EN, ZH, JA' },
];
const columns: GridColDef[] = [
  { field: 'name', headerName: 'White Label', flex: 1, minWidth: 180 },
  { field: 'domain', headerName: 'Domain', width: 200 },
  { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'players', headerName: 'Players', width: 100, align: 'right', headerAlign: 'right', valueFormatter: (v) => Number(v).toLocaleString() },
  { field: 'theme', headerName: 'Theme', width: 120 },
  { field: 'languages', headerName: 'Languages', flex: 1 },
];
export default function WhiteLabelsPage() {
  return <PageShell title="White Labels" subtitle="Branded sites, theme builder, domains, provider packs, and localization" actions={<AddButton label="Create White Label" />}><DataTable rows={mock} columns={columns} /></PageShell>;
}
