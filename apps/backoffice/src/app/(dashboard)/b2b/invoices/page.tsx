'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface Invoice { id: string; invoiceNo: string; operator: string; amount: number; currency: string; type: string; status: string; issueDate: string; dueDate: string; paidDate: string; notes: string; }

const mockInvoices: Invoice[] = [
  { id: '1', invoiceNo: 'INV-2026-0841', operator: 'BetZone Ltd', amount: 84200, currency: 'USD', type: 'MONTHLY', status: 'SENT', issueDate: '2026-06-01', dueDate: '2026-06-30', paidDate: '', notes: '' },
  { id: '2', invoiceNo: 'INV-2026-0840', operator: 'Spin Palace Group', amount: 56200, currency: 'EUR', type: 'MONTHLY', status: 'PAID', issueDate: '2026-06-01', dueDate: '2026-06-30', paidDate: '2026-06-18', notes: '' },
  { id: '3', invoiceNo: 'INV-2026-0839', operator: 'Diamond Club Casino', amount: 40820, currency: 'GBP', type: 'MONTHLY', status: 'PAID', issueDate: '2026-06-01', dueDate: '2026-06-30', paidDate: '2026-06-15', notes: '' },
  { id: '4', invoiceNo: 'INV-2026-0838', operator: 'Lucky Star Casino', amount: 28940, currency: 'GBP', type: 'MONTHLY', status: 'OVERDUE', issueDate: '2026-05-01', dueDate: '2026-05-31', paidDate: '', notes: 'Payment chased x3' },
  { id: '5', invoiceNo: 'INV-2026-0837', operator: 'Venus Gaming SA', amount: 18760, currency: 'EUR', type: 'SETTLEMENT', status: 'SENT', issueDate: '2026-06-15', dueDate: '2026-07-15', paidDate: '', notes: '' },
  { id: '6', invoiceNo: 'INV-2026-0820', operator: 'Casino Max', amount: 5000, currency: 'USD', type: 'SETUP', status: 'PAID', issueDate: '2026-04-01', dueDate: '2026-04-15', paidDate: '2026-04-10', notes: 'One-time setup fee' },
  { id: '7', invoiceNo: 'INV-2026-0815', operator: 'Slot King', amount: 9420, currency: 'EUR', type: 'MONTHLY', status: 'PAID', issueDate: '2026-05-01', dueDate: '2026-05-31', paidDate: '2026-06-02', notes: '' },
  { id: '8', invoiceNo: 'INV-2026-0810', operator: 'Venus Gaming SA', amount: -2400, currency: 'EUR', type: 'CREDIT_NOTE', status: 'SENT', issueDate: '2026-06-10', dueDate: '2026-06-30', paidDate: '', notes: 'Credit for SLA breach May 2026' },
  { id: '9', invoiceNo: 'INV-2026-0800', operator: 'Spin Palace Group', amount: 54800, currency: 'EUR', type: 'MONTHLY', status: 'PAID', issueDate: '2026-05-01', dueDate: '2026-05-31', paidDate: '2026-05-28', notes: '' },
  { id: '10', invoiceNo: 'INV-2026-0799', operator: 'BetZone Ltd', amount: 78400, currency: 'USD', type: 'MONTHLY', status: 'DRAFT', issueDate: '2026-07-01', dueDate: '2026-07-31', paidDate: '', notes: 'July invoice draft' },
];

const empty = (): Partial<Invoice> => ({ invoiceNo: '', operator: '', amount: 0, currency: 'USD', type: 'MONTHLY', status: 'DRAFT', issueDate: '', dueDate: '', paidDate: '', notes: '' });

