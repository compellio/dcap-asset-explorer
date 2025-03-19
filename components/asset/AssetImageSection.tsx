import React from 'react';
import Image from 'next/image';
import { createPlaceholderSVG } from '@/utils/assetDetailUtils';
import { DCConcept, DCLanguageValue, DCAgent } from '@/types';

interface AssetImageSectionProps {
  imageUrl: string | null;
  title: string;
  creators: Array<DCConcept | DCLanguageValue | DCAgent>;
  dates: string[];
  imageLoaded: boolean;
  onImageLoad: () => void;
  onImageClick: () => void;
}

const AssetImageSection: React.FC<AssetImageSectionProps> = ({
  imageUrl,
  title,
  imageLoaded,
  onImageLoad,
  onImageClick
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div 
        className={`relative aspect-square bg-slate-100 ${imageLoaded ? 'cursor-pointer' : ''}`}
        onClick={imageLoaded ? onImageClick : undefined}
        aria-label={imageLoaded ? `Click to view larger image of ${title}` : ''}
        role={imageLoaded ? 'button' : undefined}
        tabIndex={imageLoaded ? 0 : undefined}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className={`object-contain ${imageLoaded ? 'hover:scale-105 transition-transform duration-300' : ''}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL={createPlaceholderSVG()}
            onLoad={onImageLoad}
            priority
            onError={(e) => {
              // If the image fails to load, replace with a placeholder
              const target = e.target as HTMLImageElement;
              if (target) {
                target.src = createPlaceholderSVG(800, 800, 'Image Unavailable');
              }
            }}
          />
        )}
        {imageLoaded && (
          <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-slate-600">
            Click to enlarge
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetImageSection;
