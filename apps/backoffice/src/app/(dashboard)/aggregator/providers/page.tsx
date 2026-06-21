'use client';
import React, { useState } from 'react';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import {
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Grid, Box, Typography, IconButton, Divider, Alert,
} from '@mui/material';
import { Close, Edit, Delete, Visibility, CheckCircle, Warning } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';

const mockProviders = [
  { id: '1', code: 'pragmatic', name: 'Pragmatic Play', status: 'ACTIVE', metadata: { walletMode: 'seamless', games: 312, health: 'ok', rtp: 96.5, launchMs: 142 } },
  { id: '2', code: 'evolution', name: 'Evolution Gaming', status: 'ACTIVE', metadata: { walletMode: 'seamless', games: 180, health: 'ok', rtp: 97.2, launchMs: 98 } },
  { id: '3', code: 'pgsoft', name: 'PG Soft', status: 'ACTIVE', metadata: { walletMode: 'transfer', games: 220, health: 'ok', rtp: 96.8, launchMs: 165 } },
  { id: '4', code: 'hacksaw', name: 'Hacksaw Gaming', status: 'ACTIVE', metadata: { walletMode: 'seamless', games: 78, health: 'degraded', rtp: 96.1, launchMs: 310 } },
  { id: '5', code: 'amusnet', name: 'Amusnet Interactive', status: 'DRAFT', metadata: { walletMode: 'transfer', games: 95, health: 'ok', rtp: 95.9, launchMs: 188 } },
  { id: '6', code: 'jili', name: 'JILI Games', status: 'ACTIVE', metadata: { walletMode: 'seamless', games: 140, health: 'ok', rtp: 96.3, launchMs: 124 } },
  { id: '7', code: 'netent', name: 'NetEnt', status: 'ACTIVE', metadata: { walletMode: 'seamless', games: 290, health: 'ok', rtp: 96.9, launchMs: 108 } },
  { id: '8', code: 'playtech', name: 'Playtech', status: 'SUSPENDED', metadata: { walletMode: 'transfer', games: 410, health: 'down', rtp: 95.5, launchMs: 0 } },
];

type Provider = typeof mockProviders[0];

interface ProviderDialogProps {
  open: boolean;
  mode: 'add' | 'edit' | 'view';
  provider?: Provider | null;
  onClose: () => void;
}

