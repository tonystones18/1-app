'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';
const mock: Record<string, unknown>[] = [
  { id: '1', party: 'Pragmatic Play', partyType: 'provider', period: 'Jun 2026', amount: '$84,200', currency: 'USD', status: 'pending_review' },
  { id: '2', party: 'Evolution Gaming', partyType: 'provider', period: 'Jun 2026', amount: '€51,000', currency: 'EUR', status: 'draft' },
  { id: '3', party: 'BetZone Ltd', partyType: 'operator', period: 'Jun 2026', amount: '$20,400', currency: 'USD', status: 'approved' },
  { id: '4', party: 'Alpha Gaming Group', partyType: 'agent', period: 'Jun 2026', amount: '$12,400', currency: 'USD', status: 'completed' },
];
const columns: GridColDef[] = [
  { field: 'party', headerName: 'Party', flex: 1, minWidth: 160 },
  { field: 'partyType', headerName: 'Type', width: 110 },
  { field: 'period', headerName: 'Period', width: 130 },
  { field: 'amount', headerName: 'Net Amount', width: 140, align: 'right', headerAlign: 'right' },
  { field: 'currency', headerName: 'Currency', width: 100 },
  { field: 'status', headerName: 'Status', width: 140, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
];
export default function SettlementsPage() {
  return <PageShell title="Settlements" subtitle="Provider, vendor, operator, agent, and affiliate settlement cycles" actions={<AddButton label="New Cycle" />}><DataTable rows={mock} columns={columns} /></PageShell>;
}
