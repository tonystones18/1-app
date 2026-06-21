'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface Player { id: string; username: string; email: string; country: string; status: string; kycStatus: string; balance: number; totalDeposits: number; registeredAt: string; vipLevel: string; notes: string; }

const mockPlayers: Player[] = [
  { id: '1', username: 'highroller_mt', email: 'hr.malta@example.com', country: 'MT', status: 'ACTIVE', kycStatus: 'VERIFIED', balance: 12450, totalDeposits: 284000, registeredAt: '2024-03-15', vipLevel: 'DIAMOND', notes: '' },
  { id: '2', username: 'slots_fan_gb', email: 'slots.gb@example.com', country: 'GB', status: 'ACTIVE', kycStatus: 'VERIFIED', balance: 234, totalDeposits: 4820, registeredAt: '2025-01-22', vipLevel: 'SILVER', notes: '' },
  { id: '3', username: 'live_lover_de', email: 'live.de@example.com', country: 'DE', status: 'ACTIVE', kycStatus: 'PENDING', balance: 89, totalDeposits: 1240, registeredAt: '2025-05-10', vipLevel: 'BRONZE', notes: '' },
  { id: '4', username: 'poker_pro_cy', email: 'poker.cy@example.com', country: 'CY', status: 'ACTIVE', kycStatus: 'VERIFIED', balance: 3820, totalDeposits: 62000, registeredAt: '2024-08-04', vipLevel: 'GOLD', notes: '' },
  { id: '5', username: 'suspended_user', email: 'suspended@example.com', country: 'US', status: 'SUSPENDED', kycStatus: 'FAILED', balance: 0, totalDeposits: 580, registeredAt: '2026-02-14', vipLevel: 'BRONZE', notes: 'Fraud investigation' },
  { id: '6', username: 'self_excluded', email: 'se.user@example.com', country: 'GB', status: 'SELF_EXCLUDED', kycStatus: 'VERIFIED', balance: 0, totalDeposits: 12400, registeredAt: '2024-11-30', vipLevel: 'SILVER', notes: 'Self-exclusion requested 2026-05-01' },
  { id: '7', username: 'casual_player_fi', email: 'casual.fi@example.com', country: 'FI', status: 'ACTIVE', kycStatus: 'VERIFIED', balance: 420, totalDeposits: 3600, registeredAt: '2025-08-19', vipLevel: 'BRONZE', notes: '' },
  { id: '8', username: 'bigwin_se', email: 'bigwin.se@example.com', country: 'SE', status: 'ACTIVE', kycStatus: 'VERIFIED', balance: 8200, totalDeposits: 48000, registeredAt: '2024-06-12', vipLevel: 'PLATINUM', notes: '' },
  { id: '9', username: 'new_player_no', email: 'new.no@example.com', country: 'NO', status: 'ACTIVE', kycStatus: 'PENDING', balance: 150, totalDeposits: 150, registeredAt: '2026-06-20', vipLevel: 'BRONZE', notes: '' },
  { id: '10', username: 'vip_dk', email: 'vip.dk@example.com', country: 'DK', status: 'ACTIVE', kycStatus: 'VERIFIED', balance: 5640, totalDeposits: 124000, registeredAt: '2023-12-01', vipLevel: 'PLATINUM', notes: '' },
];

const empty = (): Partial<Player> => ({ username: '', email: '', country: '', status: 'ACTIVE', kycStatus: 'PENDING', balance: 0, totalDeposits: 0, registeredAt: '', vipLevel: 'BRONZE', notes: '' });

export default function PlayersPage() {
  const [rows, setRows] = useState<Player[]>(mockPlayers);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState<Partial<Player>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: Player) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openView = (row: Player) => { setEditing(row); setViewOpen(true); };
  const openDelete = (row: Player) => { setEditing(row); setDeleteOpen(true); };
  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as Player : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as Player]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof Player) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const active = rows.filter(r => r.status === 'ACTIVE').length;
  const kycVerified = rows.filter(r => r.kycStatus === 'VERIFIED').length;
  const totalDep = rows.reduce((a, r) => a + r.totalDeposits, 0);
  const stats = [
    { label: 'Total Players', value: rows.length.toLocaleString() },
    { label: 'Active', value: String(active) },
    { label: 'KYC Verified', value: String(kycVerified) },
    { label: 'Total Deposits', value: `$${(totalDep / 1000).toFixed(0)}K` },
  ];

  const columns: GridColDef[] = [
    { field: 'username', headerName: 'Username', width: 160 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'country', headerName: 'Country', width: 80 },
    { field: 'status', headerName: 'Status', width: 140, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'kycStatus', headerName: 'KYC', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'balance', headerName: 'Balance', width: 120, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    { field: 'totalDeposits', headerName: 'Total Dep.', width: 120, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    { field: 'registeredAt', headerName: 'Registered', width: 120 },
    {
      field: 'actions', headerName: 'Actions', width: 210, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openView(row as Player)}>View</Button>
          <Button size="small" onClick={() => openEdit(row as Player)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row as Player)}>Del</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Players" subtitle="Player accounts, profiles, KYC status, and account history" actions={<AddButton label="Add Player" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit Player' : 'Add Player'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Username" value={form.username ?? ''} onChange={tf('username')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email" value={form.email ?? ''} onChange={tf('email')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Country (ISO)" value={form.country ?? ''} onChange={tf('country')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? 'ACTIVE'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['ACTIVE', 'SUSPENDED', 'SELF_EXCLUDED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>KYC Status</InputLabel>
                <Select label="KYC Status" value={form.kycStatus ?? 'PENDING'} onChange={e => setForm(p => ({ ...p, kycStatus: e.target.value }))}>
                  {['VERIFIED', 'PENDING', 'FAILED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>VIP Level</InputLabel>
                <Select label="VIP Level" value={form.vipLevel ?? 'BRONZE'} onChange={e => setForm(p => ({ ...p, vipLevel: e.target.value }))}>
                  {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Notes" multiline rows={2} value={form.notes ?? ''} onChange={tf('notes')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Player Profile</DialogTitle>
        <DialogContent>
          {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Username', editing.username], ['Email', editing.email], ['Country', editing.country], ['Status', editing.status], ['KYC', editing.kycStatus], ['VIP Level', editing.vipLevel], ['Balance', `$${editing.balance.toLocaleString()}`], ['Total Deposits', `$${editing.totalDeposits.toLocaleString()}`], ['Registered', editing.registeredAt], ['Notes', editing.notes || '—']] as [string, string][]).map(([k, v]) => (
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
        <DialogTitle>Delete Player</DialogTitle>
        <DialogContent><Typography>Delete player <strong>{editing?.username}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}