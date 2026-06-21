'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { PageShell, DataTable, StatusChip } from '@/components/ui/DataTable';
const mock: Record<string, unknown>[] = [
  { id: '1', walletId: 'wlt_abc123', type: 'deposit', balanceType: 'cash', direction: 'credit', amount: '£200.00', runningBalance: '£234.50', postedAt: '2026-06-21 09:15' },
  { id: '2', walletId: 'wlt_def456', type: 'bet', balanceType: 'cash', direction: 'debit', amount: '€25.00', runningBalance: '€64.00', postedAt: '2026-06-21 09:12' },
  { id: '3', walletId: 'wlt_def456', type: 'win', balanceType: 'cash', direction: 'credit', amount: '€75.00', runningBalance: '€139.00', postedAt: '2026-06-21 09:12' },
  { id: '4', walletId: 'wlt_ghi789', type: 'bonus_grant', balanceType: 'bonus', direction: 'credit', amount: '$100.00', runningBalance: '$100.00', postedAt: '2026-06-21 08:55' },
  { id: '5', walletId: 'wlt_abc123', type: 'withdrawal', balanceType: 'cash', direction: 'debit', amount: '£50.00', runningBalance: '£184.50', postedAt: '2026-06-21 08:30' },
];
const columns: GridColDef[] = [
  { field: 'walletId', headerName: 'Wallet', width: 160, renderCell: ({ value }) => <code style={{ fontSize: 11, fontFamily: 'monospace' }}>{String(value)}</code> },
  { field: 'type', headerName: 'Type', width: 130, renderCell: ({ value }) => <Chip label={String(value).replace('_', ' ')} size="small" variant="outlined" /> },
  { field: 'balanceType', headerName: 'Balance Type', width: 130, renderCell: ({ value }) => <Chip label={String(value)} size="small" color="info" variant="outlined" /> },
  { field: 'direction', headerName: 'Dir', width: 80, renderCell: ({ value }) => <span style={{ color: value === 'credit' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{String(value)}</span> },
  { field: 'amount', headerName: 'Amount', width: 130, align: 'right', headerAlign: 'right' },
  { field: 'runningBalance', headerName: 'Running Balance', width: 160, align: 'right', headerAlign: 'right' },
  { field: 'postedAt', headerName: 'Posted', flex: 1, minWidth: 160 },
];
export default function WalletsPage() {
  return <PageShell title="Wallets & Ledger" subtitle="Double-entry ledger, balance types, holds, and reconciliation"><DataTable rows={mock} columns={columns} height={560} /></PageShell>;
}
