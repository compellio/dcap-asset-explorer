'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import AssetGrid from '@/components/AssetGrid';
import { getFeaturedAssets } from '@/lib/api';
import { TAR } from '@/types';

export default function HomePage() {
  const [featuredAssets, setFeaturedAssets] = useState<TAR[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadFeaturedAssets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Get up to 12 assets to ensure we have enough for the fade effect to be meaningful
        const assets = await getFeaturedAssets(12);
        
        // Check if we received a valid array
        if (Array.isArray(assets)) {
          // Filter out any invalid assets
          const validAssets = assets.filter(asset => 
            asset && typeof asset === 'object'
          );
          setFeaturedAssets(validAssets);
        } else {
          console.error('Unexpected API response format:', assets);
          setError('Received unexpected data format from the API');
          setFeaturedAssets([]);
        }
      } catch (err) {
        console.error('Error loading featured assets:', err);
        setError('Failed to load featured assets. Please try again later.');
        setFeaturedAssets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedAssets();
  }, []);

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
      
      {/* Hero Section with Search */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Explore Cultural Assets
            </h1>
            <p className="mt-6 text-xl">
              Discover and explore the vast collection of cultural treasures.
            </p>
            <div className="mt-10">
              <SearchBar 
                placeholder="Search by name, culture, period, or keyword..." 
                onSearch={handleSearch}
                className="max-w-2xl mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Assets Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Featured Assets
        </h2>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="relative pb-12">
          <AssetGrid 
            assets={featuredAssets} 
            isLoading={isLoading} 
            emptyMessage="No featured assets available at the moment."
            withFade={featuredAssets.length > 4}
            visibleItems={4} // Show only 4 items (one row) on desktop
            mobileVisibleItems={2} // Show only 2 items on mobile
          />
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/search')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
          >
            View All Assets
          </button>
        </div>
      </div>
    </div>
  );
}