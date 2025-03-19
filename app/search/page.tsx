'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import AssetGrid from '@/components/AssetGrid';
import { searchAssets, getAssetByFullId } from '@/lib/api';
import { TAR, SearchParams } from '@/types';

// This component contains the actual search page content that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [searchResults, setSearchResults] = useState<TAR[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);

  const performSearch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if this is a direct asset ID search
      if (query && query.trim().startsWith('urn:tar:')) {
        const directAsset = await getAssetByFullId(query.trim());
        if (directAsset) {
          setSearchResults([directAsset]);
          setTotalResults(1);
          setIsLoading(false);
          return;
        }
      }

      const searchParamsObj: SearchParams = { query };
      const result = await searchAssets(searchParamsObj);

      if (result && Array.isArray(result.assets)) {
        setSearchResults(result.assets);
        setTotalResults(result.total);
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
  }, [query]);

  useEffect(() => {
    const fetchData = async () => {
      await performSearch();
    };
    fetchData();
  }, [query, performSearch]);

  const handleSearch = (newQuery: string) => {
    const url = new URL(window.location.href);
    if (newQuery) {
      url.searchParams.set('q', newQuery);
    } else {
      url.searchParams.delete('q');
    }
    router.push(url.pathname + url.search, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Cultural Assets
          </h1>
          <SearchBar initialQuery={query} onSearch={handleSearch} />
        </div>

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
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => performSearch()}
                  className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        <AssetGrid
          assets={searchResults}
          isLoading={isLoading}
          emptyMessage={
            query ? `No assets found for "${query}"` : 'No assets available'
          }
        />
      </main>
    </div>
  );
}

// The default export wraps the content in a Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search parameters...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
