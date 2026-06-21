'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

interface Deal { id: string; dealRef: string; company: string; contact: string; email: string; phone: string; stage: string; value: number; assignee: string; nextAction: string; updatedAt: string; notes: string; }

const stageColors: Record<string, 'default'|'info'|'warning'|'secondary'|'primary'|'success'|'error'> = {
  LEAD: 'default', QUALIFIED: 'info', DEMO: 'warning', PROPOSAL: 'secondary', NEGOTIATION: 'primary', CLOSED_WON: 'success', CLOSED_LOST: 'error',
};

const mockDeals: Deal[] = [
  { id: '1', dealRef: 'CRM-2026-0091', company: 'Stellar Gaming Ltd', contact: 'John Mitchell', email: 'j.mitchell@stellar.com', phone: '+44 7700 900123', stage: 'NEGOTIATION', value: 180000, assignee: 'Alex Turner', nextAction: '2026-06-25', updatedAt: '2026-06-21', notes: 'Finalizing integration terms' },
  { id: '2', dealRef: 'CRM-2026-0090', company: 'Apex Casino Group', contact: 'Maria Rodriguez', email: 'm.rodriguez@apex.io', phone: '+34 612 345678', stage: 'PROPOSAL', value: 250000, assignee: 'Sarah Lee', nextAction: '2026-06-28', updatedAt: '2026-06-20', notes: 'Sent custom pricing proposal' },
  { id: '3', dealRef: 'CRM-2026-0089', company: 'Nordic Bet AS', contact: 'Erik Larsson', email: 'e.larsson@nordicbet.no', phone: '+47 901 23456', stage: 'DEMO', value: 120000, assignee: 'Alex Turner', nextAction: '2026-06-24', updatedAt: '2026-06-19', notes: 'Live demo scheduled' },
  { id: '4', dealRef: 'CRM-2026-0085', company: 'Sun Gaming MT', contact: 'Carlo Azzopardi', email: 'c.azzopardi@sungaming.mt', phone: '+356 2100 0001', stage: 'CLOSED_WON', value: 95000, assignee: 'Sarah Lee', nextAction: '', updatedAt: '2026-06-15', notes: 'Contract signed. Onboarding started.' },
  { id: '5', dealRef: 'CRM-2026-0082', company: 'BlackBet CY', contact: 'Andreas Stavros', email: 'a.stavros@blackbet.cy', phone: '+357 22 123456', stage: 'QUALIFIED', value: 75000, assignee: 'Mike Patel', nextAction: '2026-06-30', updatedAt: '2026-06-14', notes: '' },
  { id: '6', dealRef: 'CRM-2026-0080', company: 'Fortuna Sports ES', contact: 'Isabella Garcia', email: 'i.garcia@fortunasports.es', phone: '+34 698 765432', stage: 'LEAD', value: 50000, assignee: 'Mike Patel', nextAction: '2026-07-02', updatedAt: '2026-06-12', notes: 'Initial contact via conference' },
  { id: '7', dealRef: 'CRM-2026-0075', company: 'Baltic Gaming EE', contact: 'Tomas Kask', email: 't.kask@balticgaming.ee', phone: '+372 5 123456', stage: 'CLOSED_LOST', value: 60000, assignee: 'Alex Turner', nextAction: '', updatedAt: '2026-06-01', notes: 'Chose competitor solution' },
  { id: '8', dealRef: 'CRM-2026-0074', company: 'Crimson Casino DE', contact: 'Hans Weber', email: 'h.weber@crimsoncasino.de', phone: '+49 160 1234567', stage: 'DEMO', value: 140000, assignee: 'Sarah Lee', nextAction: '2026-06-27', updatedAt: '2026-06-18', notes: 'Technical due diligence in progress' },
];

const empty = (): Partial<Deal> => ({ dealRef: '', company: '', contact: '', email: '', phone: '', stage: 'LEAD', value: 0, assignee: '', nextAction: '', updatedAt: new Date().toISOString().split('T')[0], notes: '' });

