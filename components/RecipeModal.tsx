/**
 * Recipe Modal Component - Material-UI Design
 * Full-screen dialog to view recipe details
 */

'use client';

import { Recipe } from '@/lib/supabase';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  IconButton,
  Link as MuiLink,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BarChartIcon from '@mui/icons-material/BarChart';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PublicIcon from '@mui/icons-material/Public';
import LinkIcon from '@mui/icons-material/Link';

interface RecipeModalProps {
  recipe: Recipe & {
    profiles?: {
      display_name: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  if (!recipe) return null;

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
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      {/* Header */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h5" component="div" fontWeight="bold">
          Recipe Details
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Recipe Photo */}
        {recipe.photo_url && (
          <Box sx={{ mb: 3, borderRadius: 1, overflow: 'hidden' }}>
            <img
              src={recipe.photo_url}
              alt={recipe.recipe_name}
              style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' }}
            />
          </Box>
        )}

        {/* Recipe Name */}
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {recipe.recipe_name}
        </Typography>

        {/* Attribution */}
        {recipe.profiles?.display_name && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic', mb: 3 }}>
            Added by <strong>{recipe.profiles.display_name}</strong>
          </Typography>
        )}

        {/* Recipe Meta Info */}
        <Grid container spacing={2} sx={{ mb: 3, pb: 3, borderBottom: 1, borderColor: 'divider' }}>
          {recipe.main_ingredient && (
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <RestaurantMenuIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Main Ingredient
                </Typography>
              </Box>
              <Chip label={recipe.main_ingredient} color="primary" size="small" />
            </Grid>
          )}

          {recipe.cuisine && (
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PublicIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Cuisine
                </Typography>
              </Box>
              <Chip label={recipe.cuisine} color="secondary" size="small" />
            </Grid>
          )}

          {recipe.time_minutes && (
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Cooking Time
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="medium">
                {recipe.time_minutes} minutes
              </Typography>
            </Grid>
          )}

          {recipe.difficulty && (
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BarChartIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Difficulty
                </Typography>
              </Box>
              <Chip
                label={getDifficultyLabel(recipe.difficulty)}
                color={getDifficultyColor(recipe.difficulty)}
                size="small"
              />
            </Grid>
          )}
        </Grid>

        {/* Notes */}
        {recipe.notes && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Notes
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {recipe.notes}
            </Typography>
          </Box>
        )}

        {/* Recipe Instructions */}
        {recipe.recipe_text ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Instructions
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {recipe.recipe_text}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.dark">
              No recipe instructions available.
              {recipe.source_link && ' Check the source link below for details.'}
            </Typography>
          </Box>
        )}

        {/* Source Link */}
        {recipe.source_link && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon fontSize="small" color="primary" />
            <MuiLink
              href={recipe.source_link}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              fontWeight="bold"
            >
              View Original Source →
            </MuiLink>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" fullWidth>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
