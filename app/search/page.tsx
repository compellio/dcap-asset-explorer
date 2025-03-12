'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import AssetGrid from '@/components/AssetGrid';
import { searchAssets } from '@/lib/api';
import { TAR } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<TAR[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);
  
  // Filter states
  const [culture, setCulture] = useState<string>('');
  const [period, setPeriod] = useState<string>('');
  const [material, setMaterial] = useState<string>('');

  useEffect(() => {
    if (query || culture || period || material) {
      performSearch();
    } else {
      // If no search criteria, load all assets
      performSearch();
    }
  }, [query, culture, period, material]);

  const performSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Construct search parameters
      const searchParams: any = { query };
      
      // Add filters if they are set
      if (culture) searchParams.culture = culture;
      if (period) searchParams.period = period;
      if (material) searchParams.material = material;
      
      const result = await searchAssets(searchParams);
      
      // Check if we received valid data
      if (result && Array.isArray(result.assets)) {
        // Filter out any invalid assets
        const validAssets = result.assets.filter(asset => 
          asset && typeof asset === 'object'
        );
        setSearchResults(validAssets);
        setTotalResults(validAssets.length);
      } else {
        console.error('Unexpected API response format:', result);
        setError('Received unexpected data format from the API');
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (err) {
      console.error('Error performing search:', err);
      setError('Failed to perform search. Please try again later.');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    // Update URL with the new search query
    const url = new URL(window.location.href);
    url.searchParams.set('q', newQuery);
    window.history.pushState({}, '', url.toString());
    
    // Trigger search with the new query
    performSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Cultural Assets</h1>
          <SearchBar initialQuery={query} onSearch={handleSearch} />
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {!isLoading && (
                <span>
                  {totalResults} result{totalResults !== 1 ? 's' : ''} found
                  {query ? ` for "${query}"` : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        
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
        
        <AssetGrid 
          assets={searchResults} 
          isLoading={isLoading} 
          emptyMessage={query ? `No assets found for "${query}"` : "No assets available"}
        />
      </main>
    </div>
  );
}