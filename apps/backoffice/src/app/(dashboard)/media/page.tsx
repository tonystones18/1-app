'use client';
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, CardContent, CardActions, Typography, Stack, Chip, Tabs, Tab, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import { PageShell, StatusChip } from '@/components/ui/DataTable';

interface MediaAsset { id: string; name: string; type: string; category: string; size: string; dimensions: string; status: string; uploadedBy: string; createdAt: string; url: string; }

const typeIcons: Record<string, React.ReactElement> = {
  IMAGE: <ImageIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
  VIDEO: <VideoLibraryIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
  DOCUMENT: <DescriptionIcon sx={{ fontSize: 40, color: 'text.secondary' }} />,
  BANNER: <BrokenImageIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
};

const mockAssets: MediaAsset[] = [
  { id: '1', name: 'Pragmatic Play Logo', type: 'IMAGE', category: 'PROVIDER_LOGO', size: '24 KB', dimensions: '320x180', status: 'APPROVED', uploadedBy: 'admin', createdAt: '2026-06-01', url: '#' },
  { id: '2', name: 'Evolution Gaming Logo', type: 'IMAGE', category: 'PROVIDER_LOGO', size: '18 KB', dimensions: '320x180', status: 'APPROVED', uploadedBy: 'admin', createdAt: '2026-06-01', url: '#' },
  { id: '3', name: 'Gates of Olympus Thumb', type: 'IMAGE', category: 'GAME_THUMBNAIL', size: '48 KB', dimensions: '400x300', status: 'APPROVED', uploadedBy: 'content_mgr', createdAt: '2026-06-05', url: '#' },
  { id: '4', name: 'Summer Promo Banner', type: 'BANNER', category: 'BANNER', size: '120 KB', dimensions: '1920x600', status: 'APPROVED', uploadedBy: 'marketing', createdAt: '2026-06-10', url: '#' },
  { id: '5', name: 'BetZone Logo Dark', type: 'IMAGE', category: 'ICON', size: '12 KB', dimensions: '64x64', status: 'PENDING', uploadedBy: 'operator_betzone', createdAt: '2026-06-18', url: '#' },
  { id: '6', name: 'Spin Castle Hero Banner', type: 'BANNER', category: 'PROMO', size: '380 KB', dimensions: '2560x1440', status: 'PENDING', uploadedBy: 'marketing', createdAt: '2026-06-19', url: '#' },
  { id: '7', name: 'Sweet Bonanza Thumb', type: 'IMAGE', category: 'GAME_THUMBNAIL', size: '52 KB', dimensions: '400x300', status: 'APPROVED', uploadedBy: 'content_mgr', createdAt: '2026-06-06', url: '#' },
  { id: '8', name: 'Platform Overview Video', type: 'VIDEO', category: 'PROMO', size: '42 MB', dimensions: '1920x1080', status: 'APPROVED', uploadedBy: 'admin', createdAt: '2026-05-20', url: '#' },
  { id: '9', name: 'PG Soft Logo', type: 'IMAGE', category: 'PROVIDER_LOGO', size: '22 KB', dimensions: '320x180', status: 'APPROVED', uploadedBy: 'admin', createdAt: '2026-06-02', url: '#' },
  { id: '10', name: 'AML Policy Document', type: 'DOCUMENT', category: 'PROMO', size: '240 KB', dimensions: '—', status: 'APPROVED', uploadedBy: 'compliance_mgr', createdAt: '2026-06-08', url: '#' },
  { id: '11', name: 'VIP Welcome Banner', type: 'BANNER', category: 'BANNER', size: '290 KB', dimensions: '1200x628', status: 'REJECTED', uploadedBy: 'marketing', createdAt: '2026-06-15', url: '#' },
  { id: '12', name: 'Hacksaw Gaming Logo', type: 'IMAGE', category: 'PROVIDER_LOGO', size: '16 KB', dimensions: '320x180', status: 'PENDING', uploadedBy: 'admin', createdAt: '2026-06-20', url: '#' },
];

const tabs = ['All', 'IMAGE', 'VIDEO', 'DOCUMENT', 'BANNER'];

export default function MediaPage() {
  const [tab, setTab] = useState(0);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<MediaAsset | null>(null);

  const filtered = tab === 0 ? mockAssets : mockAssets.filter(a => a.type === tabs[tab]);

  const approved = mockAssets.filter(a => a.status === 'APPROVED').length;
  const pending = mockAssets.filter(a => a.status === 'PENDING').length;
  const totalSize = '43.2 MB';
  const stats = [
    { label: 'Total Assets', value: String(mockAssets.length) },
    { label: 'Approved', value: String(approved) },
    { label: 'Pending Review', value: String(pending) },
    { label: 'Storage Used', value: totalSize },
  ];

  return (
    <PageShell title="Media Center" subtitle="Provider logos, game thumbnails, banners, and promotional assets"
      actions={<Button variant="contained" startIcon={<CloudUploadIcon />} size="small">Upload Asset</Button>}>
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v: number) => setTab(v)}>
          {tabs.map(t => <Tab key={t} label={t} />)}
        </Tabs>
      </Box>

      <Grid container spacing={2}>
        {filtered.map(asset => (
          <Grid key={asset.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: '8px 8px 0 0' }}>
                {typeIcons[asset.type] ?? <ImageIcon sx={{ fontSize: 40 }} />}
              </Box>
              <CardContent sx={{ pb: '4px !important' }}>
                <Typography variant="body2" fontWeight={600} noWrap title={asset.name}>{asset.name}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Chip label={asset.type} size="small" variant="outlined" />
                  <StatusChip status={asset.status} />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{asset.size} · {asset.dimensions}</Typography>
                <Typography variant="caption" color="text.secondary">{asset.category}</Typography>
              </CardContent>
              <CardActions sx={{ pt: 0 }}>
                <Button size="small" onClick={() => { setSelected(asset); setViewOpen(true); }}>Details</Button>
                <Button size="small" color="error">Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Asset Details</DialogTitle>
        <DialogContent>
          {selected && <Stack spacing={1.5} sx={{ mt: 1 }}>
            {([['Name', selected.name], ['Type', selected.type], ['Category', selected.category], ['Size', selected.size], ['Dimensions', selected.dimensions], ['Status', selected.status], ['Uploaded By', selected.uploadedBy], ['Created', selected.createdAt]] as [string, string][]).map(([k, v]) => (
              <Stack key={k} direction="row" justifyContent="space-between">
                <Typography color="text.secondary" variant="body2">{k}</Typography>
                <Typography variant="body2" fontWeight={500}>{v}</Typography>
              </Stack>
            ))}
          </Stack>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
          <Button variant="contained">Download</Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}