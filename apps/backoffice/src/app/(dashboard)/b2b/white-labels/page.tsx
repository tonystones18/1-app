'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface WhiteLabel { id: string; code: string; name: string; operator: string; domain: string; status: string; players: number; monthlyGGR: number; theme: string; launchedAt: string; licenseNo: string; }

const mockWL: WhiteLabel[] = [
  { id: '1', code: 'spincastle', name: 'Spin Castle', operator: 'BetZone Ltd', domain: 'spincastle.com', status: 'ACTIVE', players: 28400, monthlyGGR: 184200, theme: 'DARK', launchedAt: '2024-03-01', licenseNo: 'MGA/B2C/394/2021' },
  { id: '2', code: 'royalwins', name: 'Royal Wins', operator: 'BetZone Ltd', domain: 'royalwins.io', status: 'ACTIVE', players: 19800, monthlyGGR: 124600, theme: 'LIGHT', launchedAt: '2024-07-15', licenseNo: 'MGA/B2C/394/2021' },
  { id: '3', code: 'goldenslots', name: 'Golden Slots Casino', operator: 'Spin Palace Group', domain: 'goldenslots.eu', status: 'ACTIVE', players: 34200, monthlyGGR: 218000, theme: 'CUSTOM', launchedAt: '2023-11-20', licenseNo: 'CY/GCC/0023/2020' },
  { id: '4', code: 'luckybay', name: 'Lucky Bay', operator: 'Lucky Star Casino', domain: 'luckybay.co.uk', status: 'ACTIVE', players: 12600, monthlyGGR: 84400, theme: 'LIGHT', launchedAt: '2025-01-10', licenseNo: 'UKGC-033844' },
  { id: '5', code: 'nocturne', name: 'Nocturne Casino', operator: 'Diamond Club Casino', domain: 'nocturnecasino.com', status: 'ACTIVE', players: 22100, monthlyGGR: 156800, theme: 'DARK', launchedAt: '2024-05-22', licenseNo: 'UKGC-044921' },
  { id: '6', code: 'betblaze', name: 'Bet Blaze', operator: 'Venus Gaming SA', domain: 'betblaze.net', status: 'CONFIGURING', players: 0, monthlyGGR: 0, theme: 'CUSTOM', launchedAt: '', licenseNo: 'GIB-GCB-0018' },
  { id: '7', code: 'slotzone', name: 'Slot Zone', operator: 'Casino Max', domain: 'slotzone.pro', status: 'SUSPENDED', players: 8400, monthlyGGR: 0, theme: 'DARK', launchedAt: '2025-03-01', licenseNo: 'CUW-8048-JAZ' },
  { id: '8', code: 'mysticbet', name: 'Mystic Bet', operator: 'Slot King', domain: 'mysticbet.ee', status: 'ACTIVE', players: 6800, monthlyGGR: 42000, theme: 'DARK', launchedAt: '2025-09-01', licenseNo: 'EST-HKT-0012' },
];

const empty = (): Partial<WhiteLabel> => ({ code: '', name: '', operator: '', domain: '', status: 'CONFIGURING', players: 0, monthlyGGR: 0, theme: 'LIGHT', launchedAt: '', licenseNo: '' });

export default function WhiteLabelsPage() {
  const [rows, setRows] = useState<WhiteLabel[]>(mockWL);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<WhiteLabel | null>(null);
  const [form, setForm] = useState<Partial<WhiteLabel>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: WhiteLabel) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openView = (row: WhiteLabel) => { setEditing(row); setViewOpen(true); };
  const openDelete = (row: WhiteLabel) => { setEditing(row); setDeleteOpen(true); };
  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as WhiteLabel : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as WhiteLabel]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof WhiteLabel) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const active = rows.filter(r => r.status === 'ACTIVE').length;
  const totalPlayers = rows.reduce((a, r) => a + r.players, 0);
  const totalGGR = rows.reduce((a, r) => a + r.monthlyGGR, 0);
  const stats = [
    { label: 'Total White Labels', value: String(rows.length) },
    { label: 'Active', value: String(active) },
    { label: 'Total Players', value: totalPlayers.toLocaleString() },
    { label: 'Total GGR (MTD)', value: `$${(totalGGR / 1000).toFixed(0)}K` },
  ];

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 130, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    { field: 'operator', headerName: 'Operator', width: 160 },
    { field: 'domain', headerName: 'Domain', width: 180 },
    { field: 'status', headerName: 'Status', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'theme', headerName: 'Theme', width: 100 },
    { field: 'players', headerName: 'Players', width: 110, align: 'right', headerAlign: 'right', valueFormatter: (v) => Number(v).toLocaleString() },
    { field: 'monthlyGGR', headerName: 'GGR (MTD)', width: 130, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    { field: 'launchedAt', headerName: 'Launched', width: 120 },
    {
      field: 'actions', headerName: 'Actions', width: 210, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openView(row as WhiteLabel)}>View</Button>
          <Button size="small" onClick={() => openEdit(row as WhiteLabel)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row as WhiteLabel)}>Del</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="White Labels" subtitle="White label casino instances, configurations, and operator branding" actions={<AddButton label="Add White Label" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit White Label' : 'Add White Label'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}><TextField fullWidth label="Name" value={form.name ?? ''} onChange={tf('name')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Code" value={form.code ?? ''} onChange={tf('code')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Operator</InputLabel>
                <Select label="Operator" value={form.operator ?? ''} onChange={e => setForm(p => ({ ...p, operator: e.target.value }))}>
                  {['BetZone Ltd', 'Spin Palace Group', 'Lucky Star Casino', 'Diamond Club Casino', 'Venus Gaming SA', 'Casino Max', 'Slot King'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Domain" value={form.domain ?? ''} onChange={tf('domain')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? 'CONFIGURING'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['ACTIVE', 'SUSPENDED', 'CONFIGURING'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Theme</InputLabel>
                <Select label="Theme" value={form.theme ?? 'LIGHT'} onChange={e => setForm(p => ({ ...p, theme: e.target.value }))}>
                  {['LIGHT', 'DARK', 'CUSTOM'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="License Number" value={form.licenseNo ?? ''} onChange={tf('licenseNo')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>White Label Details</DialogTitle>
        <DialogContent>
          {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Name', editing.name], ['Code', editing.code], ['Operator', editing.operator], ['Domain', editing.domain], ['Status', editing.status], ['Theme', editing.theme], ['Players', editing.players.toLocaleString()], ['Monthly GGR', `$${editing.monthlyGGR.toLocaleString()}`], ['Launched', editing.launchedAt || '—'], ['License', editing.licenseNo]] as [string, string][]).map(([k, v]) => (
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
        <DialogTitle>Delete White Label</DialogTitle>
        <DialogContent><Typography>Delete <strong>{editing?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}