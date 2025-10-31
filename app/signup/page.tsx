'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-helpers';
import Link from 'next/link';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    const { user, error: signUpError } = await signUp(email, password, displayName);

    if (signUpError) {
      setError(signUpError);
      setIsLoading(false);
      return;
    }

    if (user) {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <RestaurantIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Join the Family!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your Recipe Genie account
            </Typography>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Signup Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              fullWidth
              placeholder="Mom, Dad, Sarah, etc."
              helperText="This is how your name will appear on recipes you add"
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
              placeholder="you@example.com"
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
              placeholder="At least 6 characters"
              helperText="Minimum 6 characters"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isLoading}
              startIcon={<PersonAddIcon />}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </Box>

          {/* Login Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <MuiLink component={Link} href="/login" fontWeight="bold">
                Sign in
              </MuiLink>
            </Typography>
          </Box>
        </Paper>

        {/* Back to Home */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <MuiLink component={Link} href="/" color="text.secondary">
            ← Back to home
          </MuiLink>
        </Box>
      </Container>
    </Box>
  );
}
