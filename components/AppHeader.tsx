'use client';

import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import GridViewIcon from '@mui/icons-material/GridView';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';

interface AppHeaderProps {
  user: any;
  currentPage: 'chat' | 'browse';
  onSignOut: () => void;
}

export default function AppHeader({ user, currentPage, onSignOut }: AppHeaderProps) {
  const router = useRouter();
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          bgcolor: 'white', 
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Typography variant="h6" component="div" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
              Recipe Genie
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <Button
                onClick={() => router.push('/')}
                sx={{ 
                  color: currentPage === 'chat' ? 'text.primary' : 'text.secondary',
                  textTransform: 'none',
                  fontWeight: currentPage === 'chat' ? 'bold' : 'normal',
                  borderRadius: 0,
                  borderBottom: '3px solid',
                  borderColor: currentPage === 'chat' ? 'text.primary' : 'transparent',
                  px: 2,
                  py: 2,
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: 'text.primary',
                  }
                }}
              >
                Chat
              </Button>
              <Button
                onClick={() => router.push('/browse')}
                sx={{ 
                  color: currentPage === 'browse' ? 'text.primary' : 'text.secondary',
                  textTransform: 'none',
                  fontWeight: currentPage === 'browse' ? 'bold' : 'normal',
                  borderRadius: 0,
                  borderBottom: '3px solid',
                  borderColor: currentPage === 'browse' ? 'text.primary' : 'transparent',
                  px: 2,
                  py: 2,
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: 'text.primary',
                  }
                }}
              >
                Browse Recipes
              </Button>
            </Box>
          </Box>

          <Button
            endIcon={<KeyboardArrowDownIcon />}
            startIcon={<AccountCircleIcon />}
            onClick={(e) => setProfileAnchor(e.currentTarget)}
            sx={{ 
              color: 'text.primary',
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'action.hover',
              }
            }}
          >
            {user ? (user.email?.split('@')[0] || 'Profile') : 'Account'}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
      >
        {user ? [
          <MenuItem key="signout" onClick={() => { setProfileAnchor(null); onSignOut(); }}>
            <LogoutIcon sx={{ mr: 1 }} /> Sign Out
          </MenuItem>
        ] : [
          <MenuItem key="signin" onClick={() => { setProfileAnchor(null); router.push('/login'); }}>
            <LoginIcon sx={{ mr: 1 }} /> Sign In
          </MenuItem>,
          <MenuItem key="signup" onClick={() => { setProfileAnchor(null); router.push('/signup'); }}>
            <PersonAddIcon sx={{ mr: 1 }} /> Sign Up
          </MenuItem>
        ]}
      </Menu>
    </>
  );
}

