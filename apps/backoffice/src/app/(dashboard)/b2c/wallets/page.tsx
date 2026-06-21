'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { PageShell, DataTable, StatusChip } from '@/components/ui/DataTable';

interface WalletTx { id: string; txId: string; player: string; type: string; amount: number; currency: string; balance: number; status: string; createdAt: string; }

const typeColors: Record<string, 'default'|'primary'|'secondary'|'success'|'warning'|'error'|'info'> = {
  DEPOSIT: 'success', WITHDRAWAL: 'warning', BET: 'info', WIN: 'primary', BONUS: 'secondary', ADJUSTMENT: 'default',
};

const mockTxns: WalletTx[] = [
  { id: '1', txId: 'WTX-20260621-001', player: 'highroller_mt', type: 'DEPOSIT', amount: 5000, currency: 'USD', balance: 17450, status: 'COMPLETED', createdAt: '2026-06-21 14:23' },
  { id: '2', txId: 'WTX-20260621-002', player: 'slots_fan_gb', type: 'BET', amount: -25, currency: 'GBP', balance: 209, status: 'COMPLETED', createdAt: '2026-06-21 14:15' },
  { id: '3', txId: 'WTX-20260621-003', player: 'slots_fan_gb', type: 'WIN', amount: 75, currency: 'GBP', balance: 284, status: 'COMPLETED', createdAt: '2026-06-21 14:15' },
  { id: '4', txId: 'WTX-20260621-004', player: 'poker_pro_cy', type: 'WITHDRAWAL', amount: -2000, currency: 'EUR', balance: 1820, status: 'PENDING', createdAt: '2026-06-21 13:58' },
  { id: '5', txId: 'WTX-20260621-005', player: 'new_player_no', type: 'DEPOSIT', amount: 150, currency: 'NOK', balance: 150, status: 'COMPLETED', createdAt: '2026-06-21 12:30' },
  { id: '6', txId: 'WTX-20260621-006', player: 'vip_dk', type: 'BONUS', amount: 200, currency: 'DKK', balance: 5840, status: 'COMPLETED', createdAt: '2026-06-21 11:44' },
  { id: '7', txId: 'WTX-20260620-007', player: 'bigwin_se', type: 'WIN', amount: 12400, currency: 'SEK', balance: 20600, status: 'COMPLETED', createdAt: '2026-06-20 22:17' },
  { id: '8', txId: 'WTX-20260620-008', player: 'casual_player_fi', type: 'DEPOSIT', amount: 200, currency: 'EUR', balance: 620, status: 'COMPLETED', createdAt: '2026-06-20 19:05' },
  { id: '9', txId: 'WTX-20260620-009', player: 'highroller_mt', type: 'WITHDRAWAL', amount: -8000, currency: 'USD', balance: 9450, status: 'FAILED', createdAt: '2026-06-20 17:30' },
  { id: '10', txId: 'WTX-20260620-010', player: 'live_lover_de', type: 'ADJUSTMENT', amount: 50, currency: 'EUR', balance: 139, status: 'COMPLETED', createdAt: '2026-06-20 15:10' },
];

export default function WalletsPage() {
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<WalletTx | null>(null);

  const openView = (row: WalletTx) => { setSelected(row); setViewOpen(true); };

  const totalDeposits = mockTxns.filter(t => t.type === 'DEPOSIT').reduce((a, r) => a + r.amount, 0);
  const totalWithdrawals = mockTxns.filter(t => t.type === 'WITHDRAWAL').reduce((a, r) => a + Math.abs(r.amount), 0);
  const pending = mockTxns.filter(t => t.status === 'PENDING').length;
  const totalVol = mockTxns.reduce((a, r) => a + Math.abs(r.amount), 0);
  const stats = [
    { label: 'Total Volume', value: `$${totalVol.toLocaleString()}` },
    { label: 'Deposits', value: `$${totalDeposits.toLocaleString()}` },
    { label: 'Withdrawals', value: `$${totalWithdrawals.toLocaleString()}` },
    { label: 'Pending Txs', value: String(pending) },
  ];

  const columns: GridColDef[] = [
    { field: 'txId', headerName: 'Tx ID', width: 200, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'player', headerName: 'Player', width: 160 },
    { field: 'type', headerName: 'Type', width: 120, renderCell: ({ value }) => <Chip label={String(value)} size="small" color={typeColors[String(value)] ?? 'default'} /> },
    { field: 'amount', headerName: 'Amount', width: 120, align: 'right', headerAlign: 'right', valueFormatter: (v) => Number(v) >= 0 ? `+${Number(v).toLocaleString()}` : Number(v).toLocaleString() },
    { field: 'currency', headerName: 'CCY', width: 70 },
    { field: 'balance', headerName: 'Balance', width: 120, align: 'right', headerAlign: 'right', valueFormatter: (v) => Number(v).toLocaleString() },
    { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'createdAt', headerName: 'Created At', flex: 1, minWidth: 160 },
    {
      field: 'actions', headerName: 'Actions', width: 100, sortable: false, renderCell: ({ row }) => (
        <Stack sx={{ height: '100%', justifyContent: 'center' }}>
          <Button size="small" onClick={() => openView(row as WalletTx)}>View</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Wallets & Ledger" subtitle="Double-entry ledger, balance types, holds, and reconciliation">
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map(s => (
          <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 500 }}>{s.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <DataTable rows={mockTxns as unknown as Record<string, unknown>[]} columns={columns} />

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selected && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Tx ID', selected.txId], ['Player', selected.player], ['Type', selected.type], ['Amount', `${selected.amount >= 0 ? '+' : ''}${selected.amount.toLocaleString()} ${selected.currency}`], ['Balance After', `${selected.balance.toLocaleString()} ${selected.currency}`], ['Status', selected.status], ['Created At', selected.createdAt]] as [string, string][]).map(([k, v]) => (
              <Stack key={k} direction="row" justifyContent="space-between">
                <Typography color="text.secondary" variant="body2">{k}</Typography>
                <Typography variant="body2" fontWeight={500}>{v}</Typography>
              </Stack>
            ))}
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setViewOpen(false)}>Close</Button></DialogActions>
      </Dialog>
    </PageShell>
  );
}