'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface Vendor { id: string; code: string; name: string; type: string; status: string; providers: number; revShare: number; contact: string; apiBaseUrl: string; }

const mockVendors: Vendor[] = [
  { id: '1', code: 'pragmatic-group', name: 'Pragmatic Play Group', type: 'AGGREGATOR', status: 'ACTIVE', providers: 4, revShare: 8.5, contact: 'partnerships@pragmaticplay.com', apiBaseUrl: 'https://api.pragmaticplay.com' },
  { id: '2', code: 'evolution-group', name: 'Evolution Gaming', type: 'DISTRIBUTOR', status: 'ACTIVE', providers: 3, revShare: 7.2, contact: 'partners@evolution.com', apiBaseUrl: 'https://api.evolution.com' },
  { id: '3', code: 'pgsoft-group', name: 'PG Soft Holdings', type: 'PUBLISHER', status: 'ACTIVE', providers: 2, revShare: 9.0, contact: 'biz@pgsoft.com', apiBaseUrl: 'https://api.pgsoft.com' },
  { id: '4', code: 'hacksaw-group', name: 'Hacksaw Gaming', type: 'PUBLISHER', status: 'DRAFT', providers: 1, revShare: 10.0, contact: 'info@hacksaw.com', apiBaseUrl: 'https://api.hacksaw.com' },
  { id: '5', code: 'netent-group', name: 'NetEnt Group', type: 'AGGREGATOR', status: 'SUSPENDED', providers: 2, revShare: 6.5, contact: 'ops@netent.com', apiBaseUrl: 'https://api.netent.com' },
  { id: '6', code: 'playtech-group', name: 'Playtech Ltd', type: 'DISTRIBUTOR', status: 'ACTIVE', providers: 5, revShare: 7.8, contact: 'commercial@playtech.com', apiBaseUrl: 'https://api.playtech.com' },
];

const baseColumns: GridColDef[] = [
  { field: 'code', headerName: 'Code', width: 160, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
  { field: 'name', headerName: 'Vendor Name', flex: 1, minWidth: 180 },
  { field: 'type', headerName: 'Type', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'providers', headerName: 'Providers', width: 100, align: 'right', headerAlign: 'right' },
  { field: 'revShare', headerName: 'Rev Share %', width: 120, align: 'right', headerAlign: 'right', valueFormatter: (value) => `${value}%` },
  { field: 'contact', headerName: 'Contact', flex: 1, minWidth: 200 },
];

const empty = (): Partial<Vendor> => ({ code: '', name: '', type: 'AGGREGATOR', status: 'DRAFT', providers: 0, revShare: 0, contact: '', apiBaseUrl: '' });

export default function VendorsPage() {
  const [rows, setRows] = useState<Vendor[]>(mockVendors);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<Partial<Vendor>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: Vendor) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openView = (row: Vendor) => { setEditing(row); setViewOpen(true); };
  const openDelete = (row: Vendor) => { setEditing(row); setDeleteOpen(true); };

  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as Vendor : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as Vendor]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof Vendor) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const active = rows.filter(r => r.status === 'ACTIVE').length;
  const stats = [
    { label: 'Total Vendors', value: String(rows.length) },
    { label: 'Active', value: String(active) },
    { label: 'Total Providers', value: String(rows.reduce((a, r) => a + r.providers, 0)) },
    { label: 'Avg Rev Share', value: `${rows.length ? (rows.reduce((a, r) => a + r.revShare, 0) / rows.length).toFixed(1) : 0}%` },
  ];

  const columns: GridColDef[] = [...baseColumns, {
    field: 'actions', headerName: 'Actions', width: 210, sortable: false, renderCell: ({ row }) => (
      <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
        <Button size="small" onClick={() => openView(row as Vendor)}>View</Button>
        <Button size="small" onClick={() => openEdit(row as Vendor)}>Edit</Button>
        <Button size="small" color="error" onClick={() => openDelete(row as Vendor)}>Del</Button>
      </Stack>
    )
  }];

  return (
    <PageShell title="Vendors" subtitle="Game studio and vendor relationships, contracts, and commercial terms" actions={<AddButton label="Add Vendor" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Vendor Name" value={form.name ?? ''} onChange={tf('name')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Code" value={form.code ?? ''} onChange={tf('code')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Type</InputLabel>
                <Select label="Type" value={form.type ?? 'AGGREGATOR'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {['DISTRIBUTOR', 'AGGREGATOR', 'PUBLISHER'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? 'DRAFT'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['ACTIVE', 'DRAFT', 'SUSPENDED'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Rev Share %" type="number" value={form.revShare ?? ''} onChange={tf('revShare')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Contact Email" value={form.contact ?? ''} onChange={tf('contact')} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="API Base URL" value={form.apiBaseUrl ?? ''} onChange={tf('apiBaseUrl')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Vendor Details</DialogTitle>
        <DialogContent>
          {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Name', editing.name], ['Code', editing.code], ['Type', editing.type], ['Status', editing.status], ['Providers', String(editing.providers)], ['Rev Share', `${editing.revShare}%`], ['Contact', editing.contact], ['API URL', editing.apiBaseUrl]] as [string, string][]).map(([k, v]) => (
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
        <DialogTitle>Delete Vendor</DialogTitle>
        <DialogContent><Typography>Delete <strong>{editing?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}