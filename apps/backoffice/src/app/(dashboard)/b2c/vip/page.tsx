'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { PageShell, DataTable, AddButton } from '@/components/ui/DataTable';

interface VipMember { id: string; username: string; level: string; totalWagered: number; cashbackRate: number; dedicatedManager: string; joinedAt: string; lastSeen: string; status: string; notes: string; }

const levelColors: Record<string, 'default'|'warning'|'info'|'success'|'error'> = { BRONZE: 'default', SILVER: 'default', GOLD: 'warning', PLATINUM: 'info', DIAMOND: 'success' };
const levelBorderColors: Record<string, string> = { BRONZE: '#CD7F32', SILVER: '#94a3b8', GOLD: '#FFD700', PLATINUM: '#94a3b8', DIAMOND: '#7dd3fc' };

const mockVIP: VipMember[] = [
  { id: '1', username: 'highroller_mt', level: 'DIAMOND', totalWagered: 2840000, cashbackRate: 15, dedicatedManager: 'Sarah Johnson', joinedAt: '2024-03-15', lastSeen: '2026-06-21', status: 'ACTIVE', notes: '' },
  { id: '2', username: 'bigwin_se', level: 'PLATINUM', totalWagered: 820000, cashbackRate: 12, dedicatedManager: 'Mike Chen', joinedAt: '2024-06-12', lastSeen: '2026-06-20', status: 'ACTIVE', notes: '' },
  { id: '3', username: 'vip_dk', level: 'PLATINUM', totalWagered: 640000, cashbackRate: 12, dedicatedManager: 'Mike Chen', joinedAt: '2023-12-01', lastSeen: '2026-06-21', status: 'ACTIVE', notes: '' },
  { id: '4', username: 'poker_pro_cy', level: 'GOLD', totalWagered: 320000, cashbackRate: 10, dedicatedManager: 'Anna Petrova', joinedAt: '2024-08-04', lastSeen: '2026-06-19', status: 'ACTIVE', notes: '' },
  { id: '5', username: 'slots_fan_gb', level: 'GOLD', totalWagered: 124000, cashbackRate: 10, dedicatedManager: 'Anna Petrova', joinedAt: '2025-01-22', lastSeen: '2026-06-21', status: 'ACTIVE', notes: '' },
  { id: '6', username: 'casual_player_fi', level: 'SILVER', totalWagered: 48000, cashbackRate: 7, dedicatedManager: '—', joinedAt: '2025-08-19', lastSeen: '2026-06-18', status: 'ACTIVE', notes: '' },
  { id: '7', username: 'live_lover_de', level: 'SILVER', totalWagered: 36000, cashbackRate: 7, dedicatedManager: '—', joinedAt: '2025-05-10', lastSeen: '2026-06-15', status: 'PAUSED', notes: 'Awaiting KYC re-verification' },
  { id: '8', username: 'new_vip_es', level: 'GOLD', totalWagered: 98000, cashbackRate: 10, dedicatedManager: 'Sarah Johnson', joinedAt: '2025-11-20', lastSeen: '2026-06-20', status: 'ACTIVE', notes: '' },
];

const empty = (): Partial<VipMember> => ({ username: '', level: 'GOLD', totalWagered: 0, cashbackRate: 10, dedicatedManager: '', joinedAt: '', lastSeen: '', status: 'ACTIVE', notes: '' });

export default function VIPPage() {
  const [rows, setRows] = useState<VipMember[]>(mockVIP);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<VipMember | null>(null);
  const [form, setForm] = useState<Partial<VipMember>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: VipMember) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openView = (row: VipMember) => { setEditing(row); setViewOpen(true); };
  const openDelete = (row: VipMember) => { setEditing(row); setDeleteOpen(true); };
  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as VipMember : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as VipMember]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof VipMember) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const gold = rows.filter(r => ['GOLD', 'PLATINUM', 'DIAMOND'].includes(r.level)).length;
  const platinum = rows.filter(r => ['PLATINUM', 'DIAMOND'].includes(r.level)).length;
  const diamond = rows.filter(r => r.level === 'DIAMOND').length;
  const stats = [
    { label: 'Total VIP', value: String(rows.length) },
    { label: 'Gold+', value: String(gold) },
    { label: 'Platinum+', value: String(platinum) },
    { label: 'Diamond', value: String(diamond) },
  ];

  const columns: GridColDef[] = [
    { field: 'username', headerName: 'Username', width: 160 },
    { field: 'level', headerName: 'VIP Level', width: 130, renderCell: ({ value }) => <Chip label={String(value)} size="small" color={levelColors[String(value)] ?? 'default'} sx={{ borderColor: levelBorderColors[String(value)], border: '1px solid' }} variant="outlined" /> },
    { field: 'totalWagered', headerName: 'Total Wagered', width: 150, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    { field: 'cashbackRate', headerName: 'Cashback %', width: 120, align: 'right', headerAlign: 'right', valueFormatter: (v) => `${v}%` },
    { field: 'dedicatedManager', headerName: 'Manager', width: 150 },
    { field: 'lastSeen', headerName: 'Last Seen', width: 120 },
    { field: 'status', headerName: 'Status', width: 110, renderCell: ({ value }) => <Chip label={String(value)} size="small" color={value === 'ACTIVE' ? 'success' : 'warning'} variant="outlined" /> },
    {
      field: 'actions', headerName: 'Actions', width: 210, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openView(row as VipMember)}>View</Button>
          <Button size="small" onClick={() => openEdit(row as VipMember)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row as VipMember)}>Del</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="VIP Management" subtitle="VIP tiers, player status, host assignments, and exclusive rewards" actions={<AddButton label="Add VIP Member" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit VIP Member' : 'Add VIP Member'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Username" value={form.username ?? ''} onChange={tf('username')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>VIP Level</InputLabel>
                <Select label="VIP Level" value={form.level ?? 'GOLD'} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                  {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Cashback Rate %" type="number" value={form.cashbackRate ?? ''} onChange={tf('cashbackRate')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Dedicated Manager" value={form.dedicatedManager ?? ''} onChange={tf('dedicatedManager')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? 'ACTIVE'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['ACTIVE', 'PAUSED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
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
        <DialogTitle>VIP Member Details</DialogTitle>
        <DialogContent>
          {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Username', editing.username], ['Level', editing.level], ['Total Wagered', `$${editing.totalWagered.toLocaleString()}`], ['Cashback Rate', `${editing.cashbackRate}%`], ['Manager', editing.dedicatedManager], ['Joined', editing.joinedAt], ['Last Seen', editing.lastSeen], ['Status', editing.status], ['Notes', editing.notes || '—']] as [string, string][]).map(([k, v]) => (
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
        <DialogTitle>Remove VIP Member</DialogTitle>
        <DialogContent><Typography>Remove <strong>{editing?.username}</strong> from VIP program?</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Remove</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}