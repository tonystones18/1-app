'use client';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, textAlign: 'center', p: 4 }}>
          <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 800, color: 'error.main', lineHeight: 1 }}>500</Typography>
          <ErrorOutline sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Something went wrong</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 400 }}>
            An unexpected error occurred. Our team has been notified. Please try again.
          </Typography>
          <Button variant="contained" color="error" onClick={reset} sx={{ mt: 1 }}>
            Try Again
          </Button>
        </Box>
      </body>
    </html>
  );
}
