'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface Route { id: string; name: string; provider: string; operator: string; status: string; priority: number; successRate: number; avgLatencyMs: number; dailyRequests: number; fallbackProvider: string; }

const mockRoutes: Route[] = [
  { id: '1', name: 'PP Slots Primary', provider: 'Pragmatic Play', operator: 'BetZone Ltd', status: 'ACTIVE', priority: 1, successRate: 99.2, avgLatencyMs: 245, dailyRequests: 184200, fallbackProvider: 'PG Soft' },
  { id: '2', name: 'EVO Live Primary', provider: 'Evolution', operator: 'BetZone Ltd', status: 'ACTIVE', priority: 1, successRate: 99.8, avgLatencyMs: 198, dailyRequests: 92400, fallbackProvider: 'Pragmatic Play' },
  { id: '3', name: 'PP Crash Route', provider: 'Pragmatic Play', operator: 'Spin Palace Group', status: 'ACTIVE', priority: 2, successRate: 98.7, avgLatencyMs: 312, dailyRequests: 48600, fallbackProvider: 'Evolution' },
  { id: '4', name: 'PGSoft Mobile', provider: 'PG Soft', operator: 'Lucky Star Casino', status: 'ACTIVE', priority: 1, successRate: 97.9, avgLatencyMs: 420, dailyRequests: 67800, fallbackProvider: 'Hacksaw Gaming' },
  { id: '5', name: 'Hacksaw Slots', provider: 'Hacksaw Gaming', operator: 'Diamond Club Casino', status: 'ACTIVE', priority: 2, successRate: 98.4, avgLatencyMs: 380, dailyRequests: 34200, fallbackProvider: 'Pragmatic Play' },
  { id: '6', name: 'EVO Table Route', provider: 'Evolution', operator: 'Venus Gaming SA', status: 'DISABLED', priority: 3, successRate: 94.2, avgLatencyMs: 610, dailyRequests: 12800, fallbackProvider: 'Pragmatic Play' },
  { id: '7', name: 'PP Live Casino', provider: 'Pragmatic Play', operator: 'Casino Max', status: 'ACTIVE', priority: 1, successRate: 99.0, avgLatencyMs: 268, dailyRequests: 28400, fallbackProvider: 'Evolution' },
  { id: '8', name: 'NetEnt Legacy', provider: 'NetEnt', operator: 'Diamond Club Casino', status: 'DISABLED', priority: 5, successRate: 91.3, avgLatencyMs: 820, dailyRequests: 4200, fallbackProvider: 'PG Soft' },
];

const empty = (): Partial<Route> => ({ name: '', provider: 'Pragmatic Play', operator: '', status: 'ACTIVE', priority: 1, successRate: 99, avgLatencyMs: 0, dailyRequests: 0, fallbackProvider: '' });

export default function RoutesPage() {
  const [rows, setRows] = useState<Route[]>(mockRoutes);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const [form, setForm] = useState<Partial<Route>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: Route) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openDelete = (row: Route) => { setEditing(row); setDeleteOpen(true); };
  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as Route : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as Route]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof Route) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const active = rows.filter(r => r.status === 'ACTIVE');
  const avgSuccess = active.length ? (active.reduce((a, r) => a + r.successRate, 0) / active.length).toFixed(1) : '0';
  const avgLatency = active.length ? Math.round(active.reduce((a, r) => a + r.avgLatencyMs, 0) / active.length) : 0;
  const stats = [
    { label: 'Total Routes', value: String(rows.length) },
    { label: 'Active', value: String(active.length) },
    { label: 'Avg Success Rate', value: `${avgSuccess}%` },
    { label: 'Avg Latency', value: `${avgLatency}ms` },
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Route Name', flex: 1, minWidth: 200 },
    { field: 'provider', headerName: 'Provider', width: 160 },
    { field: 'operator', headerName: 'Operator', width: 180 },
    { field: 'priority', headerName: 'Priority', width: 90, align: 'center', headerAlign: 'center' },
    { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'successRate', headerName: 'Success %', width: 110, align: 'right', headerAlign: 'right', valueFormatter: (v) => `${v}%` },
    { field: 'avgLatencyMs', headerName: 'Avg Latency', width: 120, align: 'right', headerAlign: 'right', valueFormatter: (v) => `${v}ms` },
    { field: 'dailyRequests', headerName: 'Daily Reqs', width: 120, align: 'right', headerAlign: 'right', valueFormatter: (v) => Number(v).toLocaleString() },
    {
      field: 'actions', headerName: 'Actions', width: 180, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openEdit(row as Route)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row as Route)}>Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Route Center" subtitle="Game launch, wallet, callback, and payment route policies" actions={<AddButton label="New Route" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit Route' : 'New Route'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Route Name" value={form.name ?? ''} onChange={tf('name')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Provider</InputLabel>
                <Select label="Provider" value={form.provider ?? ''} onChange={e => setForm(p => ({ ...p, provider: e.target.value }))}>
                  {['Pragmatic Play', 'Evolution', 'PG Soft', 'Hacksaw Gaming', 'NetEnt'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Operator</InputLabel>
                <Select label="Operator" value={form.operator ?? ''} onChange={e => setForm(p => ({ ...p, operator: e.target.value }))}>
                  {['BetZone Ltd', 'Spin Palace Group', 'Lucky Star Casino', 'Diamond Club Casino', 'Venus Gaming SA'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Priority (1-5)" type="number" value={form.priority ?? 1} onChange={tf('priority')} inputProps={{ min: 1, max: 5 }} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? 'ACTIVE'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['ACTIVE', 'DISABLED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Fallback Provider</InputLabel>
                <Select label="Fallback Provider" value={form.fallbackProvider ?? ''} onChange={e => setForm(p => ({ ...p, fallbackProvider: e.target.value }))}>
                  {['Pragmatic Play', 'Evolution', 'PG Soft', 'Hacksaw Gaming', 'NetEnt'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
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
        <DialogTitle>Delete Route</DialogTitle>
        <DialogContent><Typography>Delete route <strong>{editing?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}