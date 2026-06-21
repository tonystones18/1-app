'use client';
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Tabs, Tab, Grid, TextField, Chip, Switch, FormControlLabel, Button, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { Save } from '@mui/icons-material';
import { PageShell } from '@/components/ui/DataTable';

const roles = [
  { id: 'owner_admin', label: 'Owner Admin', buyPrice: true, permissions: 84 },
  { id: 'aggregator_admin', label: 'Aggregator Admin', buyPrice: false, permissions: 72 },
  { id: 'finance_admin', label: 'Finance Admin', buyPrice: false, permissions: 32 },
  { id: 'compliance_admin', label: 'Compliance Admin', buyPrice: false, permissions: 28 },
  { id: 'media_manager', label: 'Media Manager', buyPrice: false, permissions: 15 },
  { id: 'support', label: 'Support', buyPrice: false, permissions: 10 },
];

const flags = [
  { name: 'ai_copilot', description: 'AI Copilot for all roles', enabled: true, rollout: '100%' },
  { name: 'media_ai_generation', description: 'AI media generation', enabled: true, rollout: '100%' },
  { name: 'sportsbook', description: 'Sportsbook module', enabled: false, rollout: '0%' },
  { name: 'mobile_apps', description: 'White-label mobile apps', enabled: false, rollout: '0%' },
  { name: 'advanced_routing', description: 'Route simulation v2', enabled: true, rollout: '50%' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState(0);
  return (
    <PageShell title="Settings" subtitle="Platform configuration, RBAC roles, feature flags, and integrations" actions={<Button variant="contained" startIcon={<Save />} disableElevation>Save Changes</Button>}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="General" /><Tab label="RBAC & Roles" /><Tab label="Feature Flags" /><Tab label="Integrations" /><Tab label="System" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Platform Configuration</Typography>
            <Grid container spacing={3}>
              {[['Platform Name', 'VisioneSoft Platform'], ['Default Currency', 'USD'], ['Default Language', 'en'], ['Timezone', 'UTC'], ['Support Email', 'support@visionesoft.com'], ['Build Version', 'v33.0.0 — Phase 0']].map(([label, value]) => (
                <Grid key={label} size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label={label} defaultValue={value} size="small" disabled={label === 'Build Version'} />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>RBAC Role Registry</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Role ID</TableCell><TableCell>Label</TableCell><TableCell>Buy Price Access</TableCell><TableCell align="right">Permissions</TableCell></TableRow></TableHead>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell><code style={{ fontSize: 12, fontFamily: 'monospace' }}>{r.id}</code></TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{r.label}</TableCell>
                    <TableCell><Chip label={r.buyPrice ? 'Yes' : 'No'} size="small" color={r.buyPrice ? 'success' : 'error'} variant="outlined" /></TableCell>
                    <TableCell align="right"><Chip label={`${r.permissions} permissions`} size="small" variant="outlined" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Feature Flags</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Flag</TableCell><TableCell>Description</TableCell><TableCell>Status</TableCell><TableCell>Rollout</TableCell><TableCell>Toggle</TableCell></TableRow></TableHead>
              <TableBody>
                {flags.map((f) => (
                  <TableRow key={f.name} hover>
                    <TableCell><code style={{ fontSize: 12, fontFamily: 'monospace' }}>{f.name}</code></TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{f.description}</TableCell>
                    <TableCell><Chip label={f.enabled ? 'enabled' : 'disabled'} size="small" color={f.enabled ? 'success' : 'default'} variant="outlined" /></TableCell>
                    <TableCell>{f.rollout}</TableCell>
                    <TableCell><Switch defaultChecked={f.enabled} size="small" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Grid container spacing={2}>
          {[{ name: 'PostgreSQL', status: 'connected' }, { name: 'Redis', status: 'connected' }, { name: 'ClickHouse', status: 'pending' }, { name: 'Cloudflare R2', status: 'configured' }, { name: 'Cloudflare Images', status: 'configured' }, { name: 'OpenTelemetry', status: 'configured' }, { name: 'Prometheus', status: 'configured' }, { name: 'Grafana', status: 'pending' }, { name: 'BullMQ', status: 'configured' }].map((i) => (
            <Grid key={i.name} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '12px !important' }}>
                  <Box sx={{ flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{i.name}</Typography></Box>
                  <Chip label={i.status} size="small" color={i.status === 'connected' || i.status === 'configured' ? 'success' : 'warning'} variant="outlined" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {tab === 4 && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Table size="small">
              <TableBody>
                {[['Architecture Version', 'v33.0.0'], ['Build Stage', 'Phase 0 → Active Build'], ['Frontend', 'Next.js 15 + React 19 + MUI + React Query + Zustand'], ['Backend', 'NestJS + Prisma + PostgreSQL + Redis + BullMQ'], ['Infrastructure', 'Docker + Kubernetes + Prometheus + Grafana + OpenTelemetry'], ['Database Models', '55+'], ['API Modules', '7 NestJS modules'], ['Services', '28 service implementations'], ['Node.js', '>=20.19.0'], ['Package Manager', 'pnpm 9.x'], ['Build System', 'Turborepo']].map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell sx={{ color: 'text.secondary', width: 220 }}>{k}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{v}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
