'use client';
import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip, Alert, Paper, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { TrendingUp, People, CreditCard, Route, CheckCircle, Warning, Info } from '@mui/icons-material';

interface KpiCardProps { label: string; value: string; icon: React.ReactNode; color: string; change?: string; }

function KpiCard({ label, value, icon, color, change }: KpiCardProps) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: `${color}.50`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
        {change && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {change}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

const buildStatus = [
  { domain: 'Aggregator', services: 'providers, vendors, routing, operators, agents', status: 'ready', pct: '40%' },
  { domain: 'B2C', services: 'players, wallet, payments, bonuses, vip, compliance', status: 'ready', pct: '35%' },
  { domain: 'B2B', services: 'crm, billing, affiliates, white-labels', status: 'ready', pct: '30%' },
  { domain: 'Media & AI', services: 'media-service, ai-service', status: 'ready', pct: '20%' },
  { domain: 'Analytics', services: 'kpi-service, reporting-service, warehouse', status: 'ready', pct: '15%' },
  { domain: 'Infrastructure', services: 'K8s, Docker, Prometheus, Grafana, OTel', status: 'in-progress', pct: '25%' },
  { domain: 'Database', services: 'PostgreSQL, Prisma migrations, ClickHouse', status: 'ready', pct: '45%' },
  { domain: 'Frontend', services: 'Next.js 15, MUI, React Query, Zustand', status: 'ready', pct: '35%' },
];

export default function DashboardPage() {
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }} icon={<Info />}>
        <strong>Stack Upgraded:</strong> Next.js 15 + React 19 + MUI · NestJS API Gateway · PostgreSQL + Prisma · Redis + BullMQ · Prometheus + Grafana + OpenTelemetry
      </Alert>

      {/* KPI Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Total GGR" value="—" icon={<TrendingUp fontSize="small" />} color="primary" change="Data after first operator onboarded" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Active Players" value="0" icon={<People fontSize="small" />} color="success" change="Connect player database" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Deposits (30d)" value="—" icon={<CreditCard fontSize="small" />} color="warning" change="Activate PSP integration" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard label="Route Success" value="—" icon={<Route fontSize="small" />} color="info" change="Activate first route" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Build Status */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Build Progress</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Domain</TableCell>
                    <TableCell>Services</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buildStatus.map((row) => (
                    <TableRow key={row.domain} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{row.domain}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{row.services}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.status}
                          color={row.status === 'ready' ? 'success' : 'warning'}
                          variant="outlined"
                          icon={row.status === 'ready' ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Warning sx={{ fontSize: '14px !important' }} />}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{row.pct}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Tech Stack */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Technology Stack</Typography>
              {[
                { category: 'Frontend', items: ['Next.js 15', 'React 19', 'TypeScript', 'MUI v7', 'React Query', 'Zustand'] },
                { category: 'Backend', items: ['NestJS', 'Prisma ORM', 'PostgreSQL', 'Redis', 'BullMQ'] },
                { category: 'Infrastructure', items: ['Docker', 'Kubernetes', 'Prometheus', 'Grafana', 'OpenTelemetry'] },
              ].map((section) => (
                <Box key={section.category} sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {section.category}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                    {section.items.map((item) => (
                      <Chip key={item} label={item} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    ))}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
