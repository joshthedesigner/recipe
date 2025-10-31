'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function TestDB() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [tables, setTables] = useState<{ recipes: boolean; favorites: boolean; profiles: boolean }>({
    recipes: false,
    favorites: false,
    profiles: false,
  });

  useEffect(() => {
    async function testConnection() {
      const supabase = createClient();

      // Test recipes table
      const { error: recipesError } = await supabase
        .from('recipes')
        .select('count')
        .limit(1);

      // Test favorites table
      const { error: favoritesError } = await supabase
        .from('favorites')
        .select('count')
        .limit(1);

      // Test profiles table
      const { error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      setTables({
        recipes: !recipesError,
        favorites: !favoritesError,
        profiles: !profilesError,
      });

      if (!recipesError && !favoritesError && !profilesError) {
        setStatus('✅ All database tables connected successfully!');
      } else {
        setStatus('❌ Some tables have connection issues');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Database Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">{status}</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${tables.recipes ? '✅' : '❌'}`}>
                {tables.recipes ? '✅' : '❌'}
              </span>
              <span className="font-medium">Recipes Table</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${tables.favorites ? '✅' : '❌'}`}>
                {tables.favorites ? '✅' : '❌'}
              </span>
              <span className="font-medium">Favorites Table</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${tables.profiles ? '✅' : '❌'}`}>
                {tables.profiles ? '✅' : '❌'}
              </span>
              <span className="font-medium">Profiles Table</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> If you see checkmarks for all three tables, your Supabase setup is complete! 🎉
          </p>
        </div>

        <div className="mt-6">
          <a 
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}



