'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface Settlement { id: string; reference: string; counterparty: string; type: string; amount: number; currency: string; status: string; dueDate: string; period: string; notes: string; }

const mockSettlements: Settlement[] = [
  { id: '1', reference: 'STL-2026-0601', counterparty: 'Pragmatic Play', type: 'PROVIDER', amount: 84200, currency: 'USD', status: 'PENDING', dueDate: '2026-07-05', period: 'Jun 2026', notes: '' },
  { id: '2', reference: 'STL-2026-0602', counterparty: 'Evolution Gaming', type: 'PROVIDER', amount: 51000, currency: 'EUR', status: 'PROCESSING', dueDate: '2026-07-05', period: 'Jun 2026', notes: '' },
  { id: '3', reference: 'STL-2026-0603', counterparty: 'PG Soft Holdings', type: 'PROVIDER', amount: 32400, currency: 'USD', status: 'PENDING', dueDate: '2026-07-10', period: 'Jun 2026', notes: '' },
  { id: '4', reference: 'STL-2026-0604', counterparty: 'BetZone Ltd', type: 'OPERATOR', amount: 20400, currency: 'USD', status: 'COMPLETED', dueDate: '2026-06-30', period: 'Jun 2026', notes: '' },
  { id: '5', reference: 'STL-2026-0605', counterparty: 'Spin Palace Group', type: 'OPERATOR', amount: 14800, currency: 'EUR', status: 'COMPLETED', dueDate: '2026-06-30', period: 'Jun 2026', notes: '' },
  { id: '6', reference: 'STL-2026-0606', counterparty: 'Alpha Gaming Group', type: 'AGENT', amount: 12400, currency: 'USD', status: 'PENDING', dueDate: '2026-07-15', period: 'Jun 2026', notes: '' },
  { id: '7', reference: 'STL-2026-0507', counterparty: 'Hacksaw Gaming', type: 'PROVIDER', amount: 18600, currency: 'USD', status: 'OVERDUE', dueDate: '2026-06-10', period: 'May 2026', notes: 'Dispute under review' },
  { id: '8', reference: 'STL-2026-0608', counterparty: 'Epsilon Global', type: 'AGENT', amount: 9200, currency: 'USD', status: 'PROCESSING', dueDate: '2026-07-15', period: 'Jun 2026', notes: '' },
];

const empty = (): Partial<Settlement> => ({ reference: '', counterparty: '', type: 'PROVIDER', amount: 0, currency: 'USD', status: 'PENDING', dueDate: '', period: '', notes: '' });

export default function SettlementsPage() {
  const [rows, setRows] = useState<Settlement[]>(mockSettlements);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Settlement | null>(null);
  const [form, setForm] = useState<Partial<Settlement>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: Settlement) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openView = (row: Settlement) => { setEditing(row); setViewOpen(true); };
  const openDelete = (row: Settlement) => { setEditing(row); setDeleteOpen(true); };
  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as Settlement : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as Settlement]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof Settlement) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const pending = rows.filter(r => r.status === 'PENDING').length;
  const processing = rows.filter(r => r.status === 'PROCESSING').length;
  const completed = rows.filter(r => r.status === 'COMPLETED').length;
  const totalDue = rows.filter(r => r.status !== 'COMPLETED').reduce((a, r) => a + r.amount, 0);
  const stats = [
    { label: 'Total Due', value: `$${(totalDue / 1000).toFixed(0)}K` },
    { label: 'Pending', value: String(pending) },
    { label: 'Processing', value: String(processing) },
    { label: 'Completed', value: String(completed) },
  ];

  const columns: GridColDef[] = [
    { field: 'reference', headerName: 'Reference', width: 160, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'counterparty', headerName: 'Counterparty', flex: 1, minWidth: 180 },
    { field: 'type', headerName: 'Type', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'amount', headerName: 'Amount', width: 130, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    { field: 'currency', headerName: 'CCY', width: 70 },
    { field: 'status', headerName: 'Status', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'dueDate', headerName: 'Due Date', width: 120 },
    { field: 'period', headerName: 'Period', width: 110 },
    {
      field: 'actions', headerName: 'Actions', width: 210, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openView(row as Settlement)}>View</Button>
          <Button size="small" onClick={() => openEdit(row as Settlement)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row as Settlement)}>Del</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Settlements" subtitle="Provider, operator, agent and affiliate settlement cycles" actions={<AddButton label="New Settlement" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit Settlement' : 'New Settlement'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Reference" value={form.reference ?? ''} onChange={tf('reference')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Counterparty" value={form.counterparty ?? ''} onChange={tf('counterparty')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Type</InputLabel>
                <Select label="Type" value={form.type ?? 'PROVIDER'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {['PROVIDER', 'OPERATOR', 'AGENT'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Amount" type="number" value={form.amount ?? ''} onChange={tf('amount')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Currency</InputLabel>
                <Select label="Currency" value={form.currency ?? 'USD'} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
                  {['USD', 'EUR', 'GBP'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Due Date" type="date" value={form.dueDate ?? ''} onChange={tf('dueDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Period" value={form.period ?? ''} onChange={tf('period')} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Notes" multiline rows={2} value={form.notes ?? ''} onChange={tf('notes')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Settlement Details</DialogTitle>
        <DialogContent>
          {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Reference', editing.reference], ['Counterparty', editing.counterparty], ['Type', editing.type], ['Amount', `${editing.currency} ${editing.amount.toLocaleString()}`], ['Status', editing.status], ['Due Date', editing.dueDate], ['Period', editing.period], ['Notes', editing.notes || '—']] as [string, string][]).map(([k, v]) => (
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
        <DialogTitle>Delete Settlement</DialogTitle>
        <DialogContent><Typography>Delete <strong>{editing?.reference}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}