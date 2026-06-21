import Link from 'next/link';
import { Box, Typography, Button } from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';

export default function NotFound() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 2, textAlign: 'center', p: 4 }}>
      <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>404</Typography>
      <SentimentDissatisfied sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Page not found</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 400 }}>
        The page you are looking for doesn&apos;t exist or has been moved.
      </Typography>
      <Button component={Link} href="/dashboard" variant="contained" sx={{ mt: 1 }}>
        Back to Dashboard
      </Button>
    </Box>
  );
}
