import React from 'react';
import { TAR } from '@/types';
import AssetCard from './AssetCard';

interface AssetGridProps {
  assets: TAR[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const AssetGrid: React.FC<AssetGridProps> = ({ 
  assets, 
  isLoading = false,
  emptyMessage = 'No assets found'
}) => {
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

  if (!assets || assets.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {assets.filter(asset => asset).map((asset, index) => (
        <AssetCard key={`asset-${index}`} asset={asset} />
      ))}
    </div>
  );
};

export default AssetGrid;