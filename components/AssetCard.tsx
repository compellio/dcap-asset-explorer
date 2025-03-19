import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TAR, DCConcept, DCLanguageValue } from '@/types';
import { getAssetId, getSafeMultilingualValue, getFirstItemLabel, getTextContent } from '@/utils/assetUtils';
import { getThumbnailUrl, getPlaceholderImage } from '@/utils/imageUtils';

interface AssetCardProps {
  asset: TAR;
}

// Type guard function to check if an object is a DCConcept
function isDCConcept(obj: any): obj is DCConcept {
  return obj && typeof obj === 'object' && '@id' in obj && '@type' in obj && 'prefLabel' in obj;
}

// Type guard function to check if an object is a DCLanguageValue
function isDCLanguageValue(obj: any): obj is DCLanguageValue {
  return obj && typeof obj === 'object' && '@language' in obj && '@value' in obj;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const [imageError, setImageError] = useState(false);
  
  // Add null checks for all properties
  if (!asset) {
    return null;
  }
  
  // Get the appropriate ID for the item link using our utility function
  const assetId = getAssetId(asset);
  
  // Extract title from dc:title (multilingual object)
  const assetTitle = getSafeMultilingualValue(asset.data?.["dc:title"], 'Unknown Asset');
  
  // Extract description - handle both object and array formats
  let assetDescription = '';
  if (asset.data?.["dc:description"]) {
    assetDescription = getTextContent(asset.data["dc:description"], '');
  }
  
  // Truncate description for card display
  const truncatedDescription = assetDescription.length > 100 
    ? `${assetDescription.substring(0, 100)}...` 
    : assetDescription;
  
  // Get culture/type information from the first type or subject value
  let culture = '';
  let typeLabel = '';
  
  // First try to get a concept with type "edm:Concept" for better labeling
  if (asset.data?.["dc:type"] && asset.data["dc:type"].length > 0) {
    const conceptType = asset.data["dc:type"].find(type => 
      isDCConcept(type) && type["@type"] === "edm:Concept"
    );
    
    if (conceptType) {
      typeLabel = getFirstItemLabel([conceptType], '');
    } else {
      typeLabel = getFirstItemLabel(asset.data["dc:type"], '');
    }
  }
  
  // If no type, try to get from subjects
  if (!typeLabel && asset.data?.["dc:subject"] && asset.data["dc:subject"].length > 0) {
    const conceptSubject = asset.data["dc:subject"].find(subject => 
      isDCConcept(subject) && subject["@type"] === "edm:Concept"
    );
    
    if (conceptSubject) {
      typeLabel = getFirstItemLabel([conceptSubject], '');
    } else {
      typeLabel = getFirstItemLabel(asset.data["dc:subject"], '');
    }
  }
  
  culture = typeLabel || 'Unknown Type';
  
  // Get the display ID from dc:identifier if available, but keep it short
  const displayId = asset.data?.["dc:identifier"]?.length 
    ? asset.data["dc:identifier"][0] 
    : (asset.receipt || asset.id?.split(':').pop() || 'Unknown ID');
  
  // Display only part of the ID if it's too long
  const shortenedDisplayId = displayId.length > 15 
    ? `${displayId.substring(0, 15)}...` 
    : displayId;
  
  // Get the thumbnail image URL using MD5 hash approach
  const imageUrl = !imageError 
    ? getThumbnailUrl(asset.id || '') 
    : getPlaceholderImage(400, 300);

  return (
    <Link 
      href={`/asset/${assetId}`}
      className="group"
    >
      <div className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          <Image
            src={imageUrl}
            alt={assetTitle}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            width={400}
            height={300}
            priority={false}
            onError={() => {
              setImageError(true);
            }}
          />
        </div>
        
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300 line-clamp-1">
              {assetTitle}
            </h3>
            
            <div className="mt-1 flex items-center">
              <span className="text-xs text-gray-500 truncate">
                {shortenedDisplayId}
              </span>
            </div>
            
            {truncatedDescription && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {truncatedDescription}
              </p>
            )}
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-500">
            {culture && (
              <span className="inline-block bg-indigo-100 px-2 py-1 rounded text-indigo-800 text-xs truncate max-w-full">
                {culture}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AssetCard;
