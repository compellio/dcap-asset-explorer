import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  initialQuery?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  initialQuery = '', 
  placeholder = 'Search cultural assets...', 
  onSearch,
  className = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  // Update the query state when initialQuery prop changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Allow empty searches (will show all assets)
    if (onSearch) {
      onSearch(query.trim());
    } else {
      // If no onSearch callback is provided, navigate to search page
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    // Optionally trigger search with empty query to show all assets
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="block w-full bg-white pl-10 pr-12 py-3 border border-gray-300 rounded-md leading-5 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-ellipsis"
          style={{ overflowX: 'auto' }}
        />
        
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-14 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <XMarkIcon className="mr-7 h-5 w-5" />
          </button>
        )}
        
        <button
          type="submit"
          className="absolute inset-y-0 right-0 px-4 flex items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-md cursor-pointer transition-colors duration-200"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;