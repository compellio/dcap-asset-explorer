import { TAR } from "@/types";

/**
 * Gets the best available ID to use for an asset
 * Prioritizes receipt > id > rwa_id
 * 
 * @param asset The asset object
 * @returns The best ID to use for routing and API calls
 */
export function getAssetId(asset: TAR): string {
  // Handle null/undefined asset
  if (!asset) {
    console.warn('Asset is null or undefined');
    return 'unknown';
  }
  
  // Check for receipt property
  if (asset.receipt) {
    return asset.receipt;
  }
  
  // Check for id property
  if (asset.id) {
    return asset.id;
  }
  
  // Safely check for nested rwa_id
  if (asset.data?.tar_payload?.rwa?.rwa_id) {
    return asset.data.tar_payload.rwa.rwa_id;
  }
  
  // Fallback to a random ID if none are available
  console.warn('No ID found for asset, using random ID');
  return `unknown-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Extract a safe property from a multilingual content object
 * with proper fallbacks
 * 
 * @param obj The multilingual content object
 * @param defaultValue Default value if object is empty/undefined
 * @returns The best available text value
 */
export function getSafeMultilingualValue(obj: any, defaultValue: string = ''): string {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  
  // Try English first
  if (obj.en) {
    return obj.en;
  }
  
  // Try any other language
  const values = Object.values(obj);
  if (values.length > 0 && typeof values[0] === 'string') {
    return values[0];
  }
  
  return defaultValue;
}