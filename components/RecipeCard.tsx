/**
 * Recipe Card Component - Material-UI Design
 * Displays a recipe with photo, details, and who added it
 */

'use client';

import { useState } from 'react';
import { Recipe } from '@/lib/supabase';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  IconButton,
  Box,
  Link as MuiLink,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BarChartIcon from '@mui/icons-material/BarChart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface RecipeCardProps {
  recipe: Recipe & {
    profiles?: {
      display_name: string;
    };
  };
  onFavorite?: (recipeId: string) => void;
  onView?: (recipe: Recipe) => void;
  onDelete?: (recipeId: string) => void;
  isFavorited?: boolean;
  showActions?: boolean;
}

export default function RecipeCard({
  recipe,
  onFavorite,
  onView,
  onDelete,
  isFavorited = false,
  showActions = true,
}: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const getDifficultyLabel = (difficulty: number | null) => {
    if (!difficulty) return 'Not rated';
    const labels = ['', 'Easy', 'Moderate', 'Challenging', 'Hard', 'Expert'];
    return labels[difficulty] || 'Not rated';
  };

  const getDifficultyColor = (difficulty: number | null): 'success' | 'warning' | 'error' | 'default' => {
    if (!difficulty) return 'default';
    if (difficulty <= 2) return 'success';
    if (difficulty <= 3) return 'warning';
    return 'error';
  };

  return (
    <Card 
      sx={{ 
        width: '100%',
        height: '320px', // Reduced height since no image (was 480px with 200px image)
        display: 'flex', 
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header with title and menu */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          {/* Recipe Name */}
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{
              flexGrow: 1,
              mr: 1,
              wordBreak: 'break-word',
            }}
          >
            {recipe.recipe_name}
          </Typography>

          {/* Overflow Menu */}
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ mt: -0.5 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        {/* Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              onDelete?.(recipe.id);
              setMenuAnchor(null);
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete Recipe
          </MenuItem>
        </Menu>

        {/* Attribution */}
        {recipe.profiles?.display_name && (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mb: 2 }}>
            Added by {recipe.profiles.display_name}
          </Typography>
        )}

        {/* Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {recipe.main_ingredient && (
            <Chip label={recipe.main_ingredient} size="small" color="primary" variant="outlined" />
          )}
          {recipe.cuisine && (
            <Chip label={recipe.cuisine} size="small" color="secondary" variant="outlined" />
          )}
        </Box>

        {/* Time and Difficulty */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {recipe.time_minutes && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {recipe.time_minutes} min
              </Typography>
            </Box>
          )}
          {recipe.difficulty && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BarChartIcon fontSize="small" color="action" />
              <Typography variant="body2" color={`${getDifficultyColor(recipe.difficulty)}.main`}>
                {getDifficultyLabel(recipe.difficulty)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Notes Preview */}
        {recipe.notes && (
          <Tooltip title={recipe.notes} placement="bottom">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                cursor: 'help',
              }}
            >
              {recipe.notes}
            </Typography>
          </Tooltip>
        )}

        {/* Source Link */}
        {recipe.source_link && (
          <MuiLink
            href={recipe.source_link}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{ display: 'block', mt: 1 }}
          >
            View source →
          </MuiLink>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => onView?.(recipe)}
          >
            View Recipe
          </Button>

          {onFavorite && (
            <IconButton
              onClick={() => onFavorite(recipe.id)}
              color={isFavorited ? 'error' : 'default'}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          )}
        </CardActions>
      )}
    </Card>
  );
}
