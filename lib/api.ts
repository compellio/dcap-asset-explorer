// API service for Cultural Asset Management system
import { TAR, SearchParams, SearchResult } from '@/types';
import { 
  getSafeMultilingualValue, 
  getTextFromLanguageValueArray, 
  getConceptLabel,
  getTextContent,
  getAllConceptLabels
} from '@/utils/assetUtils';

// Configuration values
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gateway.tst.in.compell.io';
const SESSION_KEY = process.env.NEXT_PUBLIC_SESSION_KEY || 'nethereum';
const DEFAULT_SEARCH_QUERY = process.env.NEXT_PUBLIC_DEFAULT_SEARCH_QUERY 
  ? JSON.parse(process.env.NEXT_PUBLIC_DEFAULT_SEARCH_QUERY) 
  : { "data.@context": "urn:tar:eip155.128123:d58d92934ad6a8739429d210ef9841bbec57f28f" };

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode?: number;
  public isNetworkError: boolean;
  public originalError: any;

  constructor(message: string, statusCode?: number, originalError?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.isNetworkError = message.includes('network') || message.includes('fetch');
  }
}

/**
 * Base fetch function with error handling and common headers
 */
async function fetchWithErrorHandling<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  // Ensure headers exist
  if (!options.headers) {
    options.headers = {};
  }

  // Add session key and content type headers
  const headers = new Headers(options.headers);
  headers.set('x-session-key', SESSION_KEY);
  
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  // Apply headers back to options
  options.headers = headers;

  try {
    const response = await fetch(url, options);

    // Handle HTTP error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = 'API request failed';
      
      if (response.status === 400) {
        errorMessage = 'Bad request. The server could not understand the request.';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (response.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (response.status >= 500) {
        errorMessage = 'The server encountered an error. Please try again later.';
      }
      
      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Unable to connect to the server. Please check your internet connection.',
        undefined,
        error
      );
    }

    // Handle other errors
    throw new ApiError(
      (error as Error).message || 'An unexpected error occurred',
      undefined,
      error
    );
  }
}

/**
 * Constructs a full API URL
 */
function constructApiUrl(path: string): string {
  // Normalize API base URL
  const normalizedBaseUrl = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  
  // Normalize path to ensure it starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${normalizedBaseUrl}${normalizedPath}`;
}

/**
 * Function to retry API requests for transient errors
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (
      retries > 0 &&
      error instanceof ApiError &&
      error.isNetworkError
    ) {
      console.log(`Retrying API call, ${retries} attempts left...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

/**
 * Search for cultural assets using client-side filtering
 * Optimized for DCAPv2 format
 */
export async function searchAssets(params: SearchParams): Promise<SearchResult> {
  const endpoint = constructApiUrl('api/v1/TAR/find');
  
  return withRetry(async () => {
    try {
      console.log('Fetching all assets for client-side filtering');
      
      // Get all DCAPv2 assets
      const response = await fetchWithErrorHandling<any>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify(DEFAULT_SEARCH_QUERY)
        }
      );
      
      // Handle different response formats
      let assets: TAR[] = [];
      
      if (!response) {
        console.warn('Empty response from API');
      } else if (Array.isArray(response)) {
        assets = response;
      } else if (typeof response === 'object' && response !== null) {
        // If it's a single object, wrap it in an array
        assets = [response];
      } else {
        console.warn('Unexpected response format:', response);
      }
      
      console.log(`Retrieved ${assets.length} total assets for client-side filtering`);
      
      // Now filter assets based on search criteria
      let filteredAssets = assets;
      
      // If query is provided, filter by relevant fields
      if (params.query && params.query.trim() !== '') {
        const searchTerm = params.query.trim().toLowerCase();
        
        filteredAssets = assets.filter(asset => {
          // Check if the asset ID matches first (direct match for TAR IDs)
          if (asset.id && asset.id.toLowerCase() === searchTerm) {
            return true;
          }
          
          // DCAPv2 format - search in title, description, subject, type, etc.
          const title = asset.data?.["dc:title"] 
            ? getSafeMultilingualValue(asset.data["dc:title"], '') 
            : '';
          
          // Handle description (can be object or array)
          const description = getTextContent(asset.data?.["dc:description"], '');
          
          // Try to extract concepts from subject and type
          const subjects = asset.data?.["dc:subject"] || [];
          const types = asset.data?.["dc:type"] || [];
          
          const extractedConcepts = [
            ...getAllConceptLabels(subjects),
            ...getAllConceptLabels(types)
          ];
          
          // Check creator
          const creators = asset.data?.["dc:creator"] || [];
          const creatorLabels = getAllConceptLabels(creators);
          
          // Check all searchable fields
          return title.toLowerCase().includes(searchTerm) ||
                 description.toLowerCase().includes(searchTerm) ||
                 extractedConcepts.some(c => c.toLowerCase().includes(searchTerm)) ||
                 creatorLabels.some(c => c.toLowerCase().includes(searchTerm)) ||
                 (asset.id && asset.id.toLowerCase().includes(searchTerm));
        });
      }
      
      // Add additional filter parameters if they exist
      if (params.culture) {
        const cultureTerm = params.culture.toLowerCase();
        filteredAssets = filteredAssets.filter(asset => {
          // Check creator, dc:type and dc:subject for culture references
          const types = asset.data?.["dc:type"] || [];
          const subjects = asset.data?.["dc:subject"] || [];
          const creators = asset.data?.["dc:creator"] || [];
          
          const extractedConcepts = [
            ...getAllConceptLabels(types),
            ...getAllConceptLabels(subjects),
            ...getAllConceptLabels(creators)
          ];
          
          return extractedConcepts.some(c => c.toLowerCase().includes(cultureTerm));
        });
      }
      
      if (params.period) {
        const periodTerm = params.period.toLowerCase();
        filteredAssets = filteredAssets.filter(asset => {
          // Check date and created fields
          const dates = asset.data?.["dc:date"] || [];
          const created = asset.data?.["dcterms:created"] || [];
          
          // Combine all date references
          const allDates = [...dates, ...created];
          
          return allDates.some(date => 
            date.toString().toLowerCase().includes(periodTerm)
          );
        });
      }
      
      console.log(`Filtered to ${filteredAssets.length} assets matching criteria`);
      
      // Transform the response to match our SearchResult interface
      return {
        assets: filteredAssets,
        total: filteredAssets.length,
        page: 1,
        limit: filteredAssets.length
      };
    } catch (error) {
      console.error('Error searching assets:', error);
      return {
        assets: [],
        total: 0,
        page: 1,
        limit: 0
      };
    }
  });
}

