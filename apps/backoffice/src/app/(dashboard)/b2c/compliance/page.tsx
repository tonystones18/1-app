'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { PageShell, DataTable, StatusChip } from '@/components/ui/DataTable';

interface KycCase { id: string; caseRef: string; player: string; type: string; status: string; assignee: string; priority: string; submittedAt: string; reviewedAt: string; decision: string; notes: string; }

const priorityColors: Record<string, 'error'|'warning'|'info'> = { HIGH: 'error', MEDIUM: 'warning', LOW: 'info' };

const mockCases: KycCase[] = [
  { id: '1', caseRef: 'KYC-2026-00841', player: 'live_lover_de', type: 'KYC', status: 'PENDING', assignee: 'Emma Wilson', priority: 'HIGH', submittedAt: '2026-06-20', reviewedAt: '', decision: '', notes: '' },
  { id: '2', caseRef: 'AML-2026-00220', player: 'highroller_mt', type: 'AML', status: 'IN_REVIEW', assignee: 'James Carter', priority: 'HIGH', submittedAt: '2026-06-18', reviewedAt: '', decision: '', notes: 'Large transaction pattern detected' },
  { id: '3', caseRef: 'KYC-2026-00838', player: 'new_player_no', type: 'KYC', status: 'PENDING', assignee: '', priority: 'MEDIUM', submittedAt: '2026-06-20', reviewedAt: '', decision: '', notes: '' },
  { id: '4', caseRef: 'SOF-2026-00102', player: 'bigwin_se', type: 'SOURCE_OF_FUNDS', status: 'IN_REVIEW', assignee: 'Emma Wilson', priority: 'HIGH', submittedAt: '2026-06-15', reviewedAt: '', decision: '', notes: 'Requesting SOF documentation' },
  { id: '5', caseRef: 'PEP-2026-00044', player: 'vip_dk', type: 'PEP', status: 'APPROVED', assignee: 'James Carter', priority: 'MEDIUM', submittedAt: '2026-06-10', reviewedAt: '2026-06-12', decision: 'PEP screening cleared', notes: '' },
  { id: '6', caseRef: 'KYC-2026-00820', player: 'casual_player_fi', type: 'KYC', status: 'APPROVED', assignee: 'Maria Santos', priority: 'LOW', submittedAt: '2026-06-08', reviewedAt: '2026-06-09', decision: 'Documents verified', notes: '' },
  { id: '7', caseRef: 'EDD-2026-00038', player: 'poker_pro_cy', type: 'ENHANCED_DUE_DILIGENCE', status: 'ESCALATED', assignee: 'Director Level', priority: 'HIGH', submittedAt: '2026-06-05', reviewedAt: '', decision: '', notes: 'Escalated to MLRO' },
  { id: '8', caseRef: 'KYC-2026-00801', player: 'slots_fan_gb', type: 'KYC', status: 'REJECTED', assignee: 'Maria Santos', priority: 'MEDIUM', submittedAt: '2026-06-01', reviewedAt: '2026-06-03', decision: 'Documents unclear. Resubmission required.', notes: '' },
  { id: '9', caseRef: 'AML-2026-00198', player: 'suspended_user', type: 'AML', status: 'APPROVED', assignee: 'James Carter', priority: 'HIGH', submittedAt: '2026-05-28', reviewedAt: '2026-06-01', decision: 'Suspicious activity confirmed. Account suspended.', notes: '' },
  { id: '10', caseRef: 'KYC-2026-00780', player: 'new_vip_es', type: 'KYC', status: 'APPROVED', assignee: 'Emma Wilson', priority: 'LOW', submittedAt: '2026-05-25', reviewedAt: '2026-05-27', decision: 'Documents verified', notes: '' },
];

export default function CompliancePage() {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cases, setCases] = useState<KycCase[]>(mockCases);
  const [selected, setSelected] = useState<KycCase | null>(null);
  const [form, setForm] = useState<Partial<KycCase>>({});

  const openView = (row: KycCase) => { setSelected(row); setViewOpen(true); };
  const openEdit = (row: KycCase) => { setSelected(row); setForm({ status: row.status, assignee: row.assignee, decision: row.decision, notes: row.notes }); setEditOpen(true); };
  const handleUpdate = () => {
    setCases(cases.map(r => r.id === selected?.id ? { ...r, ...form, reviewedAt: new Date().toISOString().split('T')[0] } : r));
    setEditOpen(false);
  };

  const open = cases.filter(c => ['PENDING', 'IN_REVIEW', 'ESCALATED'].includes(c.status)).length;
  const highPri = cases.filter(c => c.priority === 'HIGH' && c.status !== 'APPROVED' && c.status !== 'REJECTED').length;
  const pending = cases.filter(c => c.status === 'PENDING').length;
  const completed = cases.filter(c => ['APPROVED', 'REJECTED'].includes(c.status)).length;
  const stats = [
    { label: 'Open Cases', value: String(open) },
    { label: 'High Priority', value: String(highPri) },
    { label: 'Pending Review', value: String(pending) },
    { label: 'Completed', value: String(completed) },
  ];

  const columns: GridColDef[] = [
    { field: 'caseRef', headerName: 'Case Ref', width: 160, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'player', headerName: 'Player', width: 160 },
    { field: 'type', headerName: 'Type', width: 190, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'status', headerName: 'Status', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'priority', headerName: 'Priority', width: 110, renderCell: ({ value }) => <Chip label={String(value)} size="small" color={priorityColors[String(value)] ?? 'default'} /> },
    { field: 'assignee', headerName: 'Assignee', width: 150 },
    { field: 'submittedAt', headerName: 'Submitted', width: 120 },
    { field: 'reviewedAt', headerName: 'Reviewed', width: 120 },
    {
      field: 'actions', headerName: 'Actions', width: 180, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" onClick={() => openView(row as KycCase)}>View</Button>
          <Button size="small" onClick={() => openEdit(row as KycCase)}>Review</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Compliance / KYC" subtitle="KYC verification, AML monitoring, and regulatory compliance cases">
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
      <DataTable rows={cases as unknown as Record<string, unknown>[]} columns={columns} />

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Case Details — {selected?.caseRef}</DialogTitle>
        <DialogContent>
          {selected && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Player', selected.player], ['Type', selected.type], ['Status', selected.status], ['Priority', selected.priority], ['Assignee', selected.assignee || '—'], ['Submitted', selected.submittedAt], ['Reviewed', selected.reviewedAt || '—'], ['Decision', selected.decision || '—'], ['Notes', selected.notes || '—']] as [string, string][]).map(([k, v]) => (
              <Stack key={k} direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography color="text.secondary" variant="body2" sx={{ minWidth: 100 }}>{k}</Typography>
                <Typography variant="body2" fontWeight={500} sx={{ textAlign: 'right', flex: 1 }}>{v}</Typography>
              </Stack>
            ))}
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setViewOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Review Case — {selected?.caseRef}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Status</InputLabel>
                <Select label="Status" value={form.status ?? ''} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth><InputLabel>Assignee</InputLabel>
                <Select label="Assignee" value={form.assignee ?? ''} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}>
                  {['Emma Wilson', 'James Carter', 'Maria Santos', 'Director Level'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Decision" value={form.decision ?? ''} onChange={e => setForm(p => ({ ...p, decision: e.target.value }))} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Notes" multiline rows={3} value={form.notes ?? ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save Decision</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}