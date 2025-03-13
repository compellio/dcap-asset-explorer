import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TAR } from '@/types';
import { getFullImageUrl, getPlaceholderImage } from '@/utils/imageUtils';
import { getAssetId, getSafeMultilingualValue } from '@/utils/assetUtils';

interface AssetCardProps {
  asset: TAR;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  // Add null checks for all properties
  if (!asset) {
    return null;
  }
  
  // Get the appropriate ID for the item link using our utility function
  const assetId = getAssetId(asset);
  
  // Get the correct nested path for the data
  const tarPayload = asset.data?.tar_payload || {};
  const rwa = tarPayload.rwa || {};
  const dcar = tarPayload.dcar || {};
  
  // Get asset title in English or fallback to first available language or default value
  const assetTitle = rwa.rwa_title 
  ? getSafeMultilingualValue(rwa.rwa_title, 'Unknown Asset')
  : getSafeMultilingualValue(rwa.rwa_kind || {}, 'Unknown Asset');
  
  // Get asset description in English or fallback to first available language or default value
  const assetDescObj = rwa.rwa_description || {};
  const assetDescription = getSafeMultilingualValue(assetDescObj, '');
  
  // Truncate description for card display
  const truncatedDescription = assetDescription.length > 100 
    ? `${assetDescription.substring(0, 100)}...` 
    : assetDescription;
  
  // Safely get the images array
  const images = dcar.dar_digital_representations?.images || [];
  const imageUrl = images[0]?.url || '';
  const primaryImage = getFullImageUrl(imageUrl);
  
  // Safely get culture and date
  const cultureObj = rwa.rwa_creation?.culture || {};
  const culture = getSafeMultilingualValue(cultureObj, 'Unknown culture');
  
  const dateObj = rwa.rwa_creation?.date || {};
  const date = getSafeMultilingualValue(dateObj, 'Unknown date');
  
  // Get the asset ID for display
  const displayId = rwa.rwa_id || asset.id || 'Unknown ID';

  return (
    <Link 
      href={`/asset/${assetId}`}
      className="group"
    >
      <div className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          {/* Add error handling to Image component */}
          <Image
            src={primaryImage}
            alt={assetTitle}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            width={400}
            height={300}
            priority={false}
            onError={(e) => {
              // @ts-ignore - TypeScript doesn't know about currentTarget.src
              e.currentTarget.src = getPlaceholderImage(400, 300);
            }}
          />
        </div>
        
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
              {assetTitle}
            </h3>
            
            <div className="mt-1 flex items-center">
              <span className="text-sm text-gray-500">
                {displayId}
              </span>
            </div>
            
            <p className="mt-2 text-sm text-gray-600">
              {truncatedDescription}
            </p>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span className="inline-block bg-indigo-100 px-2 py-1 rounded text-indigo-800 text-xs">
              {culture}
            </span>
            <span className="ml-2">
              {date}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AssetCard;