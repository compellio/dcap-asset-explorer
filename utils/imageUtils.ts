import md5 from 'crypto-js/md5';

const S3_BUCKET_URL = process.env.NEXT_PUBLIC_S3_BUCKET_URL || 'https://dcap-viewer-assets.s3.eu-central-1.amazonaws.com';

/**
 * Generates a thumbnail URL for a DCAPv2 asset based on its TAR ID
 * 
 * @param tarId The TAR ID of the asset
 * @returns The URL to the asset's thumbnail image
 */
export function getThumbnailUrl(tarId: string): string {
  if (!tarId) return '/placeholder-image.jpg';
  
  const hash = md5(tarId).toString();
  return `${S3_BUCKET_URL}/v2/${hash}.jpg`;
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
