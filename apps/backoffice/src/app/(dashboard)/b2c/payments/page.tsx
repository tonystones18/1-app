'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { PageShell, DataTable, StatusChip } from '@/components/ui/DataTable';
const mock: Record<string, unknown>[] = [
  { id: 'pay_001', direction: 'deposit', amount: '£200.00', method: 'Card', psp: 'Stripe', status: 'completed', createdAt: '2026-06-21 14:23' },
  { id: 'pay_002', direction: 'withdrawal', amount: '€50.00', method: 'Bank Transfer', psp: 'PassimPay', status: 'pending', createdAt: '2026-06-21 12:10' },
  { id: 'pay_003', direction: 'deposit', amount: '£100.00', method: 'Card', psp: 'Stripe', status: 'failed', createdAt: '2026-06-20 09:45' },
  { id: 'pay_004', direction: 'deposit', amount: '€500.00', method: 'Crypto USDT', psp: 'NowPayments', status: 'completed', createdAt: '2026-06-20 08:30' },
];
const columns: GridColDef[] = [
  { field: 'id', headerName: 'Payment ID', width: 140, renderCell: ({ value }) => <code style={{ fontSize: 11, fontFamily: 'monospace' }}>{String(value)}</code> },
  { field: 'direction', headerName: 'Type', width: 110, renderCell: ({ value }) => <Chip label={String(value)} size="small" color={value === 'deposit' ? 'success' : 'info'} /> },
  { field: 'amount', headerName: 'Amount', width: 120, align: 'right', headerAlign: 'right' },
  { field: 'method', headerName: 'Method', width: 140 },
  { field: 'psp', headerName: 'PSP', width: 120 },
  { field: 'status', headerName: 'Status', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'createdAt', headerName: 'Created', flex: 1, minWidth: 150 },
];
export default function PaymentsPage() {
  return <PageShell title="Payments" subtitle="Deposits, withdrawals, PSP routing, and approval workflow"><DataTable rows={mock} columns={columns} /></PageShell>;
}
