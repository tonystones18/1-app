'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface Affiliate { id: string; code: string; name: string; email: string; model: string; commissionRate: number; players: number; totalEarned: number; status: string; joinedAt: string; paymentMethod: string; bankDetails: string; }

const mockAffiliates: Affiliate[] = [
  { id: '1', code: 'AFF-001', name: 'Casino Affiliate Pro', email: 'contact@casinoaffiliatepro.com', model: 'REVENUE_SHARE', commissionRate: 35, players: 4820, totalEarned: 284000, status: 'ACTIVE', joinedAt: '2023-08-15', paymentMethod: 'Bank Transfer', bankDetails: 'GB29NWBK60161331926819' },
  { id: '2', code: 'AFF-002', name: 'Slots World Media', email: 'info@slotsworld.net', model: 'CPA', commissionRate: 150, players: 3240, totalEarned: 486000, status: 'ACTIVE', joinedAt: '2024-01-10', paymentMethod: 'Crypto USDT', bankDetails: 'TJQ6...wallet' },
  { id: '3', code: 'AFF-003', name: 'TopCasino Review', email: 'affiliates@topcasino.review', model: 'HYBRID', commissionRate: 25, players: 2180, totalEarned: 192000, status: 'ACTIVE', joinedAt: '2024-03-22', paymentMethod: 'Bank Transfer', bankDetails: 'DE89370400440532013000' },
  { id: '4', code: 'AFF-004', name: 'BonusHunter EU', email: 'admin@bonushunter.eu', model: 'REVENUE_SHARE', commissionRate: 30, players: 1640, totalEarned: 124000, status: 'ACTIVE', joinedAt: '2024-06-01', paymentMethod: 'Skrill', bankDetails: 'bonushunter@skrill.com' },
  { id: '5', code: 'AFF-005', name: 'Casino Kings Blog', email: 'webmaster@casinokings.blog', model: 'CPA', commissionRate: 120, players: 980, totalEarned: 117600, status: 'PAUSED', joinedAt: '2024-09-15', paymentMethod: 'Bank Transfer', bankDetails: 'FR7614508000000' },
  { id: '6', code: 'AFF-006', name: 'Nordic Gamblers', email: 'hello@nordicgamblers.no', model: 'REVENUE_SHARE', commissionRate: 40, players: 2840, totalEarned: 198400, status: 'ACTIVE', joinedAt: '2024-11-01', paymentMethod: 'Bank Transfer', bankDetails: 'NO9386011117947' },
  { id: '7', code: 'AFF-007', name: 'UK Casino Guide', email: 'partners@ukcasino.guide', model: 'HYBRID', commissionRate: 20, players: 4120, totalEarned: 312000, status: 'ACTIVE', joinedAt: '2023-12-01', paymentMethod: 'Bank Transfer', bankDetails: 'GB82WEST12345698765432' },
  { id: '8', code: 'AFF-008', name: 'SlotBoss Reviews', email: 'affiliate@slotboss.com', model: 'REVENUE_SHARE', commissionRate: 32, players: 880, totalEarned: 64000, status: 'SUSPENDED', joinedAt: '2025-02-14', paymentMethod: 'Crypto BTC', bankDetails: '1BvBMSEYstWetqTFn5Au4m...' },
];

const empty = (): Partial<Affiliate> => ({ code: '', name: '', email: '', model: 'REVENUE_SHARE', commissionRate: 30, players: 0, totalEarned: 0, status: 'ACTIVE', joinedAt: '', paymentMethod: 'Bank Transfer', bankDetails: '' });

export default function AffiliatesPage() {
  const [rows, setRows] = useState<Affiliate[]>(mockAffiliates);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Affiliate | null>(null);
  const [form, setForm] = useState<Partial<Affiliate>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: Affiliate) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openView = (row: Affiliate) => { setEditing(row); setViewOpen(true); };
  const openDelete = (row: Affiliate) => { setEditing(row); setDeleteOpen(true); };
  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as Affiliate : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as Affiliate]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof Affiliate) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const active = rows.filter(r => r.status === 'ACTIVE').length;
  const totalCommission = rows.reduce((a, r) => a + r.totalEarned, 0);
  const totalPlayers = rows.reduce((a, r) => a + r.players, 0);
  const stats = [
    { label: 'Total Affiliates', value: String(rows.length) },
    { label: 'Active', value: String(active) },
    { label: 'Commission Paid', value: `$${(totalCommission / 1000).toFixed(0)}K` },
    { label: 'Total Players', value: totalPlayers.toLocaleString() },
  ];

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 120, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'name', headerName: 'Affiliate', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'Email', width: 220 },
    { field: 'model', headerName: 'Model', width: 150, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'commissionRate', headerName: 'Rate', width: 90, align: 'right', headerAlign: 'right', valueFormatter: (v) => `${v}%` },
    { field: 'players', headerName: 'Players', width: 100, align: 'right', headerAlign: 'right', valueFormatter: (v) => Number(v).toLocaleString() },
    { field: 'totalEarned', headerName: 'Total Earned', width: 130, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    {
      field: 'actions', headerName: 'Actions', width: 210, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openView(row as Affiliate)}>View</Button>
          <Button size="small" onClick={() => openEdit(row as Affiliate)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row as Affiliate)}>Del</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Affiliates" subtitle="Affiliate program management, commission models, and performance" actions={<AddButton label="Add Affiliate" onClick={openAdd} />}>
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
      <DataTable rows={rows as unknown as Record<string, unknown>[]} columns={columns} />

      <Dialog open={dlgOpen} onClose={() => setDlgOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{editing ? 'Edit Affiliate' : 'Add Affiliate'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}><TextField fullWidth label="Affiliate Name" value={form.name ?? ''} onChange={tf('name')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Code" value={form.code ?? ''} onChange={tf('code')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email" value={form.email ?? ''} onChange={tf('email')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Model</InputLabel>
                <Select label="Model" value={form.model ?? 'REVENUE_SHARE'} onChange={e => setForm(p => ({ ...p, model: e.target.value }))}>
                  {['CPA', 'REVENUE_SHARE', 'HYBRID'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Commission Rate" type="number" value={form.commissionRate ?? ''} onChange={tf('commissionRate')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? 'ACTIVE'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['ACTIVE', 'PAUSED', 'SUSPENDED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Payment Method</InputLabel>
                <Select label="Payment Method" value={form.paymentMethod ?? 'Bank Transfer'} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                  {['Bank Transfer', 'Skrill', 'Crypto USDT', 'Crypto BTC'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Bank / Crypto Details" value={form.bankDetails ?? ''} onChange={tf('bankDetails')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Affiliate — {editing?.name}</DialogTitle>
        <DialogContent>
          {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Code', editing.code], ['Email', editing.email], ['Model', editing.model], ['Commission', `${editing.commissionRate}%`], ['Players', editing.players.toLocaleString()], ['Total Earned', `$${editing.totalEarned.toLocaleString()}`], ['Status', editing.status], ['Joined', editing.joinedAt], ['Payment', editing.paymentMethod]] as [string, string][]).map(([k, v]) => (
              <Stack key={k} direction="row" justifyContent="space-between">
                <Typography color="text.secondary" variant="body2">{k}</Typography>
                <Typography variant="body2" fontWeight={500}>{v}</Typography>
              </Stack>
            ))}
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setViewOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete Affiliate</DialogTitle>
        <DialogContent><Typography>Delete affiliate <strong>{editing?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}