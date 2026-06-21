'use client';
import React, { useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, CardContent, Typography, Stack, Chip, Box } from '@mui/material';
import { PageShell, DataTable, StatusChip } from '@/components/ui/DataTable';

interface AuditEvent { id: string; eventId: string; actor: string; actorRole: string; action: string; resource: string; resourceId: string; ip: string; result: string; createdAt: string; payload: Record<string, unknown>; }

const mockEvents: AuditEvent[] = [
  { id: '1', eventId: 'EVT-20260621-9991', actor: 'admin@visionesoft.com', actorRole: 'SUPER_ADMIN', action: 'settings.changed', resource: 'Platform', resourceId: 'global', ip: '82.45.12.100', result: 'SUCCESS', createdAt: '2026-06-21 15:44', payload: { setting: 'max_bet_limit', oldValue: 5000, newValue: 10000 } },
  { id: '2', eventId: 'EVT-20260621-9990', actor: 'ops@visionesoft.com', actorRole: 'OPERATOR_MANAGER', action: 'operator.updated', resource: 'Operator', resourceId: 'betzone', ip: '91.120.44.21', result: 'SUCCESS', createdAt: '2026-06-21 15:30', payload: { field: 'status', oldValue: 'ACTIVE', newValue: 'ACTIVE', note: 'Tier upgrade' } },
  { id: '3', eventId: 'EVT-20260621-9989', actor: 'compliance@visionesoft.com', actorRole: 'COMPLIANCE_OFFICER', action: 'kyc.approved', resource: 'KYC Case', resourceId: 'KYC-2026-00820', ip: '10.0.1.42', result: 'SUCCESS', createdAt: '2026-06-21 14:58', payload: { caseRef: 'KYC-2026-00820', player: 'casual_player_fi', decision: 'Documents verified' } },
  { id: '4', eventId: 'EVT-20260621-9988', actor: 'admin@visionesoft.com', actorRole: 'SUPER_ADMIN', action: 'route.disabled', resource: 'Route', resourceId: 'netent-legacy', ip: '82.45.12.100', result: 'SUCCESS', createdAt: '2026-06-21 14:22', payload: { routeName: 'NetEnt Legacy', reason: 'Low performance' } },
  { id: '5', eventId: 'EVT-20260621-9987', actor: 'finance@visionesoft.com', actorRole: 'FINANCE_MANAGER', action: 'invoice.sent', resource: 'Invoice', resourceId: 'INV-2026-0841', ip: '192.168.1.22', result: 'SUCCESS', createdAt: '2026-06-21 13:15', payload: { invoiceNo: 'INV-2026-0841', operator: 'BetZone Ltd', amount: 84200 } },
  { id: '6', eventId: 'EVT-20260621-9986', actor: 'admin@betzone.com', actorRole: 'OPERATOR_ADMIN', action: 'player.suspended', resource: 'Player', resourceId: 'suspended_user', ip: '178.22.98.11', result: 'SUCCESS', createdAt: '2026-06-21 12:44', payload: { reason: 'Fraud investigation', suspendedBy: 'admin@betzone.com' } },
  { id: '7', eventId: 'EVT-20260621-9985', actor: 'api-gateway', actorRole: 'SYSTEM', action: 'payment.approved', resource: 'Payment', resourceId: 'PAY-20260621-8841', ip: '10.0.0.1', result: 'SUCCESS', createdAt: '2026-06-21 14:23', payload: { amount: 5000, currency: 'USD', method: 'VISA' } },
  { id: '8', eventId: 'EVT-20260621-9984', actor: 'unknown', actorRole: 'ANONYMOUS', action: 'user.login', resource: 'Auth', resourceId: 'admin@betzone.com', ip: '220.84.12.44', result: 'FAILED', createdAt: '2026-06-21 11:58', payload: { reason: 'Invalid credentials', attempts: 3 } },
  { id: '9', eventId: 'EVT-20260621-9983', actor: 'admin@visionesoft.com', actorRole: 'SUPER_ADMIN', action: 'bonus.created', resource: 'Bonus', resourceId: 'XMAS2026', ip: '82.45.12.100', result: 'SUCCESS', createdAt: '2026-06-21 10:30', payload: { code: 'XMAS2026', type: 'WELCOME', value: 500 } },
  { id: '10', eventId: 'EVT-20260621-9982', actor: 'ops@visionesoft.com', actorRole: 'OPERATOR_MANAGER', action: 'provider.created', resource: 'Provider', resourceId: 'hacksaw', ip: '91.120.44.21', result: 'SUCCESS', createdAt: '2026-06-21 09:15', payload: { code: 'hacksaw', name: 'Hacksaw Gaming', type: 'PUBLISHER' } },
  { id: '11', eventId: 'EVT-20260620-9960', actor: 'admin@visionesoft.com', actorRole: 'SUPER_ADMIN', action: 'user.login', resource: 'Auth', resourceId: 'admin@visionesoft.com', ip: '82.45.12.100', result: 'SUCCESS', createdAt: '2026-06-20 08:00', payload: { method: '2FA', device: 'Chrome/macOS' } },
  { id: '12', eventId: 'EVT-20260619-9940', actor: 'system', actorRole: 'SYSTEM', action: 'operator.updated', resource: 'Operator', resourceId: 'casinomax', ip: '10.0.0.1', result: 'FAILED', createdAt: '2026-06-19 22:00', payload: { error: 'Database timeout', retries: 3 } },
];

