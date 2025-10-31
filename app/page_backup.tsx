'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import AppHeader from '@/components/AppHeader';
import { getCurrentUser } from '@/lib/auth-helpers';
import {
  Box,
  CircularProgress,
} from '@mui/material';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { user: currentUser } = await getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    const { signOut } = await import('@/lib/auth-helpers');
    await signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppHeader user={user} currentPage="chat" onSignOut={handleSignOut} />
      
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <ChatInterface user={user} />
      </Box>
    </Box>
  );
}
