'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { PageShell, DataTable, StatusChip } from '@/components/ui/DataTable';

interface Payment { id: string; txRef: string; player: string; method: string; type: string; amount: number; currency: string; status: string; pspRef: string; createdAt: string; }

const typeColor: Record<string, 'success'|'warning'> = { DEPOSIT: 'success', WITHDRAWAL: 'warning' };
const _methodColor: Record<string, string> = { VISA: 'primary', MASTERCARD: 'secondary', SKRILL: 'info', NETELLER: 'info', CRYPTO: 'warning', BANK_TRANSFER: 'default' };

const mockPayments: Payment[] = [
  { id: '1', txRef: 'PAY-20260621-8841', player: 'highroller_mt', method: 'VISA', type: 'DEPOSIT', amount: 5000, currency: 'USD', status: 'COMPLETED', pspRef: 'STR-pi_3PXa2B', createdAt: '2026-06-21 14:23' },
  { id: '2', txRef: 'PAY-20260621-8842', player: 'poker_pro_cy', method: 'BANK_TRANSFER', type: 'WITHDRAWAL', amount: 2000, currency: 'EUR', status: 'PENDING', pspRef: 'BSP-wt_88421', createdAt: '2026-06-21 13:58' },
  { id: '3', txRef: 'PAY-20260621-8843', player: 'slots_fan_gb', method: 'MASTERCARD', type: 'DEPOSIT', amount: 150, currency: 'GBP', status: 'COMPLETED', pspRef: 'STR-pi_3PXa3C', createdAt: '2026-06-21 12:10' },
  { id: '4', txRef: 'PAY-20260621-8844', player: 'new_player_no', method: 'VISA', type: 'DEPOSIT', amount: 150, currency: 'USD', status: 'FAILED', pspRef: 'STR-pi_FAIL01', createdAt: '2026-06-21 11:44' },
  { id: '5', txRef: 'PAY-20260620-8820', player: 'bigwin_se', method: 'CRYPTO', type: 'WITHDRAWAL', amount: 8000, currency: 'USD', status: 'PROCESSING', pspRef: 'NP-tx_4a2b1c', createdAt: '2026-06-20 22:17' },
  { id: '6', txRef: 'PAY-20260620-8810', player: 'vip_dk', method: 'SKRILL', type: 'DEPOSIT', amount: 1000, currency: 'EUR', status: 'COMPLETED', pspRef: 'SKL-tx_99821', createdAt: '2026-06-20 19:05' },
  { id: '7', txRef: 'PAY-20260620-8808', player: 'casual_player_fi', method: 'MASTERCARD', type: 'DEPOSIT', amount: 200, currency: 'EUR', status: 'COMPLETED', pspRef: 'STR-pi_3PXa9D', createdAt: '2026-06-20 18:30' },
  { id: '8', txRef: 'PAY-20260620-8805', player: 'bigwin_se', method: 'NETELLER', type: 'WITHDRAWAL', amount: 3000, currency: 'EUR', status: 'COMPLETED', pspRef: 'NTL-wd_77112', createdAt: '2026-06-20 15:10' },
  { id: '9', txRef: 'PAY-20260619-8780', player: 'live_lover_de', method: 'VISA', type: 'DEPOSIT', amount: 250, currency: 'EUR', status: 'COMPLETED', pspRef: 'STR-pi_3PXb1A', createdAt: '2026-06-19 20:44' },
  { id: '10', txRef: 'PAY-20260619-8775', player: 'highroller_mt', method: 'CRYPTO', type: 'DEPOSIT', amount: 10000, currency: 'USD', status: 'COMPLETED', pspRef: 'NP-tx_5c3d2e', createdAt: '2026-06-19 18:22' },
];

export default function PaymentsPage() {
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Payment | null>(null);

  const openView = (row: Payment) => { setSelected(row); setViewOpen(true); };

  const totalDep = mockPayments.filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED').reduce((a, r) => a + r.amount, 0);
  const totalWith = mockPayments.filter(t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED').reduce((a, r) => a + r.amount, 0);
  const pending = mockPayments.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length;
  const failed = mockPayments.filter(t => t.status === 'FAILED').length;
  const stats = [
    { label: 'Total Deposits', value: `$${totalDep.toLocaleString()}` },
    { label: 'Total Withdrawals', value: `$${totalWith.toLocaleString()}` },
    { label: 'Pending', value: String(pending) },
    { label: 'Failed', value: String(failed) },
  ];

  const columns: GridColDef[] = [
    { field: 'txRef', headerName: 'Tx Reference', width: 200, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'player', headerName: 'Player', width: 160 },
    { field: 'type', headerName: 'Type', width: 120, renderCell: ({ value }) => <Chip label={String(value)} size="small" color={typeColor[String(value)] ?? 'default'} /> },
    { field: 'method', headerName: 'Method', width: 130 },
    { field: 'amount', headerName: 'Amount', width: 120, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    { field: 'currency', headerName: 'CCY', width: 70 },
    { field: 'status', headerName: 'Status', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'pspRef', headerName: 'PSP Ref', width: 160, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(value)}</code> },
    { field: 'createdAt', headerName: 'Created', flex: 1, minWidth: 160 },
    {
      field: 'actions', headerName: 'Actions', width: 100, sortable: false, renderCell: ({ row }) => (
        <Stack sx={{ height: '100%', justifyContent: 'center' }}>
          <Button size="small" onClick={() => openView(row as Payment)}>View</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Payments" subtitle="Deposits, withdrawals, PSP routing, and approval workflow">
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
      <DataTable rows={mockPayments as unknown as Record<string, unknown>[]} columns={columns} />

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {selected && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Reference', selected.txRef], ['Player', selected.player], ['Type', selected.type], ['Method', selected.method], ['Amount', `${selected.currency} ${selected.amount.toLocaleString()}`], ['Status', selected.status], ['PSP Reference', selected.pspRef], ['Created At', selected.createdAt]] as [string, string][]).map(([k, v]) => (
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