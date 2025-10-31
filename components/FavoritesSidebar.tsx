/**
 * Favorites Sidebar Component - Material-UI Design
 * Drawer showing user's favorite recipes
 */

'use client';

import { useState, useEffect } from 'react';
import { Recipe } from '@/lib/supabase';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Fab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BarChartIcon from '@mui/icons-material/BarChart';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';

interface FavoritesSidebarProps {
  favorites: (Recipe & {
    profiles?: {
      display_name: string;
    };
  })[];
  onRecipeClick: (recipe: Recipe) => void;
  onRemoveFavorite?: (recipeId: string) => void;
  isLoading?: boolean;
}

export default function FavoritesSidebar({
  favorites,
  onRecipeClick,
  onRemoveFavorite,
  isLoading = false,
}: FavoritesSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  const drawerContent = (
    <Box sx={{ width: isMobile ? '100vw' : 360, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Favorites
            </Typography>
            <Typography variant="caption">
              {favorites.length} {favorites.length === 1 ? 'recipe' : 'recipes'}
            </Typography>
          </Box>
        </Box>
        <IconButton color="inherit" onClick={() => setIsOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Loading favorites...
            </Typography>
          </Box>
        ) : favorites.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <StarIcon sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No favorites yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click the ❤️ button on recipes to save them here!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {favorites.map((recipe) => (
              <Card
                key={recipe.id}
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              >
                {/* Recipe Photo */}
                {recipe.photo_url ? (
                  <CardMedia
                    component="img"
                    height="140"
                    image={recipe.photo_url}
                    alt={recipe.recipe_name}
                    onClick={() => onRecipeClick(recipe)}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 140,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.light',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                    onClick={() => onRecipeClick(recipe)}
                  >
                    <RestaurantIcon sx={{ fontSize: 60 }} />
                  </Box>
                )}

                <CardContent sx={{ pb: 1 }} onClick={() => onRecipeClick(recipe)}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {recipe.recipe_name}
                  </Typography>

                  {recipe.profiles?.display_name && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      by {recipe.profiles.display_name}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {recipe.time_minutes && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {recipe.time_minutes}m
                        </Typography>
                      </Box>
                    )}
                    {recipe.difficulty && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BarChartIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {recipe.difficulty}/5
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                {onRemoveFavorite && (
                  <CardActions>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(recipe.id);
                      }}
                      fullWidth
                    >
                      Remove
                    </Button>
                  </CardActions>
                )}
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Floating Action Button (Mobile & when closed) */}
      {!isOpen && (
        <Fab
          color="primary"
          aria-label="open favorites"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <StarIcon />
        </Fab>
      )}

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        variant={isMobile ? 'temporary' : 'persistent'}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isMobile ? '100%' : 360,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
