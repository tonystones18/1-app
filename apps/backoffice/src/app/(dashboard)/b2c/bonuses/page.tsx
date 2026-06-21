'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface Bonus { id: string; code: string; name: string; type: string; status: string; value: number; wagering: number; eligible: number; used: number; expiry: string; terms: string; }

const mockBonuses: Bonus[] = [
  { id: '1', code: 'WELCOME100', name: '100% Welcome Bonus', type: 'WELCOME', status: 'ACTIVE', value: 200, wagering: 35, eligible: 99999, used: 12480, expiry: '2026-12-31', terms: 'Min deposit $20. Max bonus $200.' },
  { id: '2', code: 'RELOAD50', name: '50% Reload Friday', type: 'RELOAD', status: 'ACTIVE', value: 100, wagering: 25, eligible: 99999, used: 3840, expiry: '2026-12-31', terms: 'Weekly reload for active players.' },
  { id: '3', code: 'FS100OLYMPUS', name: '100 Free Spins — Olympus', type: 'FREE_SPINS', status: 'ACTIVE', value: 50, wagering: 40, eligible: 5000, used: 2210, expiry: '2026-08-31', terms: '100 FS on Gates of Olympus. $0.10/spin.' },
  { id: '4', code: 'VIP20CB', name: 'VIP 20% Weekly Cashback', type: 'CASHBACK', status: 'ACTIVE', value: 2000, wagering: 1, eligible: 250, used: 84, expiry: '2026-12-31', terms: 'For VIP Gold+ only. Max $2000/week.' },
  { id: '5', code: 'DIAM50CB', name: 'Diamond 50% Cashback', type: 'VIP', status: 'ACTIVE', value: 5000, wagering: 1, eligible: 15, used: 12, expiry: '2026-12-31', terms: 'Diamond tier only. No wagering.' },
  { id: '6', code: 'RELOAD25OCT', name: 'October 25% Reload', type: 'RELOAD', status: 'PAUSED', value: 75, wagering: 20, eligible: 99999, used: 0, expiry: '2026-10-31', terms: 'October promotion. Min deposit $50.' },
  { id: '7', code: 'XMAS2026', name: 'Christmas Bonus Pack', type: 'WELCOME', status: 'DRAFT', value: 500, wagering: 30, eligible: 99999, used: 0, expiry: '2027-01-07', terms: 'Christmas promotion 2026.' },
  { id: '8', code: 'SUMMERFS', name: 'Summer Free Spins 50', type: 'FREE_SPINS', status: 'EXPIRED', value: 25, wagering: 35, eligible: 10000, used: 8420, expiry: '2026-06-01', terms: 'Summer 2026 promotion. Expired.' },
];

const empty = (): Partial<Bonus> => ({ code: '', name: '', type: 'WELCOME', status: 'DRAFT', value: 100, wagering: 30, eligible: 99999, used: 0, expiry: '', terms: '' });

export default function BonusesPage() {
  const [rows, setRows] = useState<Bonus[]>(mockBonuses);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Bonus | null>(null);
  const [form, setForm] = useState<Partial<Bonus>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: Bonus) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openView = (row: Bonus) => { setEditing(row); setViewOpen(true); };
  const openDelete = (row: Bonus) => { setEditing(row); setDeleteOpen(true); };
  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as Bonus : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as Bonus]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof Bonus) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const active = rows.filter(r => r.status === 'ACTIVE').length;
  const totalCost = rows.filter(r => r.status === 'ACTIVE').reduce((a, r) => a + r.used * (r.value / Math.max(r.eligible, 1)), 0);
  const avgWager = rows.length ? (rows.reduce((a, r) => a + r.wagering, 0) / rows.length).toFixed(1) : '0';
  const stats = [
    { label: 'Total Bonuses', value: String(rows.length) },
    { label: 'Active', value: String(active) },
    { label: 'Total Used', value: rows.reduce((a, r) => a + r.used, 0).toLocaleString() },
    { label: 'Avg Wagering', value: `${avgWager}x` },
  ];

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 150, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'name', headerName: 'Bonus Name', flex: 1, minWidth: 200 },
    { field: 'type', headerName: 'Type', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'status', headerName: 'Status', width: 110, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'value', headerName: 'Max Value', width: 110, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    { field: 'wagering', headerName: 'Wagering', width: 100, align: 'right', headerAlign: 'right', valueFormatter: (v) => `${v}x` },
    { field: 'used', headerName: 'Used', width: 100, align: 'right', headerAlign: 'right', valueFormatter: (v) => Number(v).toLocaleString() },
    { field: 'expiry', headerName: 'Expiry', width: 120 },
    {
      field: 'actions', headerName: 'Actions', width: 210, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openView(row as Bonus)}>View</Button>
          <Button size="small" onClick={() => openEdit(row as Bonus)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row as Bonus)}>Del</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Bonuses" subtitle="Templates, player instances, wagering progress, and bonus cost analytics" actions={<AddButton label="Create Bonus" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit Bonus' : 'Create Bonus'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}><TextField fullWidth label="Bonus Name" value={form.name ?? ''} onChange={tf('name')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Code" value={form.code ?? ''} onChange={tf('code')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Type</InputLabel>
                <Select label="Type" value={form.type ?? 'WELCOME'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {['WELCOME', 'RELOAD', 'FREE_SPINS', 'CASHBACK', 'VIP'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? 'DRAFT'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['ACTIVE', 'PAUSED', 'DRAFT', 'EXPIRED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Max Value ($)" type="number" value={form.value ?? ''} onChange={tf('value')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Wagering (x)" type="number" value={form.wagering ?? ''} onChange={tf('wagering')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Max Eligible" type="number" value={form.eligible ?? ''} onChange={tf('eligible')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Expiry Date" type="date" value={form.expiry ?? ''} onChange={tf('expiry')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Terms & Conditions" multiline rows={2} value={form.terms ?? ''} onChange={tf('terms')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Bonus Details</DialogTitle>
        <DialogContent>
          {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Name', editing.name], ['Code', editing.code], ['Type', editing.type], ['Status', editing.status], ['Max Value', `$${editing.value.toLocaleString()}`], ['Wagering', `${editing.wagering}x`], ['Used', editing.used.toLocaleString()], ['Expiry', editing.expiry], ['Terms', editing.terms]] as [string, string][]).map(([k, v]) => (
              <Stack key={k} direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography color="text.secondary" variant="body2" sx={{ minWidth: 100 }}>{k}</Typography>
                <Typography variant="body2" fontWeight={500} sx={{ textAlign: 'right', flex: 1 }}>{v}</Typography>
              </Stack>
            ))}
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setViewOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete Bonus</DialogTitle>
        <DialogContent><Typography>Delete bonus <strong>{editing?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}