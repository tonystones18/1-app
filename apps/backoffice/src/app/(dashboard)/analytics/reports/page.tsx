'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Typography, Stack, Chip, Box } from '@mui/material';
import { PageShell, DataTable, StatusChip } from '@/components/ui/DataTable';

interface Report { id: string; name: string; type: string; status: string; format: string; period: string; generatedAt: string; size: string; requestedBy: string; }

const mockReports: Report[] = [
  { id: '1', name: 'Monthly Financial Summary — Jun 2026', type: 'FINANCIAL', status: 'READY', format: 'PDF', period: 'Jun 2026', generatedAt: '2026-07-01 06:00', size: '2.4 MB', requestedBy: 'cfo@company.com' },
  { id: '2', name: 'KYC Compliance Report — Q2 2026', type: 'COMPLIANCE', status: 'READY', format: 'PDF', period: 'Q2 2026', generatedAt: '2026-07-01 08:15', size: '1.8 MB', requestedBy: 'compliance@company.com' },
  { id: '3', name: 'Player Activity Report — Jun 2026', type: 'PLAYER', status: 'READY', format: 'XLSX', period: 'Jun 2026', generatedAt: '2026-07-01 09:30', size: '4.2 MB', requestedBy: 'analytics@company.com' },
  { id: '4', name: 'Provider Performance — Jun 2026', type: 'PROVIDER', status: 'READY', format: 'CSV', period: 'Jun 2026', generatedAt: '2026-07-01 10:00', size: '890 KB', requestedBy: 'tech@company.com' },
  { id: '5', name: 'Operator Revenue — Jun 2026', type: 'OPERATOR', status: 'READY', format: 'XLSX', period: 'Jun 2026', generatedAt: '2026-07-01 10:15', size: '1.1 MB', requestedBy: 'ops@company.com' },
  { id: '6', name: 'Settlement Summary — Jun 2026', type: 'SETTLEMENT', status: 'READY', format: 'PDF', period: 'Jun 2026', generatedAt: '2026-07-01 11:00', size: '640 KB', requestedBy: 'finance@company.com' },
  { id: '7', name: 'Monthly Financial Summary — Jul 2026', type: 'FINANCIAL', status: 'SCHEDULED', format: 'PDF', period: 'Jul 2026', generatedAt: '—', size: '—', requestedBy: 'cfo@company.com' },
  { id: '8', name: 'AML Monitoring Report — Jun 2026', type: 'COMPLIANCE', status: 'GENERATING', format: 'PDF', period: 'Jun 2026', generatedAt: '—', size: '—', requestedBy: 'compliance@company.com' },
  { id: '9', name: 'Q1 2026 Financial Report', type: 'FINANCIAL', status: 'READY', format: 'PDF', period: 'Q1 2026', generatedAt: '2026-04-01 09:00', size: '3.1 MB', requestedBy: 'cfo@company.com' },
  { id: '10', name: 'Player Segmentation — May 2026', type: 'PLAYER', status: 'FAILED', format: 'XLSX', period: 'May 2026', generatedAt: '2026-06-01 14:30', size: '—', requestedBy: 'analytics@company.com' },
];

const filterTabs = ['ALL_REPORTS', 'FINANCIAL', 'COMPLIANCE', 'PLAYER'];
const formatColors: Record<string, 'default'|'success'|'info'|'warning'|'error'> = { PDF: 'error', CSV: 'success', XLSX: 'info' };

export default function ReportsPage() {
  const [filter, setFilter] = useState('ALL_REPORTS');
  const [genOpen, setGenOpen] = useState(false);
  const [genType, setGenType] = useState('FINANCIAL');
  const [genPeriod, setGenPeriod] = useState('Jun 2026');

  const filtered = filter === 'ALL_REPORTS' ? mockReports : mockReports.filter(r => r.type === filter);

  const ready = mockReports.filter(r => r.status === 'READY').length;
  const scheduled = mockReports.filter(r => r.status === 'SCHEDULED').length;
  const failed = mockReports.filter(r => r.status === 'FAILED').length;
  const stats = [
    { label: 'Total Reports', value: String(mockReports.length) },
    { label: 'Ready', value: String(ready) },
    { label: 'Scheduled', value: String(scheduled) },
    { label: 'Failed', value: String(failed) },
  ];

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Report Name', flex: 1, minWidth: 280 },
    { field: 'type', headerName: 'Type', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'status', headerName: 'Status', width: 130, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'format', headerName: 'Format', width: 90, renderCell: ({ value }) => <Chip label={String(value)} size="small" color={formatColors[String(value)] ?? 'default'} variant="outlined" /> },
    { field: 'period', headerName: 'Period', width: 120 },
    { field: 'generatedAt', headerName: 'Generated At', width: 160 },
    { field: 'size', headerName: 'Size', width: 100, align: 'right', headerAlign: 'right' },
    { field: 'requestedBy', headerName: 'Requested By', width: 180 },
    {
      field: 'actions', headerName: 'Actions', width: 240, sortable: false, renderCell: ({ row }) => (
        <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <Button size="small" disabled={(row as Report).status !== 'READY'}>Download</Button>
          <Button size="small" color="warning">Regen</Button>
          <Button size="small" color="error">Delete</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Reports" subtitle="Scheduled and on-demand reports: financial, compliance, player, and operator"
      actions={<Button variant="contained" size="small" onClick={() => setGenOpen(true)}>Generate Report</Button>}>
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

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {filterTabs.map(f => (
          <Chip key={f} label={f.replace('_', ' ')} onClick={() => setFilter(f)} variant={filter === f ? 'filled' : 'outlined'} color={filter === f ? 'primary' : 'default'} />
        ))}
      </Box>

      <DataTable rows={filtered as unknown as Record<string, unknown>[]} columns={columns} />

      <Dialog open={genOpen} onClose={() => setGenOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth><InputLabel>Report Type</InputLabel>
                <Select label="Report Type" value={genType} onChange={e => setGenType(e.target.value)}>
                  {['FINANCIAL', 'COMPLIANCE', 'PLAYER', 'PROVIDER', 'OPERATOR', 'SETTLEMENT'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth><InputLabel>Period</InputLabel>
                <Select label="Period" value={genPeriod} onChange={e => setGenPeriod(e.target.value)}>
                  {['Jun 2026', 'May 2026', 'Apr 2026', 'Q2 2026', 'Q1 2026', 'YTD 2026'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setGenOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setGenOpen(false)}>Generate</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}