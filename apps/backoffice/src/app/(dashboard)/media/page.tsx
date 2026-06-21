'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Chip, Grid, Card, CardContent, Typography } from '@mui/material';
import { PageShell, DataTable, StatusChip, AddButton } from '@/components/ui/DataTable';
const kpis = [{ label: 'Total Assets', value: '4' }, { label: 'Pending Approval', value: '1' }, { label: 'AI Generated', value: '1' }, { label: 'CDN Deliveries', value: '—' }];
const mock: Record<string, unknown>[] = [
  { id: '1', title: 'Pragmatic Play Logo', type: 'provider_logo', ownerType: 'provider', status: 'APPROVED', size: '42KB', mimeType: 'image/svg+xml' },
  { id: '2', title: 'Gates of Olympus Thumbnail', type: 'game_image', ownerType: 'game', status: 'APPROVED', size: '128KB', mimeType: 'image/webp' },
  { id: '3', title: 'Summer Promotion Banner', type: 'banner', ownerType: 'campaign', status: 'PENDING_APPROVAL', size: '256KB', mimeType: 'image/jpeg' },
  { id: '4', title: 'AI Generated Background', type: 'ai_generated', ownerType: 'platform', status: 'DRAFT', size: '1.2MB', mimeType: 'image/png' },
];
const columns: GridColDef[] = [
  { field: 'title', headerName: 'Asset Name', flex: 1 },
  { field: 'type', headerName: 'Type', width: 150, renderCell: ({ value }) => <Chip label={String(value).replace('_', ' ')} size="small" variant="outlined" /> },
  { field: 'ownerType', headerName: 'Owner', width: 120 },
  { field: 'status', headerName: 'Status', width: 150, renderCell: ({ value }) => <StatusChip status={String(value)} /> },
  { field: 'size', headerName: 'Size', width: 90, align: 'right', headerAlign: 'right' },
  { field: 'mimeType', headerName: 'MIME', width: 150 },
];
export default function MediaPage() {
  return (
    <PageShell title="Media Center" subtitle="Asset library, Cloudflare Images, R2 storage, approvals, and AI generation" actions={<><AddButton label="Generate with AI" /><AddButton label="Upload Asset" /></>}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpis.map((k) => (
          <Grid key={k.label} size={{ xs: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', textAlign: 'center', py: 1 }}>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 500 }}>{k.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>{k.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <DataTable rows={mock} columns={columns} />
    </PageShell>
  );
}
