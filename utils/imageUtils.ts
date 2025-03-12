/**
 * Utility functions for image handling
 */

const IMAGE_SERVER_URL = process.env.NEXT_PUBLIC_IMAGE_SERVER_URL || 'http://100.127.255.164:8080';
const PLACEHOLDER_IMAGE = '/placeholder-image.jpg';

/**
 * Formats an image URL to use the correct image server
 * @param urlPath The image path or URL fragment
 * @returns Full URL to the image on the image server
 */
export function getFullImageUrl(urlPath: string): string {
  if (!urlPath || urlPath.trim() === '') {
    return PLACEHOLDER_IMAGE;
  }
  
  // If path already includes a protocol (http/https), just return it
  if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
    return urlPath;
  }
  
  // Make sure the path starts with /
  const normalizedPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  
  return `${IMAGE_SERVER_URL}${normalizedPath}`;
}

/**
 * Creates a placeholder image URL for use when real images aren't available
 * @param width Width of the placeholder image
 * @param height Height of the placeholder image
 * @returns Placeholder image URL
 */
export function getPlaceholderImage(width = 400, height = 300): string {
  return `https://placehold.co/${width}x${height}/EAEAEA/777777?text=No+Image`;
}

/**
 * Checks if a given image URL is accessible
 * @param url The image URL to check
 * @returns Promise that resolves to true if image is accessible, false otherwise
 */
export async function isImageAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking image accessibility:', error);
    return false;
  }
}