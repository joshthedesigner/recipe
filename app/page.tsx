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
    console.log('🔵 loadUser called');
    const result = await getCurrentUser();
    console.log('🔵 getCurrentUser result:', result);
    console.log('🔵 user object:', result.user);
    console.log('🔵 user.id:', result.user?.id);
    setUser(result.user);
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    const { signOut } = await import('@/lib/auth-helpers');
    await signOut();
    router.push('/login');
  };

  console.log('🔵 Page render - user:', user);
  console.log('🔵 Page render - user?.id:', user?.id);

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