/**
 * Get an asset by its complete ID
 */
export async function getAssetByFullId(assetId: string): Promise<TAR | null> {
  const endpoint = constructApiUrl('api/v1/TAR/find');
  
  return withRetry(async () => {
    try {
      // First try to find the asset with the exact context
      const response = await fetchWithErrorHandling<any>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify({
            id: assetId
          })
        }
      );
      
      // Handle different response formats
      let assets: TAR[] = [];
      
      if (Array.isArray(response)) {
        assets = response;
      } else if (typeof response === 'object' && response !== null) {
        assets = [response];
      } else {
        console.warn('Unexpected response format:', response);
        return null;
      }
      
      // Find the asset with the matching ID
      const matchingAsset = assets.find(asset => asset.id === assetId);
      
      if (!matchingAsset) {
        console.warn(`No asset found with ID: ${assetId}`);
        return null;
      }
      
      return matchingAsset;
    } catch (error) {
      console.error(`Error fetching asset with ID ${assetId}:`, error);
      
      // If that fails, try to get all assets and find the matching one
      try {
        const allAssets = await fetchWithErrorHandling<any>(
          endpoint,
          {
            method: 'POST',
            body: JSON.stringify(DEFAULT_SEARCH_QUERY)
          }
        );
        
        let assets: TAR[] = [];
        
        if (Array.isArray(allAssets)) {
          assets = allAssets;
        } else if (typeof allAssets === 'object' && allAssets !== null) {
          assets = [allAssets];
        } else {
          return null;
        }
        
        return assets.find(asset => asset.id === assetId) || null;
      } catch (secondError) {
        console.error(`Second attempt to fetch asset with ID ${assetId} failed:`, secondError);
        return null;
      }
    }
  });
}

/**
 * Get a specific asset by receipt ID
 */
export async function getAssetById(receiptId: string): Promise<TAR | null> {
  const endpoint = constructApiUrl(`api/v1/TAR/tarId/${receiptId}`);
  
  return withRetry(async () => {
    try {
      const response = await fetchWithErrorHandling<any>(endpoint);
      
      // Check if response is a valid asset
      if (!response || typeof response !== 'object') {
        console.warn('Invalid asset response:', response);
        return null;
      }
      
      return response as TAR;
    } catch (error) {
      console.error(`Error fetching asset with ID ${receiptId}:`, error);
      
      // If direct ID lookup fails, try searching in all assets
      try {
        const allAssets = await searchAssets({ query: '' });
        return allAssets.assets.find(asset => 
          asset.receipt === receiptId || 
          asset.id === receiptId
        ) || null;
      } catch (secondError) {
        console.error(`Second attempt to fetch asset with ID ${receiptId} failed:`, secondError);
        return null;
      }
    }
  });
}

/**
 * Get featured assets for the homepage
 * Optimized for DCAPv2 format
 */
export async function getFeaturedAssets(limit = 6): Promise<TAR[]> {
  const endpoint = constructApiUrl('api/v1/TAR/find');
  
  return withRetry(async () => {
    try {
      // Get all DCAPv2 assets
      const response = await fetchWithErrorHandling<any>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify(DEFAULT_SEARCH_QUERY)
        }
      );
      
      // Check if response is valid
      if (!response) {
        console.warn('Empty response from API');
        return [];
      }
      
      // Handle different response formats
      let assets: TAR[] = [];
      
      if (Array.isArray(response)) {
        assets = response;
      } else if (typeof response === 'object' && response !== null) {
        // If it's a single object, wrap it in an array
        assets = [response];
      } else {
        console.warn('Unexpected response format:', response);
        return [];
      }
      
      // Filter out any invalid assets and limit to requested number
      return assets
        .filter(asset => 
          asset && 
          typeof asset === 'object' && 
          asset.data && 
          asset.data["@type"] && 
          asset.data["@type"].includes("dcap:CulturalHeritageObject")
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured assets:', error);
      return [];
    }
  });
}
