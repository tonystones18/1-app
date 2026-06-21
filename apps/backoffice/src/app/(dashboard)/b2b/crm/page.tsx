'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';
const mock: Record<string, unknown>[] = [
  { id: '1', company: 'BetZone Ltd', country: 'MT', status: 'active', assignedTo: 'John Smith', contractValue: '$240,000/yr', lastActivity: '2026-06-20' },
  { id: '2', company: 'Spin Palace SRL', country: 'CY', status: 'onboarding', assignedTo: 'Maria Garcia', contractValue: '$120,000/yr', lastActivity: '2026-06-18' },
  { id: '3', company: 'Casino Max Ltd', country: 'GB', status: 'at_risk', assignedTo: 'David Lee', contractValue: '$60,000/yr', lastActivity: '2026-06-10' },
];
const columns: GridColDef[] = [
  { field: 'company', headerName: 'Company', flex: 1 },
  { field: 'country', headerName: 'Country', width: 100 },
  { field: 'status', headerName: 'Lifecycle', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'assignedTo', headerName: 'Account Manager', width: 170 },
  { field: 'contractValue', headerName: 'Contract Value', width: 150, align: 'right', headerAlign: 'right' },
  { field: 'lastActivity', headerName: 'Last Activity', width: 130 },
];
export default function CRMPage() {
  return <PageShell title="Operator CRM" subtitle="B2B account lifecycle, contacts, activities, and pipeline management" actions={<AddButton label="Add Account" />}><DataTable rows={mock} columns={columns} /></PageShell>;
}
