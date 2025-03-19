import { DCConcept, DCLanguageValue, DCAgent } from '@/types';

/**
 * Helper to determine if a section should be displayed
 */
/**
 * Helper to determine if a section should be displayed
 */
export const shouldDisplaySection = (content: any): boolean => {
  if (content === null || content === undefined) return false;
  if (Array.isArray(content)) return content.length > 0;
  if (typeof content === 'object') return Object.keys(content).length > 0;
  if (typeof content === 'string') return content.trim() !== '' && content !== 'Unknown';
  return !!content;
};

/**
 * Helper to format dates from different formats
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Handle BCE dates with minus sign
  if (dateStr.startsWith('-')) {
    const year = parseInt(dateStr.substring(1));
    return `${year} BCE`;
  }
  
  // Handle date ranges like "1888-1890" or "-2700 - -2200"
  if (dateStr.includes(' - ')) {
    const [start, end] = dateStr.split(' - ');
    return `${formatDate(start)} to ${formatDate(end)}`;
  }
  
  // Handle simple years
  if (/^\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  
  return dateStr;
};

/**
 * Create a base64 placeholder SVG for missing images
 */
export const createPlaceholderSVG = (width = 400, height = 400, text = 'No Image'): string => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#EAEAEA"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="#777777" text-anchor="middle" dy=".3em">${text}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};