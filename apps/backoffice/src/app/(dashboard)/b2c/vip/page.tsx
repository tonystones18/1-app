'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { PageShell, DataTable, AddButton } from '@/components/ui/DataTable';
const tiers = [
  { id: 1, name: 'Bronze', level: 1, players: 1840, minPoints: 0, color: '#CD7F32', perks: '5% cashback, standard support' },
  { id: 2, name: 'Silver', level: 2, players: 420, minPoints: 10000, color: '#C0C0C0', perks: '10% cashback, priority support, fast withdrawals' },
  { id: 3, name: 'Gold', level: 3, players: 87, minPoints: 50000, color: '#FFD700', perks: 'Personal host, 15% cashback, unlimited withdrawals' },
  { id: 4, name: 'Diamond', level: 4, players: 12, minPoints: 200000, color: '#B9F2FF', perks: 'Concierge, custom limits, birthday bonus' },
];
const players: Record<string, unknown>[] = [
  { id: '1', email: 'highroller@example.com', tier: 'Diamond', points: 245000, host: 'Sarah Johnson', ggr: '€84,200' },
  { id: '2', email: 'goldplayer@example.com', tier: 'Gold', points: 72000, host: 'Mike Chen', ggr: '£31,400' },
  { id: '3', email: 'silver1@example.com', tier: 'Silver', points: 15000, host: '—', ggr: '$9,800' },
];
const columns: GridColDef[] = [
  { field: 'email', headerName: 'Player', flex: 1 },
  { field: 'tier', headerName: 'VIP Tier', width: 130, renderCell: ({ value }) => <Chip label={String(value)} size="small" color="warning" variant="outlined" /> },
  { field: 'points', headerName: 'Lifetime Points', width: 150, align: 'right', headerAlign: 'right', valueFormatter: (v) => Number(v).toLocaleString() },
  { field: 'host', headerName: 'Host', width: 160 },
  { field: 'ggr', headerName: 'GGR (All Time)', width: 150, align: 'right', headerAlign: 'right' },
];
export default function VIPPage() {
  return (
    <PageShell title="VIP Management" subtitle="VIP tiers, player status, host assignments, and exclusive rewards" actions={<AddButton label="Add VIP Tier" />}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {tiers.map((t) => (
          <Grid key={t.id} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card elevation={0} sx={{ border: '2px solid', borderColor: t.color + '66' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: t.color }}>{t.name}</Typography>
                  <Chip label={`Level ${t.level}`} size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary">{t.players} players • {t.minPoints.toLocaleString()}+ pts</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{t.perks}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <DataTable rows={players} columns={columns} />
    </PageShell>
  );
}
