import { TAR, MultilingualContent, DCLanguageValue, DCConcept, DCAgent } from "@/types";

/**
 * Gets the best available ID to use for an asset
 * Prioritizes receipt > id > dc:identifier
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
  
  // Check for dc:identifier (DCAPv2)
  if (asset.data?.["dc:identifier"] && asset.data["dc:identifier"].length > 0) {
    return asset.data["dc:identifier"][0];
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
 * @param preferredLanguage Preferred language code (default: 'en')
 * @returns The best available text value
 */
export function getSafeMultilingualValue(
  obj: MultilingualContent | null | undefined, 
  defaultValue: string = '',
  preferredLanguage: string = 'en'
): string {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  
  // Try preferred language first
  if (obj[preferredLanguage]) {
    return obj[preferredLanguage];
  }
  
  // Try English next if preferred language isn't English
  if (preferredLanguage !== 'en' && obj.en) {
    return obj.en;
  }
  
  // Try any other language
  const entries = Object.entries(obj);
  if (entries.length > 0) {
    return entries[0][1] ?? defaultValue; // Return the first available language value or default if undefined
  }
  
  return defaultValue;
}

/**
 * Extract a text value from DCLanguageValue array
 * 
 * @param arr Array of DCLanguageValue objects
 * @param preferredLanguage Preferred language code (default: 'en')
 * @param defaultValue Default value if no matching language is found
 * @returns The text value in the preferred language or first available language
 */
export function getTextFromLanguageValueArray(
  arr: DCLanguageValue[], 
  preferredLanguage: string = 'en',
  defaultValue: string = ''
): string {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return defaultValue;
  }
  
  // Try to find the preferred language
  const preferredItem = arr.find(item => 
    item && 
    typeof item === 'object' && 
    item["@language"] === preferredLanguage
  );
  
  if (preferredItem) {
    return preferredItem["@value"];
  }
  
  // Try English if the preferred language isn't English
  if (preferredLanguage !== 'en') {
    const englishItem = arr.find(item => 
      item && 
      typeof item === 'object' && 
      item["@language"] === 'en'
    );
    
    if (englishItem) {
      return englishItem["@value"];
    }
  }
  
  // Fallback to the first item
  const firstValidItem = arr.find(item => 
    item && 
    typeof item === 'object' && 
    "@value" in item
  );
  
  return firstValidItem ? firstValidItem["@value"] : defaultValue;
}

/**
 * Extracts the label from a concept or agent object
 * 
 * @param item DCConcept, DCAgent or DCLanguageValue object
 * @param defaultValue Default value if extraction fails
 * @param preferredLanguage Preferred language code (default: 'en')
 * @returns The extracted text value
 */
export function getConceptLabel(
  item: DCConcept | DCAgent | DCLanguageValue | any, 
  defaultValue: string = '',
  preferredLanguage: string = 'en'
): string {
  if (!item || typeof item !== 'object') {
    return defaultValue;
  }
  
  // Handle concept with prefLabel
  if (item.prefLabel) {
    return getSafeMultilingualValue(item.prefLabel, defaultValue, preferredLanguage);
  }
  
  // Handle DCLanguageValue
  if (item["@language"] && item["@value"]) {
    if (item["@language"] === preferredLanguage) {
      return item["@value"];
    }
    
    if (preferredLanguage !== 'en' && item["@language"] === 'en') {
      return item["@value"];
    }
    
    return item["@value"]; // If no preferred or English, return whatever language we have
  }
  
  return defaultValue;
}

/**
 * Get the first item's label from an array of concepts/language values
 * Prioritizes preferred language labels when available
 * 
 * @param arr Array of DCConcept, DCAgent or DCLanguageValue objects
 * @param defaultValue Default value if extraction fails
 * @param preferredLanguage Preferred language code (default: 'en')
 * @returns The extracted text value from the first item
 */
export function getFirstItemLabel(
  arr: any[], 
  defaultValue: string = '',
  preferredLanguage: string = 'en'
): string {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return defaultValue;
  }

  // Try to find an item with preferred language label first
  for (const item of arr) {
    if (!item) continue;
    
    // For DCConcept/DCAgent with prefLabel
    if (item.prefLabel && item.prefLabel[preferredLanguage]) {
      return item.prefLabel[preferredLanguage];
    }
    
    // For DCLanguageValue
    if (item["@language"] === preferredLanguage && item["@value"]) {
      return item["@value"];
    }
  }
  
  // If preferred language is not English, try English as fallback
  if (preferredLanguage !== 'en') {
    for (const item of arr) {
      if (!item) continue;
      
      if (item.prefLabel && item.prefLabel.en) {
        return item.prefLabel.en;
      }
      
      if (item["@language"] === 'en' && item["@value"]) {
        return item["@value"];
      }
    }
  }
  
  // If no preferred or English found, return the first available label
  return getConceptLabel(arr[0], defaultValue, preferredLanguage);
}

/**
 * Safely extracts text content from either a multilingual object or a language value array
 * 
 * @param data Either a MultilingualContent object or DCLanguageValue array
 * @param defaultValue Default value if extraction fails
 * @param preferredLanguage Preferred language code (default: 'en')
 * @returns The extracted text value, prioritizing preferred language
 */
export function getTextContent(
  data: MultilingualContent | DCLanguageValue[] | null | undefined,
  defaultValue: string = '',
  preferredLanguage: string = 'en'
): string {
  if (!data) return defaultValue;
  
  // Handle array of language values
  if (Array.isArray(data)) {
    return getTextFromLanguageValueArray(data, preferredLanguage, defaultValue);
  }
  
  // Handle multilingual content object
  return getSafeMultilingualValue(data, defaultValue, preferredLanguage);
}

/**
 * Extracts all labels from an array of concepts or language values
 * Useful for getting keywords, subject terms, etc.
 * 
 * @param arr Array of DCConcept, DCAgent or DCLanguageValue objects
 * @param preferredLanguage Preferred language code (default: 'en')
 * @returns Array of extracted labels
 */
export function getAllConceptLabels(
  arr: any[],
  preferredLanguage: string = 'en'
): string[] {
  if (!arr || !Array.isArray(arr)) return [];
  
  return arr.map(item => getConceptLabel(item, '', preferredLanguage))
    .filter(label => label !== '');
}