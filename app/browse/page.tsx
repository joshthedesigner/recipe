'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RecipeCard from '@/components/RecipeCard';
import RecipeModal from '@/components/RecipeModal';
import AppHeader from '@/components/AppHeader';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getAllRecipes, deleteRecipe } from '@/lib/recipes';
import { getFavorites, addFavorite, removeFavorite } from '@/lib/favorites';
import { Recipe } from '@/lib/supabase';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
  MenuItem,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function BrowsePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedUploaders, setSelectedUploaders] = useState<string[]>([]);

  useEffect(() => {
    loadUser();
    loadRecipes();
  }, []);

  const loadUser = async () => {
    const { user: currentUser } = await getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      loadFavorites(currentUser.id);
    }
    
    setIsLoading(false);
  };

  const loadRecipes = async () => {
    const { recipes: allRecipes } = await getAllRecipes();
    setRecipes(allRecipes);
  };

  const loadFavorites = async (userId: string) => {
    const { favorites: userFavorites } = await getFavorites(userId);
    setFavorites(userFavorites);
  };

  const handleFavoriteToggle = async (recipeId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const isFav = favorites.some((fav) => fav.id === recipeId);

    if (isFav) {
      await removeFavorite(recipeId, user.id);
    } else {
      await addFavorite(recipeId, user.id);
    }

    loadFavorites(user.id);
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!user) return;
    
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        const result = await deleteRecipe(recipeId, user.id);
        
        if (result && result.success) {
          loadRecipes();
          loadFavorites(user.id);
        } else {
          alert(`Failed to delete recipe: ${result?.error || 'Unknown error'}`);
        }
      } catch (error: any) {
        console.error('Delete error:', error);
        alert(`Failed to delete recipe: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedIngredients([]);
    setSelectedCuisines([]);
    setSelectedUploaders([]);
  };

  const handleSignOut = async () => {
    const { signOut } = await import('@/lib/auth-helpers');
    await signOut();
    router.push('/login');
  };

  // Filtered recipes based on search and filters
  const filteredRecipes = recipes.filter((recipe) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = recipe.recipe_name?.toLowerCase().includes(query);
      const matchesIngredient = recipe.main_ingredient?.toLowerCase().includes(query);
      const matchesCuisine = recipe.cuisine_type?.toLowerCase().includes(query);
      const matchesUploader = recipe.added_by_email?.toLowerCase().includes(query);
      
      if (!matchesName && !matchesIngredient && !matchesCuisine && !matchesUploader) {
        return false;
      }
    }

    // Ingredient filter
    if (selectedIngredients.length > 0) {
      if (!selectedIngredients.includes(recipe.main_ingredient || '')) {
        return false;
      }
    }

    // Cuisine filter
    if (selectedCuisines.length > 0) {
      if (!selectedCuisines.includes(recipe.cuisine_type || '')) {
        return false;
      }
    }

    // Uploader filter
    if (selectedUploaders.length > 0) {
      if (!selectedUploaders.includes(recipe.added_by_email || '')) {
        return false;
      }
    }

    return true;
  });

  // Get unique values for filter dropdowns
  const uniqueIngredients = Array.from(new Set(recipes.map(r => r.main_ingredient).filter(Boolean)));
  const uniqueCuisines = Array.from(new Set(recipes.map(r => r.cuisine_type).filter(Boolean)));
  const uniqueUploaders = Array.from(new Set(recipes.map(r => r.added_by_email).filter(Boolean)));

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader user={user} currentPage="browse" onSignOut={handleSignOut} />

      {/* Main Content */}
      <Box sx={{ flex: 1, bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ pb: 2 }}>
          All Recipes ({filteredRecipes.length})
        </Typography>

          {/* Search and Filters Bar */}
          <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'flex-start' } }}>
            {/* Search - Left aligned */}
            <TextField
              placeholder="Search recipes, ingredients, cuisine, or uploader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ minWidth: { xs: '100%', md: '400px' }, maxWidth: { md: '600px' } }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />

            {/* Filters - Right aligned */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', flex: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              {/* Main Ingredient Filter */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Main Ingredient</InputLabel>
                <Select
                  multiple
                  value={selectedIngredients}
                  onChange={(e) => setSelectedIngredients(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput label="Main Ingredient" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {uniqueIngredients.map((ingredient) => (
                    <MenuItem key={ingredient} value={ingredient}>
                      {ingredient}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Cuisine Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Cuisine</InputLabel>
                <Select
                  multiple
                  value={selectedCuisines}
                  onChange={(e) => setSelectedCuisines(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput label="Cuisine" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {uniqueCuisines.map((cuisine) => (
                    <MenuItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Uploaded By Filter */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Uploaded By</InputLabel>
                <Select
                  multiple
                  value={selectedUploaders}
                  onChange={(e) => setSelectedUploaders(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  input={<OutlinedInput label="Uploaded By" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {uniqueUploaders.map((uploader) => (
                    <MenuItem key={uploader} value={uploader}>
                      {uploader}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Clear Filters Button */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                disabled={!searchQuery && selectedIngredients.length === 0 && selectedCuisines.length === 0 && selectedUploaders.length === 0}
              >
                Clear
              </Button>
            </Box>
          </Box>
        
        {recipes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <RestaurantIcon sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No recipes yet!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by chatting with the Recipe Genie to add your first recipe.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mx: -1.5 }}>
            {filteredRecipes.map((recipe) => (
              <Box 
                key={recipe.id}
                sx={{ 
                  width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(25% - 24px)' },
                  display: 'flex',
                }}
              >
                <RecipeCard
                  recipe={recipe}
                  onView={handleViewRecipe}
                  onFavorite={user ? handleFavoriteToggle : undefined}
                  onDelete={user ? handleDeleteRecipe : undefined}
                  isFavorited={favorites.some((fav) => fav.id === recipe.id)}
                />
              </Box>
            ))}
          </Box>
        )}
        </Container>
      </Box>

      <RecipeModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
}

