'use client';
import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Avatar,
  IconButton, Button, Divider, Tooltip, Grid,
} from '@mui/material';
import { Add, MoreVert, DragIndicator } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface KanbanCard {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  assignee: string;
  dueDate: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

const INITIAL_COLUMNS: KanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    color: '#94A3B8',
    cards: [
      { id: 'c1', title: 'Provider SDK v2 Integration', description: 'Upgrade Pragmatic Play adapter to v2 API', priority: 'high', tags: ['aggregator', 'backend'], assignee: 'PA', dueDate: 'Jul 15' },
      { id: 'c2', title: 'Multi-currency wallet', description: 'Support EUR, USD, GBP, crypto wallets', priority: 'medium', tags: ['wallet', 'b2c'], assignee: 'PA', dueDate: 'Jul 22' },
      { id: 'c3', title: 'Webhook retry system', description: 'Exponential backoff for failed callbacks', priority: 'low', tags: ['infrastructure'], assignee: 'PA', dueDate: 'Aug 1' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: '#2563EB',
    cards: [
      { id: 'c4', title: 'KYC document OCR', description: 'Auto-extract data from passport/ID scans', priority: 'high', tags: ['compliance', 'ai'], assignee: 'PA', dueDate: 'Jun 28' },
      { id: 'c5', title: 'Analytics dashboard charts', description: 'Revenue and player activity recharts', priority: 'medium', tags: ['frontend'], assignee: 'PA', dueDate: 'Jun 25' },
    ],
  },
  {
    id: 'review',
    title: 'In Review',
    color: '#D97706',
    cards: [
      { id: 'c6', title: 'Bonus abuse detection', description: 'ML-based bonus fraud scoring engine', priority: 'high', tags: ['fraud', 'backend'], assignee: 'PA', dueDate: 'Jun 24' },
      { id: 'c7', title: 'Operator white-label config UI', description: 'Theme builder and logo upload flow', priority: 'medium', tags: ['b2b', 'frontend'], assignee: 'PA', dueDate: 'Jun 26' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    color: '#16A34A',
    cards: [
      { id: 'c8', title: 'NestJS API Gateway', description: '60+ routes, JWT auth, Swagger, throttle', priority: 'high', tags: ['backend', 'infrastructure'], assignee: 'PA', dueDate: 'Jun 21' },
      { id: 'c9', title: 'Next.js 15 Backoffice', description: '20+ pages, MUI v7, React Query, Zustand', priority: 'high', tags: ['frontend'], assignee: 'PA', dueDate: 'Jun 21' },
      { id: 'c10', title: 'Prisma schema (52 models)', description: 'Full platform DB schema applied to PG', priority: 'medium', tags: ['database'], assignee: 'PA', dueDate: 'Jun 21' },
    ],
  },
];

const PRIORITY_COLOR = { high: 'error', medium: 'warning', low: 'default' } as const;

function KanbanCardItem({ card, index }: { card: KanbanCard; index: number }) {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 1.5,
            opacity: snapshot.isDragging ? 0.85 : 1,
            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
          }}
        >
          <Card
            elevation={snapshot.isDragging ? 8 : 0}
            sx={{ border: '1px solid', borderColor: 'divider', cursor: 'grab', '&:active': { cursor: 'grabbing' }, '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}
          >
            <CardContent sx={{ p: '12px !important' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Box {...provided.dragHandleProps} sx={{ display: 'flex', alignItems: 'center', color: 'text.disabled', mr: 0.5 }}>
                  <DragIndicator sx={{ fontSize: 16 }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, fontSize: '0.82rem', lineHeight: 1.4 }}>
                  {card.title}
                </Typography>
                <IconButton size="small" sx={{ ml: 0.5, mt: -0.5 }}>
                  <MoreVert sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.4 }}>
                {card.description}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                {card.tags.map((t) => (
                  <Chip key={t} label={t} size="small" sx={{ height: 18, fontSize: '0.6rem' }} />
                ))}
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Chip
                  label={card.priority}
                  size="small"
                  color={PRIORITY_COLOR[card.priority]}
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                    Due {card.dueDate}
                  </Typography>
                  <Tooltip title="Platform Admin">
                    <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', bgcolor: 'primary.main' }}>
                      {card.assignee}
                    </Avatar>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Draggable>
  );
}

export default function KanbanPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newColumns = columns.map((col) => ({ ...col, cards: [...col.cards] }));
    const srcCol = newColumns.find((c) => c.id === source.droppableId)!;
    const dstCol = newColumns.find((c) => c.id === destination.droppableId)!;

    const [moved] = srcCol.cards.splice(source.index, 1);
    dstCol.cards.splice(destination.index, 0, moved);
    setColumns(newColumns);
  };

  return (
    <Box>
      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {columns.map((col) => (
          <Grid size={{ xs: 6, sm: 3 }} key={col.id}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderTop: `3px solid ${col.color}` }}>
              <CardContent sx={{ py: '12px !important', px: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{col.cards.length}</Typography>
                <Typography variant="caption" color="text.secondary">{col.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Kanban board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, alignItems: 'flex-start' }}>
          {columns.map((col) => (
            <Box key={col.id} sx={{ minWidth: 280, maxWidth: 300, flex: '0 0 280px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.color }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{col.title}</Typography>
                  <Chip label={col.cards.length} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                </Box>
                <IconButton size="small">
                  <Add fontSize="small" />
                </IconButton>
              </Box>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      minHeight: 120,
                      p: 1.5,
                      bgcolor: snapshot.isDraggingOver ? 'action.selected' : 'action.hover',
                      borderRadius: 2,
                      border: '2px dashed',
                      borderColor: snapshot.isDraggingOver ? col.color : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {col.cards.map((card, idx) => (
                      <KanbanCardItem key={card.id} card={card} index={idx} />
                    ))}
                    {provided.placeholder}
                    <Button
                      fullWidth size="small" startIcon={<Add />}
                      sx={{ mt: 0.5, color: 'text.secondary', justifyContent: 'flex-start', textTransform: 'none', fontSize: '0.78rem' }}
                    >
                      Add card
                    </Button>
                  </Box>
                )}
              </Droppable>
            </Box>
          ))}
        </Box>
      </DragDropContext>
    </Box>
  );
}
