// API service for Cultural Asset Management system
import { TAR, SearchParams, SearchResult } from '@/types';

// Configuration values
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gateway.tst.in.compell.io';
const SESSION_KEY = process.env.NEXT_PUBLIC_SESSION_KEY || 'nethereum';
const DEFAULT_SEARCH_QUERY = process.env.NEXT_PUBLIC_DEFAULT_SEARCH_QUERY 
  ? JSON.parse(process.env.NEXT_PUBLIC_DEFAULT_SEARCH_QUERY) 
  : { "data.tar_payload.dcar.dar_id": "" };

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
 * This approach fetches all assets and then filters them in the client to avoid 404 errors
 */
export async function searchAssets(params: SearchParams): Promise<SearchResult> {
  const endpoint = constructApiUrl('api/v1/TAR/find');
  
  return withRetry(async () => {
    try {
      console.log('Fetching all assets for client-side filtering');
      
      // Always get all assets first
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
          
          // Extract searchable content from the asset
          const darPayload = asset.data?.tar_payload;
          if (!darPayload) return false;
          
          const description = darPayload.dcar?.dar_description?.en || '';
          const title = darPayload.rwa?.rwa_kind?.en || '';
          const darId = darPayload.dcar?.dar_id || '';
          const systemId = darPayload.dcar?.dar_system_id || '';
          
          // Search in image captions if available
          const images = darPayload.dcar?.dar_digital_representations?.images || [];
          const captions = images.map(img => img.caption?.en || '').join(' ');
          
          // Check for matches in various fields
          return description.toLowerCase().includes(searchTerm) ||
                title.toLowerCase().includes(searchTerm) ||
                darId.toLowerCase().includes(searchTerm) ||
                systemId.toLowerCase().includes(searchTerm) ||
                captions.toLowerCase().includes(searchTerm) ||
                (asset.id && asset.id.toLowerCase().includes(searchTerm)); // Also check for partial matches
        });
      }
      
      // Add additional filter parameters if they exist
      if (params.culture) {
        const cultureTerm = params.culture.toLowerCase();
        filteredAssets = filteredAssets.filter(asset => {
          const culture = asset.data?.tar_payload?.rwa?.rwa_creation?.culture?.en || '';
          return culture.toLowerCase().includes(cultureTerm);
        });
      }
      
      if (params.period) {
        const periodTerm = params.period.toLowerCase();
        filteredAssets = filteredAssets.filter(asset => {
          const period = asset.data?.tar_payload?.rwa?.rwa_creation?.date?.en || '';
          return period.toLowerCase().includes(periodTerm);
        });
      }
      
      if (params.material) {
        const materialTerm = params.material.toLowerCase();
        filteredAssets = filteredAssets.filter(asset => {
          const materials = asset.data?.tar_payload?.rwa?.rwa_physical_properties?.materials || [];
          return materials.some(m => m.toLowerCase().includes(materialTerm));
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
      // Use our existing find endpoint to get all assets
      const response = await fetchWithErrorHandling<any>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify(DEFAULT_SEARCH_QUERY)
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
      return null;
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
      return null;
    }
  });
}

/**
 * Get featured assets for the homepage
 * Since there's no specific endpoint for featured assets,
 * we'll use the find endpoint to get all assets
 */
export async function getFeaturedAssets(limit = 6): Promise<TAR[]> {
  const endpoint = constructApiUrl('api/v1/TAR/find');
  
  return withRetry(async () => {
    try {
      // Get all assets and limit them client-side
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
        .filter(asset => asset && typeof asset === 'object')
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured assets:', error);
      return [];
    }
  });
}