export default function CRMPage() {
  const [rows, setRows] = useState<Deal[]>(mockDeals);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState<Partial<Deal>>(empty());

  const openAdd = () => { setEditing(null); setForm(empty()); setDlgOpen(true); };
  const openEdit = (row: Deal) => { setEditing(row); setForm({ ...row }); setDlgOpen(true); };
  const openView = (row: Deal) => { setEditing(row); setViewOpen(true); };
  const openDelete = (row: Deal) => { setEditing(row); setDeleteOpen(true); };
  const handleSave = () => {
    if (editing) setRows(rows.map(r => r.id === editing.id ? { ...r, ...form } as Deal : r));
    else setRows([...rows, { ...form, id: String(Date.now()) } as Deal]);
    setDlgOpen(false);
  };
  const handleDelete = () => { setRows(rows.filter(r => r.id !== editing?.id)); setDeleteOpen(false); };
  const tf = (k: keyof Deal) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const pipelineValue = rows.filter(r => !['CLOSED_WON', 'CLOSED_LOST'].includes(r.stage)).reduce((a, r) => a + r.value, 0);
  const closedWon = rows.filter(r => r.stage === 'CLOSED_WON');
  const closedWonValue = closedWon.reduce((a, r) => a + r.value, 0);
  const convRate = rows.length ? ((closedWon.length / rows.length) * 100).toFixed(0) : '0';
  const stats = [
    { label: 'Total Deals', value: String(rows.length) },
    { label: 'Pipeline Value', value: `$${(pipelineValue / 1000).toFixed(0)}K` },
    { label: 'Closed Won', value: `$${(closedWonValue / 1000).toFixed(0)}K` },
    { label: 'Conversion Rate', value: `${convRate}%` },
  ];

  const columns: GridColDef[] = [
    { field: 'dealRef', headerName: 'Deal Ref', width: 160 },
    { field: 'company', headerName: 'Company', flex: 1, minWidth: 180 },
    { field: 'contact', headerName: 'Contact', width: 160 },
    { field: 'stage', headerName: 'Stage', width: 150, renderCell: ({ value }) => <Chip label={String(value).replace('_', ' ')} size="small" color={stageColors[String(value)] ?? 'default'} /> },
    { field: 'value', headerName: 'Deal Value', width: 130, align: 'right', headerAlign: 'right', valueFormatter: (v) => `$${Number(v).toLocaleString()}` },
    { field: 'assignee', headerName: 'Assignee', width: 130 },
    { field: 'nextAction', headerName: 'Next Action', width: 130 },
    { field: 'updatedAt', headerName: 'Updated', width: 120 },
    {
      field: 'actions', headerName: 'Actions', width: 210, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openView(row as Deal)}>View</Button>
          <Button size="small" onClick={() => openEdit(row as Deal)}>Edit</Button>
          <Button size="small" color="error" onClick={() => openDelete(row as Deal)}>Del</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="CRM — Operator Pipeline" subtitle="Operator prospect pipeline, deal stages, and revenue forecasting" actions={<AddButton label="Add Deal" onClick={openAdd} />}>
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
        <DialogTitle>{editing ? 'Edit Deal' : 'Add Deal'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}><TextField fullWidth label="Company" value={form.company ?? ''} onChange={tf('company')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Deal Ref" value={form.dealRef ?? ''} onChange={tf('dealRef')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Contact Name" value={form.contact ?? ''} onChange={tf('contact')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email" value={form.email ?? ''} onChange={tf('email')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Phone" value={form.phone ?? ''} onChange={tf('phone')} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Stage</InputLabel>
                <Select label="Stage" value={form.stage ?? 'LEAD'} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}>
                  {['LEAD', 'QUALIFIED', 'DEMO', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'].map(v => <MenuItem key={v} value={v}>{v.replace('_', ' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Deal Value ($)" type="number" value={form.value ?? ''} onChange={tf('value')} /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth><InputLabel>Assignee</InputLabel>
                <Select label="Assignee" value={form.assignee ?? ''} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}>
                  {['Alex Turner', 'Sarah Lee', 'Mike Patel'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Next Action Date" type="date" value={form.nextAction ?? ''} onChange={tf('nextAction')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Notes" multiline rows={2} value={form.notes ?? ''} onChange={tf('notes')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{editing?.dealRef} — {editing?.company}</DialogTitle>
        <DialogContent>
          {editing && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Company', editing.company], ['Contact', editing.contact], ['Email', editing.email], ['Phone', editing.phone], ['Stage', editing.stage], ['Value', `$${editing.value.toLocaleString()}`], ['Assignee', editing.assignee], ['Next Action', editing.nextAction || '—'], ['Notes', editing.notes || '—']] as [string, string][]).map(([k, v]) => (
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
        <DialogTitle>Delete Deal</DialogTitle>
        <DialogContent><Typography>Delete deal <strong>{editing?.dealRef}</strong> for {editing?.company}?</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}