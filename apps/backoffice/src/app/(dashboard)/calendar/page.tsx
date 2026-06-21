'use client';
import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, IconButton, Chip,
  Button, Tooltip, Divider,
} from '@mui/material';
import { ChevronLeft, ChevronRight, Add, TodayOutlined } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';

const EVENT_COLORS: Record<string, string> = {
  payment: '#2563EB',
  compliance: '#DC2626',
  settlement: '#16A34A',
  maintenance: '#D97706',
  meeting: '#7C3AED',
};

const EVENTS: Array<{ date: string; title: string; type: keyof typeof EVENT_COLORS; time: string }> = [
  { date: dayjs().format('YYYY-MM-DD'), title: 'Provider Health Review', type: 'meeting', time: '10:00' },
  { date: dayjs().format('YYYY-MM-DD'), title: 'Pending KYC Deadline', type: 'compliance', time: '17:00' },
  { date: dayjs().add(2, 'day').format('YYYY-MM-DD'), title: 'Monthly Settlement Run', type: 'settlement', time: '09:00' },
  { date: dayjs().add(3, 'day').format('YYYY-MM-DD'), title: 'PSP Maintenance Window', type: 'maintenance', time: '02:00' },
  { date: dayjs().add(5, 'day').format('YYYY-MM-DD'), title: 'Operator Invoice Due', type: 'payment', time: '23:59' },
  { date: dayjs().add(7, 'day').format('YYYY-MM-DD'), title: 'Compliance Report Q2', type: 'compliance', time: '09:00' },
  { date: dayjs().add(10, 'day').format('YYYY-MM-DD'), title: 'Team Sprint Review', type: 'meeting', time: '14:00' },
  { date: dayjs().add(12, 'day').format('YYYY-MM-DD'), title: 'Provider Settlement', type: 'settlement', time: '10:00' },
  { date: dayjs().add(14, 'day').format('YYYY-MM-DD'), title: 'AML Quarterly Audit', type: 'compliance', time: '09:30' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [current, setCurrent] = useState<Dayjs>(dayjs());
  const today = dayjs();

  const startOfMonth = current.startOf('month');
  const daysInMonth = current.daysInMonth();
  const startDayOfWeek = startOfMonth.day(); // 0=Sun

  const cells: Array<Dayjs | null> = [
    ...Array(startDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, 'day')),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const getEventsForDate = (date: Dayjs) =>
    EVENTS.filter((e) => e.date === date.format('YYYY-MM-DD'));

  const upcomingEvents = EVENTS
    .filter((e) => dayjs(e.date).isAfter(today.subtract(1, 'day')))
    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())
    .slice(0, 8);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Calendar grid */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" onClick={() => setCurrent((c) => c.subtract(1, 'month'))}>
                    <ChevronLeft />
                  </IconButton>
                  <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 160, textAlign: 'center' }}>
                    {current.format('MMMM YYYY')}
                  </Typography>
                  <IconButton size="small" onClick={() => setCurrent((c) => c.add(1, 'month'))}>
                    <ChevronRight />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<TodayOutlined />} onClick={() => setCurrent(today)}>
                    Today
                  </Button>
                  <Button size="small" variant="contained" startIcon={<Add />}>
                    Add Event
                  </Button>
                </Box>
              </Box>

              {/* Day headers */}
              <Grid container columns={7} sx={{ mb: 0.5 }}>
                {DAYS.map((d) => (
                  <Grid size={1} key={d}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', display: 'block', textAlign: 'center', py: 0.5 }}>
                      {d}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ mb: 1 }} />

              {/* Day cells */}
              <Grid container columns={7}>
                {cells.map((day, idx) => {
                  const isToday = day && day.isSame(today, 'day');
                  const isCurrentMonth = day && day.month() === current.month();
                  const events = day ? getEventsForDate(day) : [];

                  return (
                    <Grid size={1} key={idx}>
                      <Box sx={{
                        minHeight: 90, p: 0.75, border: '1px solid', borderColor: 'divider',
                        bgcolor: isToday ? 'primary.50' : 'transparent',
                        cursor: day ? 'pointer' : 'default',
                        '&:hover': day ? { bgcolor: 'action.hover' } : {},
                      }}>
                        {day && (
                          <>
                            <Box sx={{
                              width: 26, height: 26, borderRadius: '50%', display: 'flex',
                              alignItems: 'center', justifyContent: 'center', mb: 0.5,
                              bgcolor: isToday ? 'primary.main' : 'transparent',
                              color: isToday ? 'white' : isCurrentMonth ? 'text.primary' : 'text.disabled',
                            }}>
                              <Typography variant="caption" sx={{ fontWeight: isToday ? 700 : 400, lineHeight: 1 }}>
                                {day.date()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                              {events.slice(0, 2).map((e, i) => (
                                <Tooltip key={i} title={`${e.time} — ${e.title}`}>
                                  <Box sx={{
                                    bgcolor: EVENT_COLORS[e.type], color: 'white', borderRadius: 0.5,
                                    px: 0.5, py: 0.1, overflow: 'hidden',
                                  }}>
                                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {e.title}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              ))}
                              {events.length > 2 && (
                                <Typography variant="caption" color="primary.main" sx={{ fontSize: '0.6rem' }}>
                                  +{events.length - 2} more
                                </Typography>
                              )}
                            </Box>
                          </>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar: upcoming events + legend */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Upcoming Events</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {upcomingEvents.map((e, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 3, height: '100%', minHeight: 36, borderRadius: 2, bgcolor: EVENT_COLORS[e.type], flexShrink: 0 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{e.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(e.date).format('MMM D')} · {e.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Event Types</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(EVENT_COLORS).map(([type, color]) => (
                  <Box key={type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: color }} />
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{type}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