const uniqueActors = new Set(mockEvents.map(e => e.actor)).size;
const last24h = mockEvents.filter(e => e.createdAt.startsWith('2026-06-21')).length;
const failed = mockEvents.filter(e => e.result === 'FAILED').length;

export default function AuditPage() {
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  const stats = [
    { label: 'Total Events', value: String(mockEvents.length) },
    { label: 'Failed Actions', value: String(failed) },
    { label: 'Unique Actors', value: String(uniqueActors) },
    { label: 'Last 24h', value: String(last24h) },
  ];

  const columns: GridColDef[] = [
    { field: 'eventId', headerName: 'Event ID', width: 200, renderCell: ({ value }) => <code style={{ fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{String(value)}</code> },
    { field: 'actor', headerName: 'Actor', width: 200 },
    { field: 'actorRole', headerName: 'Role', width: 160 },
    { field: 'action', headerName: 'Action', width: 180, renderCell: ({ value }) => <Chip label={String(value)} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: 11 }} /> },
    { field: 'resource', headerName: 'Resource', width: 130 },
    { field: 'result', headerName: 'Result', width: 110, renderCell: ({ value }) => <StatusChip status={String(value) === 'SUCCESS' ? 'ACTIVE' : 'FAILED'} /> },
    { field: 'ip', headerName: 'IP Address', width: 140 },
    { field: 'createdAt', headerName: 'Timestamp', flex: 1, minWidth: 160 },
    {
      field: 'actions', headerName: 'Details', width: 90, sortable: false, renderCell: ({ row }) => (
        <Stack sx={{ height: '100%', justifyContent: 'center' }}>
          <Button size="small" onClick={() => { setSelected(row as AuditEvent); setViewOpen(true); }}>View</Button>
        </Stack>
      )
    }
  ];

  return (
    <PageShell title="Audit Log" subtitle="Immutable audit trail of all platform actions and system events">
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
      <DataTable rows={mockEvents as unknown as Record<string, unknown>[]} columns={columns} />

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Event Details — {selected?.eventId}</DialogTitle>
        <DialogContent>
          {selected && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {([['Event ID', selected.eventId], ['Actor', selected.actor], ['Role', selected.actorRole], ['Action', selected.action], ['Resource', selected.resource], ['Resource ID', selected.resourceId], ['IP Address', selected.ip], ['Result', selected.result], ['Timestamp', selected.createdAt]] as [string, string][]).map(([k, v]) => (
                <Stack key={k} direction="row" justifyContent="space-between">
                  <Typography color="text.secondary" variant="body2">{k}</Typography>
                  <Typography variant="body2" fontWeight={500}>{v}</Typography>
                </Stack>
              ))}
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>PAYLOAD</Typography>
                <Box component="pre" sx={{ mt: 0.5, p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontSize: 11, fontFamily: 'monospace', overflow: 'auto', maxHeight: 200 }}>
                  {JSON.stringify(selected.payload, null, 2)}
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setViewOpen(false)}>Close</Button></DialogActions>
      </Dialog>
    </PageShell>
  );
}