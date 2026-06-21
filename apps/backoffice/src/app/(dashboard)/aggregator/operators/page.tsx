'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface Operator { id: string; code: string; name: string; status: string; tier: string; currency: string; country: string; players: number; monthlyGGR: number; licenseNo: string; }

const mockOperators: Operator[] = [
  { id: '1', code: 'betzone', name: 'BetZone Ltd', status: 'ACTIVE', tier: 'ENTERPRISE', currency: 'USD', country: 'Malta', players: 124000, monthlyGGR: 842300, licenseNo: 'MGA/B2C/394/2021' },
  { id: '2', code: 'spinpalace', name: 'Spin Palace Group', status: 'ACTIVE', tier: 'ENTERPRISE', currency: 'EUR', country: 'Cyprus', players: 87000, monthlyGGR: 562000, licenseNo: 'CY/GCC/0023/2020' },
  { id: '3', code: 'luckystar', name: 'Lucky Star Casino', status: 'ACTIVE', tier: 'STANDARD', currency: 'GBP', country: 'UK', players: 45200, monthlyGGR: 289400, licenseNo: 'UKGC-033844' },
  { id: '4', code: 'casinomax', name: 'Casino Max', status: 'SUSPENDED', tier: 'STANDARD', currency: 'USD', country: 'Curacao', players: 32000, monthlyGGR: 128000, licenseNo: 'CUW-8048-JAZ' },
  { id: '5', code: 'slotking', name: 'Slot King', status: 'ACTIVE', tier: 'STARTER', currency: 'EUR', country: 'Estonia', players: 18500, monthlyGGR: 94200, licenseNo: 'EST-HKT-0012' },
  { id: '6', code: 'royalbet', name: 'Royal Bet Online', status: 'DRAFT', tier: 'STARTER', currency: 'USD', country: 'Isle of Man', players: 0, monthlyGGR: 0, licenseNo: 'IOM-GSC-2026-01' },
  { id: '7', code: 'venusgaming', name: 'Venus Gaming SA', status: 'ACTIVE', tier: 'STANDARD', currency: 'EUR', country: 'Gibraltar', players: 29800, monthlyGGR: 187600, licenseNo: 'GIB-GCB-0018' },
  { id: '8', code: 'diamondclub', name: 'Diamond Club Casino', status: 'ACTIVE', tier: 'ENTERPRISE', currency: 'GBP', country: 'UK', players: 61400, monthlyGGR: 408200, licenseNo: 'UKGC-044921' },
];

const tierColor: Record<string, 'default'|'primary'|'secondary'|'warning'> = { ENTERPRISE: 'warning', STANDARD: 'primary', STARTER: 'default' };
const empty = (): Partial<Operator> => ({ code: '', name: '', tier: 'STANDARD', status: 'DRAFT', currency: 'USD', country: '', players: 0, monthlyGGR: 0, licenseNo: '' });

export default function OperatorsPage() {
  const [rows, setRows] = useState<Operator[]>(mockOperators);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Operator | null>(null);
  const [form, setForm] = useState<Partial<Operator>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: Operator) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openView = (row: Operator) => { setEditing(row); setViewOpen(true); };
  const openDelete = (row: Operator) => { setEditing(row); setDeleteOpen(true); };
  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as Operator : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as Operator]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof Operator) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const active = rows.filter(r => r.status === 'ACTIVE').length;
  const totalPlayers = rows.reduce((a, r) => a + r.players, 0);
  const totalGGR = rows.reduce((a, r) => a + r.monthlyGGR, 0);
  const stats = [
    { label: 'Total Operators', value: String(rows.length) },
    { label: 'Active', value: String(active) },
    { label: 'Total Players', value: totalPlayers.toLocaleString() },
    { label: 'Monthly GGR', value: `$${(totalGGR / 1000).toFixed(0)}K` },
  ];

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 120, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'name', headerName: 'Operator', flex: 1, minWidth: 180 },
    { field: 'tier', headerName: 'Tier', width: 120, renderCell: ({ value }) => <Chip label={String(value)} size="small" color={tierColor[String(value)] ?? 'default'} /> },
    { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'currency', headerName: 'CCY', width: 70 },
    { field: 'country', headerName: 'Country', width: 120 },
    { field: 'players', headerName: 'Players', width: 110, align: 'right', headerAlign: 'right', valueFormatter: (v) => Number(v).toLocaleString() },
    { field: 'monthlyGGR', headerName: 'GGR (MTD)', width: 130, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    {
      field: 'actions', headerName: 'Actions', width: 210, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openView(row as Operator)}>View</Button>
          <Button size="small" onClick={() => openEdit(row as Operator)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row as Operator)}>Del</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Operators" subtitle="Operator accounts, commercial terms, provider assignments and performance" actions={<AddButton label="Add Operator" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit Operator' : 'Add Operator'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}><TextField fullWidth label="Operator Name" value={form.name ?? ''} onChange={tf('name')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Code" value={form.code ?? ''} onChange={tf('code')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Tier</InputLabel>
                <Select label="Tier" value={form.tier ?? 'STANDARD'} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))}>
                  {['ENTERPRISE', 'STANDARD', 'STARTER'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? 'DRAFT'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['ACTIVE', 'DRAFT', 'SUSPENDED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Currency</InputLabel>
                <Select label="Currency" value={form.currency ?? 'USD'} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                  {['USD', 'EUR', 'GBP'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Country" value={form.country ?? ''} onChange={tf('country')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="License Number" value={form.licenseNo ?? ''} onChange={tf('licenseNo')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Operator Details</DialogTitle>
        <DialogContent>
          {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Name', editing.name], ['Code', editing.code], ['Tier', editing.tier], ['Status', editing.status], ['Currency', editing.currency], ['Country', editing.country], ['Players', editing.players.toLocaleString()], ['Monthly GGR', `$${editing.monthlyGGR.toLocaleString()}`], ['License', editing.licenseNo]] as [string, string][]).map(([k, v]) => (
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
        <DialogTitle>Delete Operator</DialogTitle>
        <DialogContent><Typography>Delete <strong>{editing?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}