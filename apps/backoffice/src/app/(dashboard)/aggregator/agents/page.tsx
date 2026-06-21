'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';
const mock: Record<string, unknown>[] = [
  { id: '1', code: 'agent001', name: 'Alpha Gaming Group', status: 'ACTIVE', operators: 4, commission: '$12,400' },
  { id: '2', code: 'agent002', name: 'Beta Distribution', status: 'ACTIVE', operators: 2, commission: '$7,800' },
];
const columns: GridColDef[] = [
  { field: 'code', headerName: 'Code', width: 130, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
  { field: 'name', headerName: 'Agent Name', flex: 1, minWidth: 160 },
  { field: 'status', headerName: 'Status', width: 110, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'operators', headerName: 'Operators', width: 100, align: 'center', headerAlign: 'center' },
  { field: 'commission', headerName: 'Commission (30d)', width: 160, align: 'right', headerAlign: 'right' },
];
export default function AgentsPage() {
  return <PageShell title="Agents" subtitle="Agent hierarchy, assigned operators, commission plans, and payouts" actions={<AddButton label="Add Agent" />}><DataTable rows={mock} columns={columns} /></PageShell>;
}
