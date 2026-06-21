'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface Agent { id: string; code: string; name: string; operatorName: string; status: string; commissionRate: number; totalGGR: number; players: number; joinedAt: string; paymentMethod: string; }

const mockAgents: Agent[] = [
  { id: '1', code: 'AGT-001', name: 'Alpha Gaming Group', operatorName: 'BetZone Ltd', status: 'ACTIVE', commissionRate: 12.5, totalGGR: 124000, players: 4820, joinedAt: '2024-03-15', paymentMethod: 'Bank Transfer' },
  { id: '2', code: 'AGT-002', name: 'Beta Distribution SARL', operatorName: 'Spin Palace Group', status: 'ACTIVE', commissionRate: 10.0, totalGGR: 78200, players: 3100, joinedAt: '2024-06-20', paymentMethod: 'Crypto USDT' },
  { id: '3', code: 'AGT-003', name: 'Gamma Partners Ltd', operatorName: 'Lucky Star Casino', status: 'ACTIVE', commissionRate: 11.0, totalGGR: 54600, players: 2240, joinedAt: '2024-09-01', paymentMethod: 'Bank Transfer' },
  { id: '4', code: 'AGT-004', name: 'Delta Associates', operatorName: 'BetZone Ltd', status: 'SUSPENDED', commissionRate: 9.5, totalGGR: 18400, players: 720, joinedAt: '2025-01-10', paymentMethod: 'Bank Transfer' },
  { id: '5', code: 'AGT-005', name: 'Epsilon Global', operatorName: 'Diamond Club Casino', status: 'ACTIVE', commissionRate: 13.0, totalGGR: 210000, players: 8900, joinedAt: '2023-11-05', paymentMethod: 'Crypto USDT' },
  { id: '6', code: 'AGT-006', name: 'Zeta Media GmbH', operatorName: 'Venus Gaming SA', status: 'ACTIVE', commissionRate: 8.5, totalGGR: 42000, players: 1680, joinedAt: '2025-03-22', paymentMethod: 'Bank Transfer' },
  { id: '7', code: 'AGT-007', name: 'Eta Sports Ltd', operatorName: 'Casino Max', status: 'SUSPENDED', commissionRate: 10.5, totalGGR: 9200, players: 380, joinedAt: '2025-05-14', paymentMethod: 'Bank Transfer' },
  { id: '8', code: 'AGT-008', name: 'Theta Digital', operatorName: 'Diamond Club Casino', status: 'ACTIVE', commissionRate: 11.5, totalGGR: 88400, players: 3520, joinedAt: '2024-12-01', paymentMethod: 'Crypto BTC' },
];

const empty = (): Partial<Agent> => ({ code: '', name: '', operatorName: '', status: 'ACTIVE', commissionRate: 10, totalGGR: 0, players: 0, joinedAt: '', paymentMethod: 'Bank Transfer' });

export default function AgentsPage() {
  const [rows, setRows] = useState<Agent[]>(mockAgents);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [form, setForm] = useState<Partial<Agent>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: Agent) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openView = (row: Agent) => { setEditing(row); setViewOpen(true); };
  const openDelete = (row: Agent) => { setEditing(row); setDeleteOpen(true); };
  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as Agent : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as Agent]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof Agent) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const active = rows.filter(r => r.status === 'ACTIVE').length;
  const totalGGR = rows.reduce((a, r) => a + r.totalGGR, 0);
  const totalPlayers = rows.reduce((a, r) => a + r.players, 0);
  const stats = [
    { label: 'Total Agents', value: String(rows.length) },
    { label: 'Active', value: String(active) },
    { label: 'Total Players', value: totalPlayers.toLocaleString() },
    { label: 'Total GGR', value: `$${(totalGGR / 1000).toFixed(0)}K` },
  ];

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 120, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'name', headerName: 'Agent Name', flex: 1, minWidth: 180 },
    { field: 'operatorName', headerName: 'Operator', width: 160 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'commissionRate', headerName: 'Commission %', width: 130, align: 'right', headerAlign: 'right', valueFormatter: (v) => `${v}%` },
    { field: 'totalGGR', headerName: 'Total GGR', width: 130, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    { field: 'players', headerName: 'Players', width: 100, align: 'right', headerAlign: 'right', valueFormatter: (v) => Number(v).toLocaleString() },
    { field: 'joinedAt', headerName: 'Joined', width: 120 },
    {
      field: 'actions', headerName: 'Actions', width: 210, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openView(row as Agent)}>View</Button>
          <Button size="small" onClick={() => openEdit(row as Agent)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row as Agent)}>Del</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Agents" subtitle="Agent hierarchy, operator assignments, commission plans and payouts" actions={<AddButton label="Add Agent" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit Agent' : 'Add Agent'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}><TextField fullWidth label="Agent Name" value={form.name ?? ''} onChange={tf('name')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Code" value={form.code ?? ''} onChange={tf('code')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Operator</InputLabel>
                <Select label="Operator" value={form.operatorName ?? ''} onChange={e => setForm(p => ({ ...p, operatorName: e.target.value }))}>
                  {['BetZone Ltd', 'Spin Palace Group', 'Lucky Star Casino', 'Diamond Club Casino', 'Venus Gaming SA'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? 'ACTIVE'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['ACTIVE', 'SUSPENDED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Commission Rate %" type="number" value={form.commissionRate ?? ''} onChange={tf('commissionRate')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Payment Method</InputLabel>
                <Select label="Payment Method" value={form.paymentMethod ?? 'Bank Transfer'} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                  {['Bank Transfer', 'Crypto USDT', 'Crypto BTC'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
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

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Agent Details</DialogTitle>
        <DialogContent>
          {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Name', editing.name], ['Code', editing.code], ['Operator', editing.operatorName], ['Status', editing.status], ['Commission', `${editing.commissionRate}%`], ['Total GGR', `$${editing.totalGGR.toLocaleString()}`], ['Players', editing.players.toLocaleString()], ['Joined', editing.joinedAt], ['Payment', editing.paymentMethod]] as [string, string][]).map(([k, v]) => (
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
        <DialogTitle>Delete Agent</DialogTitle>
        <DialogContent><Typography>Delete <strong>{editing?.name}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}