'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface Game { id: string; code: string; name: string; provider: string; category: string; status: string; rtp: number; volatility: string; launchMs: number; }

const mockGames: Game[] = [
  { id: '1', code: 'vs20olympgate', name: 'Gates of Olympus', provider: 'Pragmatic Play', category: 'SLOTS', status: 'ACTIVE', rtp: 96.50, volatility: 'HIGH', launchMs: 1240 },
  { id: '2', code: 'vs20bonzgame', name: 'Sweet Bonanza', provider: 'Pragmatic Play', category: 'SLOTS', status: 'ACTIVE', rtp: 96.51, volatility: 'HIGH', launchMs: 1180 },
  { id: '3', code: 'evo_lr001', name: 'Lightning Roulette', provider: 'Evolution', category: 'LIVE', status: 'ACTIVE', rtp: 97.30, volatility: 'LOW', launchMs: 980 },
  { id: '4', code: 'evo_ct001', name: 'Crazy Time', provider: 'Evolution', category: 'LIVE', status: 'ACTIVE', rtp: 96.08, volatility: 'HIGH', launchMs: 1050 },
  { id: '5', code: 'pg_mw001', name: 'Mahjong Ways 2', provider: 'PG Soft', category: 'SLOTS', status: 'ACTIVE', rtp: 96.71, volatility: 'HIGH', launchMs: 1320 },
  { id: '6', code: 'hk_nsv001', name: 'Nitropolis 4', provider: 'ELK Studios', category: 'SLOTS', status: 'ACTIVE', rtp: 96.10, volatility: 'HIGH', launchMs: 1400 },
  { id: '7', code: 'evo_bj001', name: 'Infinite Blackjack', provider: 'Evolution', category: 'TABLE', status: 'ACTIVE', rtp: 99.47, volatility: 'LOW', launchMs: 890 },
  { id: '8', code: 'hk_cr001', name: 'Wanted Dead or a Wild', provider: 'Hacksaw Gaming', category: 'SLOTS', status: 'ACTIVE', rtp: 96.38, volatility: 'HIGH', launchMs: 1290 },
  { id: '9', code: 'pp_crash001', name: 'Spaceman', provider: 'Pragmatic Play', category: 'CRASH', status: 'DRAFT', rtp: 96.00, volatility: 'MED', launchMs: 760 },
  { id: '10', code: 'pg_dt001', name: 'Dragon Tiger', provider: 'PG Soft', category: 'TABLE', status: 'ACTIVE', rtp: 96.27, volatility: 'LOW', launchMs: 920 },
];

const catColors: Record<string, 'default'|'primary'|'secondary'|'info'|'success'|'warning'|'error'> = { SLOTS: 'info', LIVE: 'success', TABLE: 'warning', CRASH: 'error' };

const baseColumns: GridColDef[] = [
  { field: 'code', headerName: 'Code', width: 150, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
  { field: 'name', headerName: 'Game Name', flex: 1, minWidth: 200 },
  { field: 'provider', headerName: 'Provider', width: 150 },
  { field: 'category', headerName: 'Category', width: 120, renderCell: ({ value }) => <Chip label={String(value)} size="small" color={catColors[String(value)] ?? 'default'} /> },
  { field: 'status', headerName: 'Status', width: 110, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'rtp', headerName: 'RTP %', width: 90, align: 'right', headerAlign: 'right', valueFormatter: (v) => `${Number(v).toFixed(2)}%` },
  { field: 'volatility', headerName: 'Volatility', width: 100 },
  { field: 'launchMs', headerName: 'Launch ms', width: 100, align: 'right', headerAlign: 'right' },
];

const empty = (): Partial<Game> => ({ code: '', name: '', provider: 'Pragmatic Play', category: 'SLOTS', status: 'DRAFT', rtp: 96.0, volatility: 'MED', launchMs: 0 });

export default function GamesPage() {
  const [rows, setRows] = useState<Game[]>(mockGames);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState<Partial<Game>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: Game) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openDelete = (row: Game) => { setEditing(row); setDeleteOpen(true); };

  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as Game : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as Game]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof Game) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const active = rows.filter(r => r.status === 'ACTIVE').length;
  const cats = new Set(rows.map(r => r.category)).size;
  const avgRtp = rows.length ? (rows.reduce((a, r) => a + r.rtp, 0) / rows.length).toFixed(2) : '0';
  const stats = [
    { label: 'Total Games', value: String(rows.length) },
    { label: 'Active', value: String(active) },
    { label: 'Categories', value: String(cats) },
    { label: 'Avg RTP', value: `${avgRtp}%` },
  ];

  const columns: GridColDef[] = [...baseColumns, {
    field: 'actions', headerName: 'Actions', width: 180, sortable: false, renderCell: ({ row }) => (
      <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
        <Button size="small" onClick={() => openEdit(row as Game)}>Edit</Button>
        <Button size="small" color="error" onClick={() => openDelete(row as Game)}>Delete</Button>
      </Stack>
    )
  }];

  return (
    <PageShell title="Game Catalog" subtitle="Master game catalog with RTP, volatility, and provider mappings" actions={<AddButton label="Add Game" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit Game' : 'Add Game'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}><TextField fullWidth label="Game Name" value={form.name ?? ''} onChange={tf('name')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Code" value={form.code ?? ''} onChange={tf('code')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Provider</InputLabel>
                <Select label="Provider" value={form.provider ?? ''} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))}>
                  {['Pragmatic Play', 'Evolution', 'PG Soft', 'Hacksaw Gaming', 'ELK Studios'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Category</InputLabel>
                <Select label="Category" value={form.category ?? 'SLOTS'} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {['SLOTS', 'LIVE', 'TABLE', 'CRASH'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? 'DRAFT'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['ACTIVE', 'DRAFT', 'SUSPENDED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="RTP %" type="number" value={form.rtp ?? ''} onChange={tf('rtp')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Volatility</InputLabel>
                <Select label="Volatility" value={form.volatility ?? 'MED'} onChange={e => setForm(p => ({ ...p, volatility: e.target.value }))}>
                  {['LOW', 'MED', 'HIGH'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete Game</DialogTitle>
        <DialogContent><Typography>Delete <strong>{editing?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}