export default function InvoicesPage() {
  const [rows, setRows] = useState<Invoice[]>(mockInvoices);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Partial<Invoice>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: Invoice) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openView = (row: Invoice) => { setEditing(row); setViewOpen(true); };
  const openDelete = (row: Invoice) => { setEditing(row); setDeleteOpen(true); };
  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as Invoice : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as Invoice]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof Invoice) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const totalInvoiced = rows.filter(r => r.amount > 0).reduce((a, r) => a + r.amount, 0);
  const paid = rows.filter(r => r.status === 'PAID').reduce((a, r) => a + r.amount, 0);
  const outstanding = rows.filter(r => ['SENT', 'DRAFT'].includes(r.status) && r.amount > 0).reduce((a, r) => a + r.amount, 0);
  const overdue = rows.filter(r => r.status === 'OVERDUE').reduce((a, r) => a + r.amount, 0);
  const stats = [
    { label: 'Total Invoiced', value: `$${(totalInvoiced / 1000).toFixed(0)}K` },
    { label: 'Paid', value: `$${(paid / 1000).toFixed(0)}K` },
    { label: 'Outstanding', value: `$${(outstanding / 1000).toFixed(0)}K` },
    { label: 'Overdue', value: `$${(overdue / 1000).toFixed(0)}K` },
  ];

  const columns: GridColDef[] = [
    { field: 'invoiceNo', headerName: 'Invoice No', width: 160, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'operator', headerName: 'Operator', flex: 1, minWidth: 160 },
    { field: 'type', headerName: 'Type', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'amount', headerName: 'Amount', width: 130, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    { field: 'currency', headerName: 'CCY', width: 70 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'issueDate', headerName: 'Issued', width: 120 },
    { field: 'dueDate', headerName: 'Due', width: 120 },
    { field: 'paidDate', headerName: 'Paid', width: 120 },
    {
      field: 'actions', headerName: 'Actions', width: 210, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openView(row as Invoice)}>View</Button>
          <Button size="small" onClick={() => openEdit(row as Invoice)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row as Invoice)}>Del</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Invoices" subtitle="Operator invoices, settlement bills, and revenue tracking" actions={<AddButton label="Create Invoice" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Invoice No" value={form.invoiceNo ?? ''} onChange={tf('invoiceNo')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Operator</InputLabel>
                <Select label="Operator" value={form.operator ?? ''} onChange={e => setForm(p => ({ ...p, operator: e.target.value }))}>
                  {['BetZone Ltd', 'Spin Palace Group', 'Lucky Star Casino', 'Diamond Club Casino', 'Venus Gaming SA', 'Casino Max', 'Slot King'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Type</InputLabel>
                <Select label="Type" value={form.type ?? 'MONTHLY'} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {['MONTHLY', 'SETTLEMENT', 'SETUP', 'CREDIT_NOTE'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Issue Date" type="date" value={form.issueDate ?? ''} onChange={tf('issueDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Due Date" type="date" value={form.dueDate ?? ''} onChange={tf('dueDate')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? 'DRAFT'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Notes" multiline rows={2} value={form.notes ?? ''} onChange={tf('notes')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button variant="outlined" onClick={() => { setForm(p => ({ ...p, status: 'SENT' })); }}>Send</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Invoice — {editing?.invoiceNo}</DialogTitle>
        <DialogContent>
          {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Operator', editing.operator], ['Type', editing.type], ['Amount', `${editing.currency} ${editing.amount.toLocaleString()}`], ['Status', editing.status], ['Issue Date', editing.issueDate], ['Due Date', editing.dueDate], ['Paid Date', editing.paidDate || '—'], ['Notes', editing.notes || '—']] as [string, string][]).map(([k, v]) => (
              <Stack key={k} direction="row" justifyContent="space-between">
                <Typography color="text.secondary" variant="body2">{k}</Typography>
                <Typography variant="body2" fontWeight={500}>{v}</Typography>
              </Stack>
            ))}
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
          <Button variant="outlined" onClick={() => { setRows(rows.map(r => r.id === editing?.id ? { ...r, status: 'PAID', paidDate: new Date().toISOString().split('T')[0] } : r)); setViewOpen(false); }}>Mark Paid</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent><Typography>Delete invoice <strong>{editing?.invoiceNo}</strong>? This cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}