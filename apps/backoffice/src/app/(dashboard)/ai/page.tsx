'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, Button, Chip,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Avatar, Divider,
} from '@mui/material';
import { Send, SmartToy, Person, Clear } from '@mui/icons-material';
import { apiPost } from '@/lib/api/client';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: string; }

const SUGGESTED = [
  'Show operators with declining GGR',
  'Which providers are losing money?',
  'Show pending settlements',
  'Show high-risk players',
  'Which routes have rising error rates?',
  'Generate banner concepts for summer promotion',
  'Explain why this withdrawal is blocked',
];

export default function AICopilotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('operations');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input, timestamp: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1200)); // Simulate AI latency
      const response = `[AI Copilot — ${context} context]\n\nI understand you're asking: "${userMsg.content}"\n\nIn production, I'll analyze your ClickHouse warehouse, query real KPI data, and provide actionable recommendations. Connect the AI service with your OpenAI/Anthropic API key to enable live intelligent responses.`;
      setMessages((prev) => [...prev, { role: 'assistant', content: response, timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 120px)' }}>
      {/* Chat */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
            <SmartToy color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>AI Copilot</Typography>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={context} onChange={(e) => setContext(e.target.value)}>
                {['kpi', 'risk', 'operations', 'media', 'support', 'workflow'].map((c) => (
                  <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box flex={1} />
            <IconButton size="small" onClick={() => setMessages([])} title="Clear chat"><Clear fontSize="small" /></IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.length === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                <SmartToy sx={{ fontSize: 64, color: 'primary.main', opacity: 0.6 }} />
                <Typography variant="h6" color="text.secondary">How can I help you today?</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
                  Ask me about KPIs, providers, players, routes, payments, or compliance. I can analyze data and provide recommendations.
                </Typography>
              </Box>
            )}
            {messages.map((msg, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', mt: 0.5 }}><SmartToy sx={{ fontSize: 16 }} /></Avatar>}
                <Box>
                  <Paper elevation={0} sx={{
                    p: 1.5, maxWidth: '80%', display: 'inline-block',
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'action.hover',
                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    whiteSpace: 'pre-wrap',
                  }}>
                    <Typography variant="body2">{msg.content}</Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.timestamp}</Typography>
                </Box>
                {msg.role === 'user' && <Avatar sx={{ width: 28, height: 28, bgcolor: 'grey.400', mt: 0.5 }}><Person sx={{ fontSize: 16 }} /></Avatar>}
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}><SmartToy sx={{ fontSize: 16 }} /></Avatar>
                <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: '12px 12px 12px 2px', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={14} /><Typography variant="body2" color="text.secondary">Thinking…</Typography>
                </Paper>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth size="small" placeholder="Ask anything about providers, players, routes, finance…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
            />
            <IconButton color="primary" onClick={() => void send()} disabled={!input.trim() || loading}>
              <Send />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* Suggestions */}
      <Box sx={{ width: 260, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>Suggested Queries</Typography>
        {SUGGESTED.map((q) => (
          <Button key={q} variant="outlined" size="small" onClick={() => setInput(q)} sx={{ justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none', whiteSpace: 'normal', py: 1 }}>
            {q}
          </Button>
        ))}
      </Box>
    </Box>
  );
}
