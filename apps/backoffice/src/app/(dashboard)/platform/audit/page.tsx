'use client';
import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { PageShell, DataTable } from '@/components/ui/DataTable';
const mock: Record<string, unknown>[] = [
  { id: 'al1', actor: 'admin@visionesoft.com', action: 'create', entity: 'Provider', entityId: 'pragmatic', ip: '192.168.1.1', createdAt: '2026-06-21 09:00' },
  { id: 'al2', actor: 'admin@visionesoft.com', action: 'approve', entity: 'Invoice', entityId: 'INV-202606-00123', ip: '192.168.1.1', createdAt: '2026-06-20 15:30' },
  { id: 'al3', actor: 'admin@visionesoft.com', action: 'update', entity: 'Player', entityId: 'pl3', ip: '192.168.1.2', createdAt: '2026-06-19 11:15' },
  { id: 'al4', actor: 'admin@visionesoft.com', action: 'login', entity: 'Session', entityId: 'sess_abc', ip: '192.168.1.1', createdAt: '2026-06-21 08:30' },
];
const actionColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = { create: 'success', approve: 'success', update: 'info', delete: 'error', login: 'default', export: 'warning' };
const columns: GridColDef[] = [
  { field: 'actor', headerName: 'Actor', width: 220 },
  { field: 'action', headerName: 'Action', width: 110, renderCell: ({ value }) => <Chip label={String(value)} size="small" color={actionColors[String(value)] ?? 'default'} variant={actionColors[String(value)] ? 'filled' : 'outlined'} /> },
  { field: 'entity', headerName: 'Entity', width: 130 },
  { field: 'entityId', headerName: 'Entity ID', flex: 1, minWidth: 160, renderCell: ({ value }) => <code style={{ fontSize: 11, fontFamily: 'monospace' }}>{String(value)}</code> },
  { field: 'ip', headerName: 'IP Address', width: 140 },
  { field: 'createdAt', headerName: 'Timestamp', width: 180 },
];
export default function AuditPage() {
  return <PageShell title="Audit Log" subtitle="Immutable audit trail for all administrative, financial, and compliance actions"><DataTable rows={mock} columns={columns} height={560} /></PageShell>;
}
