'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, CircularProgress, InputAdornment, IconButton, Chip,
} from '@mui/material';
import { Visibility, VisibilityOff, Speed } from '@mui/icons-material';
import { useAuthStore } from '@/lib/store/auth.store';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const [email, setEmail] = useState('admin@visionesoft.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch {
      // error state set by store
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 3,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56, height: 56, bgcolor: 'primary.main', borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
            }}
          >
            <Speed sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>VisioneSoft</Typography>
          <Chip label="Admin Portal" size="small" color="primary" sx={{ mt: 0.5 }} />
        </Box>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Sign in to your account</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enterprise iGaming Platform
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
                {error}
              </Alert>
            )}

            <form onSubmit={(e) => void handleSubmit(e)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={isLoading || !email || !password}
                  disableElevation
                  sx={{ mt: 1 }}
                >
                  {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Sign in'}
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 3, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500 }}>
                Development credentials
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                admin@visionesoft.com / Admin@VisioneSoft1!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
