'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';
const mock: Record<string, unknown>[] = [
  { id: '1', code: 'aff001', name: 'Casino Reviews Pro', status: 'active', model: 'revenue_share', registrations: 842, ftd: 210, commission: '$8,400' },
  { id: '2', code: 'aff002', name: 'Slots Insider', status: 'active', model: 'cpa', registrations: 420, ftd: 105, commission: '$5,250' },
  { id: '3', code: 'aff003', name: 'Bet Guide EU', status: 'pending', model: 'hybrid', registrations: 0, ftd: 0, commission: '$0' },
];
const columns: GridColDef[] = [
  { field: 'code', headerName: 'Code', width: 100 },
  { field: 'name', headerName: 'Affiliate', flex: 1 },
  { field: 'status', headerName: 'Status', width: 110, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'model', headerName: 'Model', width: 150 },
  { field: 'registrations', headerName: 'Registrations', width: 130, align: 'right', headerAlign: 'right' },
  { field: 'ftd', headerName: 'FTDs', width: 90, align: 'right', headerAlign: 'right' },
  { field: 'commission', headerName: 'Commission (30d)', width: 170, align: 'right', headerAlign: 'right' },
];
export default function AffiliatesPage() {
  return <PageShell title="Affiliates" subtitle="Affiliate profiles, campaigns, tracking links, commissions, and payouts" actions={<AddButton label="Add Affiliate" />}><DataTable rows={mock} columns={columns} /></PageShell>;
}
