'use client';
import React, { ReactNode } from 'react';
import { Box, Typography, Button, Card, Chip, Skeleton, Alert } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';

export type StatusColor = 'success' | 'warning' | 'error' | 'info' | 'default';

export function getStatusColor(status: string): StatusColor {
  const map: Record<string, StatusColor> = {
    active: 'success', approved: 'success', completed: 'success', ok: 'success', published: 'success', passed: 'success',
    draft: 'default', pending: 'warning', processing: 'warning', suspended: 'warning', degraded: 'warning', in_progress: 'warning',
    archived: 'default', rejected: 'error', failed: 'error', down: 'error', locked: 'error', overdue: 'error',
    sandbox: 'info', certification: 'info', not_started: 'default',
  };
  return map[status.toLowerCase().replace(' ', '_')] ?? 'default';
}

export function StatusChip({ status }: { status: string }) {
  const color = getStatusColor(status);
  return (
    <Chip
      label={status.replace(/_/g, ' ')}
      size="small"
      color={color === 'default' ? 'default' : color}
      variant={color === 'default' ? 'outlined' : 'filled'}
      sx={{ fontSize: '0.7rem', fontWeight: 500, textTransform: 'capitalize' }}
    />
  );
}

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>{actions}</Box>}
      </Box>
      {children}
    </Box>
  );
}

interface DataTableProps {
  rows: Record<string, unknown>[];
  columns: GridColDef[];
  loading?: boolean;
  error?: string | null;
  height?: number;
  onRefresh?: () => void;
}

export function DataTable({ rows, columns, loading, error, height = 520, onRefresh }: DataTableProps) {
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      {onRefresh && (
        <Box sx={{ px: 2, pt: 1.5, pb: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="small" startIcon={<Refresh />} onClick={onRefresh} variant="text">Refresh</Button>
        </Box>
      )}
      <Box sx={{ height }}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={40} sx={{ mb: 0.5 }} />)}
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true } }}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[25, 50, 100]}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': { borderBottom: '1px solid', borderColor: 'divider' },
              '& .MuiDataGrid-columnHeaders': { borderBottom: '2px solid', borderColor: 'divider' },
            }}
          />
        )}
      </Box>
    </Card>
  );
}

interface AddButtonProps { label?: string; onClick?: () => void; }
export function AddButton({ label = 'Add New', onClick }: AddButtonProps) {
  return (
    <Button variant="contained" startIcon={<Add />} onClick={onClick} disableElevation>
      {label}
    </Button>
  );
}
