import React from 'react';
import { TAR } from '@/types';
import AssetCard from './AssetCard';

interface AssetGridProps {
  assets: TAR[];
  isLoading?: boolean;
  emptyMessage?: string;
  withFade?: boolean;
  visibleItems?: number;
  mobileVisibleItems?: number;
}

const AssetGrid: React.FC<AssetGridProps> = ({ 
  assets, 
  isLoading = false,
  emptyMessage = 'No assets found',
  withFade = false,
  visibleItems = 0, // 0 means show all
  mobileVisibleItems = 2
}) => {
  // Filter out any invalid assets
  const validAssets = assets?.filter(asset => asset) || [];
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse rounded-lg overflow-hidden shadow">
            <div className="bg-gray-300 h-48 w-full"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (validAssets.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // For desktop: Check if we need to limit the assets and if there are more to show
  const displayedAssets = visibleItems > 0 ? validAssets.slice(0, visibleItems) : validAssets;
  const hasMoreAssets = visibleItems > 0 && validAssets.length > visibleItems;

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedAssets.map((asset, index) => (
          // On mobile, only show the first mobileVisibleItems
          <div 
            key={`asset-${index}`} 
            className={index >= mobileVisibleItems ? 'hidden sm:block' : ''}
          >
            <AssetCard asset={asset} />
          </div>
        ))}
      </div>
      
      {/* Fade effect layers - only if withFade is true and we have more assets to show */}
      {withFade && hasMoreAssets && (
        <>
          {/* Gradient fade effect from top to bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-30 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent pointer-events-none"></div>
          
          {/* Solid box at the bottom to completely hide card shadows and borders */}
          <div className="absolute bottom-[-90] left-0 right-0 h-24 bg-gray-50 pointer-events-none"></div>
        </>
      )}
    </div>
  );
};

export default AssetGrid;