function ProviderDialog({ open, mode, provider, onClose }: ProviderDialogProps) {
  const [name, setName] = useState(provider?.name ?? '');
  const [code, setCode] = useState(provider?.code ?? '');
  const [status, setStatus] = useState(provider?.status ?? 'DRAFT');
  const [walletMode, setWalletMode] = useState(provider?.metadata?.walletMode ?? 'seamless');
  const readonly = mode === 'view';
  const title = mode === 'add' ? 'Add Provider' : mode === 'edit' ? 'Edit Provider' : 'Provider Details';

  React.useEffect(() => {
    if (provider) { setName(provider.name); setCode(provider.code); setStatus(provider.status); setWalletMode(provider.metadata?.walletMode ?? 'seamless'); }
    else { setName(''); setCode(''); setStatus('DRAFT'); setWalletMode('seamless'); }
  }, [provider, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
        <IconButton size="small" onClick={onClose}><Close /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        {mode === 'view' && provider && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', gap: 3 }}>
            {[
              { label: 'Games', value: provider.metadata.games },
              { label: 'Avg Launch', value: `${provider.metadata.launchMs}ms` },
              { label: 'RTP', value: `${provider.metadata.rtp}%` },
            ].map((s) => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Box>
            ))}
          </Box>
        )}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth size="small" label="Provider Name" value={name} onChange={(e) => setName(e.target.value)} disabled={readonly} required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth size="small" label="Provider Code" value={code} onChange={(e) => setCode(e.target.value)} disabled={readonly} required helperText="Lowercase slug, e.g. evolution" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" disabled={readonly}>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
                <MenuItem value="ARCHIVED">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" disabled={readonly}>
              <InputLabel>Wallet Mode</InputLabel>
              <Select value={walletMode} label="Wallet Mode" onChange={(e) => setWalletMode(e.target.value)}>
                <MenuItem value="seamless">Seamless</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth size="small" label="API Endpoint URL" disabled={readonly} defaultValue={readonly ? `https://api.${code}.com/v2` : ''} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth size="small" label="Secret Key" type="password" disabled={readonly} defaultValue={readonly ? '••••••••••••••••' : ''} helperText="Stored encrypted at rest" />
          </Grid>
        </Grid>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small">Cancel</Button>
        {!readonly && (
          <Button variant="contained" size="small" startIcon={mode === 'add' ? <CheckCircle /> : <Edit />} onClick={onClose}>
            {mode === 'add' ? 'Create Provider' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

interface DeleteDialogProps { open: boolean; provider?: Provider | null; onClose: () => void; }
function DeleteDialog({ open, provider, onClose }: DeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Delete Provider</DialogTitle>
      <DialogContent>
        <Alert severity="error" sx={{ mb: 2 }}>This action cannot be undone.</Alert>
        <Typography variant="body2">
          Are you sure you want to delete <strong>{provider?.name}</strong>? All associated routes and pricing will be removed.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small">Cancel</Button>
        <Button variant="contained" color="error" size="small" startIcon={<Delete />} onClick={onClose}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ProvidersPage() {
  const [dialog, setDialog] = useState<{ open: boolean; mode: 'add' | 'edit' | 'view'; provider?: Provider | null }>({ open: false, mode: 'add' });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; provider?: Provider | null }>({ open: false });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['providers'],
    queryFn: () => apiGet<{ providers: typeof mockProviders }>('/aggregator/providers'),
  });

  const rows = (data?.providers ?? mockProviders) as Record<string, unknown>[];

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 130, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'name', headerName: 'Provider Name', flex: 1, minWidth: 180 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
    { field: 'walletMode', headerName: 'Wallet Mode', width: 130, valueGetter: (_, row) => (row.metadata as Record<string, unknown>)?.walletMode ?? '—', renderCell: ({ value }) => <Chip label={String(value)} size="small" variant="outlined" /> },
    { field: 'games', headerName: 'Games', width: 80, align: 'right', headerAlign: 'right', valueGetter: (_, row) => (row.metadata as Record<string, unknown>)?.games ?? 0 },
    { field: 'health', headerName: 'Health', width: 100, valueGetter: (_, row) => (row.metadata as Record<string, unknown>)?.health ?? '—', renderCell: ({ value }) => {
      const v = String(value);
      return <Chip size="small" label={v} color={v === 'ok' ? 'success' : v === 'degraded' ? 'warning' : 'error'} icon={v === 'ok' ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Warning sx={{ fontSize: '14px !important' }} />} />;
    }},
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false, renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => setDialog({ open: true, mode: 'view', provider: row as Provider })}><Visibility sx={{ fontSize: 16 }} /></IconButton>
          <IconButton size="small" onClick={() => setDialog({ open: true, mode: 'edit', provider: row as Provider })}><Edit sx={{ fontSize: 16 }} /></IconButton>
          <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, provider: row as Provider })}><Delete sx={{ fontSize: 16 }} /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <PageShell
      title="Providers"
      subtitle="Game provider integrations, health monitoring, and configuration"
      actions={<AddButton label="Add Provider" onClick={() => setDialog({ open: true, mode: 'add' })} />}
    >
      <DataTable
        rows={rows}
        columns={columns}
        loading={isLoading}
        error={error ? 'Using mock data — connect API gateway to load live providers' : null}
        onRefresh={() => void refetch()}
      />
      <ProviderDialog
        open={dialog.open}
        mode={dialog.mode}
        provider={dialog.provider}
        onClose={() => setDialog({ open: false, mode: 'add' })}
      />
      <DeleteDialog
        open={deleteDialog.open}
        provider={deleteDialog.provider}
        onClose={() => setDeleteDialog({ open: false })}
      />
    </PageShell>
  );
}

