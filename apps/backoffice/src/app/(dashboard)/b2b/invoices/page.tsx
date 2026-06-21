'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';
const mock: Record<string, unknown>[] = [
  { id: '1', number: 'INV-202606-00123', operator: 'BetZone Ltd', total: '$20,400.00', status: 'issued', issuedAt: '2026-06-20', dueAt: '2026-07-15' },
  { id: '2', number: 'INV-202606-00122', operator: 'Spin Palace', total: '€12,800.00', status: 'paid', issuedAt: '2026-06-01', dueAt: '2026-07-01' },
  { id: '3', number: 'INV-202605-00110', operator: 'Casino Max', total: '£5,200.00', status: 'overdue', issuedAt: '2026-05-20', dueAt: '2026-06-15' },
];
const columns: GridColDef[] = [
  { field: 'number', headerName: 'Invoice #', width: 210, renderCell: ({ value }) => <code style={{ fontSize: 12, fontFamily: 'monospace' }}>{String(value)}</code> },
  { field: 'operator', headerName: 'Operator', flex: 1 },
  { field: 'total', headerName: 'Total', width: 130, align: 'right', headerAlign: 'right' },
  { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'issuedAt', headerName: 'Issued', width: 130 },
  { field: 'dueAt', headerName: 'Due Date', width: 130 },
];
export default function InvoicesPage() {
  return <PageShell title="Invoices" subtitle="Operator billing, credit notes, aging, and payment tracking" actions={<AddButton label="Create Invoice" />}><DataTable rows={mock} columns={columns} /></PageShell>;
}
