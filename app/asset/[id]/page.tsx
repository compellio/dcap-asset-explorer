'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import { getAssetById } from '@/lib/api';
import { getThumbnailUrl } from '@/utils/imageUtils';
import { getSafeMultilingualValue, getTextContent } from '@/utils/assetUtils';
import ImageModal from '@/components/ImageModal';

// Asset detail components
import AssetDetailSkeleton from '@/components/asset/AssetDetailSkeleton';
import AssetNotFound from '@/components/asset/AssetNotFound';
import AssetHeader from '@/components/asset/AssetHeader';
import AssetImageSection from '@/components/asset/AssetImageSection';
import AssetPropertiesCard from '@/components/asset/AssetPropertiesCard';
import { TAR } from '@/types';

export default function AssetDetailPage() {
  // Instead of receiving params via props, use the useParams hook:
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [asset, setAsset] = useState<TAR | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const assetData = await getAssetById(id);
        if (!assetData) {
          throw new Error('Asset not found or unable to load asset data');
        }
        setAsset(assetData);
        
        // Set thumbnail image if asset ID exists
        if (assetData.id) {
          const thumbnailUrl = getThumbnailUrl(assetData.id);
          setImageUrl(thumbnailUrl);
        }
        
        // Determine the best language to use from dc:title
        if (assetData.data?.["dc:title"]) {
          const availableLanguages = Object.keys(assetData.data["dc:title"]);
          if (availableLanguages.length > 0) {
            if (availableLanguages.includes('en')) {
              setSelectedLanguage('en');
            } else {
              setSelectedLanguage(availableLanguages[0]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching asset details:', err);
        setError('Failed to load asset details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAssetDetails();
    }
  }, [id]);

  // Handle image click to open modal
  const handleImageClick = () => {
    if (imageUrl && imageLoaded) {
      setIsImageModalOpen(true);
    }
  };

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <AssetDetailSkeleton />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <AssetNotFound error={error} onBack={() => router.back()} />
      </div>
    );
  }

  // Extract asset details using selected language
  const assetTitle = getSafeMultilingualValue(
    asset.data?.["dc:title"], 
    'Untitled Asset',
    selectedLanguage
  );
  
  const assetDescription = getTextContent(
    asset.data?.["dc:description"], 
    '',
    selectedLanguage
  );
  
  const assetCreators = asset.data?.["dc:creator"] || [];
  const assetDates = asset.data?.["dcterms:created"] && asset.data["dcterms:created"].length > 0
    ? asset.data["dcterms:created"]
    : (asset.data?.["dc:date"] && asset.data["dc:date"].length > 0
      ? asset.data["dc:date"]
      : []);
  const assetTypes = asset.data?.["dc:type"] || [];
  const assetSubjects = asset.data?.["dc:subject"] || [];
  const assetLocations = asset.data?.["dcterms:spatial"] || [];
  const assetIdentifiers = asset.data?.["dc:identifier"] || [];
  const assetSources = asset.data?.["dc:source"] || [];
  const assetCollections = asset.data?.["dcterms:isPartOf"] || [];
  const assetLanguages = asset.data?.["dc:language"] || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            aria-label="Go back to previous page"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to results
          </button>
        </div>
        
        <AssetHeader title={assetTitle} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column: Image and verification */}
          <div className="lg:col-span-5 space-y-6">
            <AssetImageSection
              imageUrl={imageUrl}
              title={assetTitle}
              creators={assetCreators}
              dates={assetDates}
              imageLoaded={imageLoaded}
              onImageLoad={handleImageLoad}
              onImageClick={handleImageClick}
            />
              
            {asset.id && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm font-bold text-slate-800">Verified:</div>
                  </div>
                  <div className="relative text-sm text-slate-600 bg-slate-50 p-2 rounded flex items-center justify-between">
                    <span className="truncate mr-2">
                      {asset.id.length > 45 
                        ? `${asset.id.substring(0, 22)}...${asset.id.substring(asset.id.length - 22)}`
                        : asset.id
                      }
                    </span>
                    <div className="flex-shrink-0 flex space-x-1">
                      <button 
                        id="copy-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(asset.id ?? '');
                          const button = document.getElementById('copy-button');
                          const originalInnerHTML = button?.innerHTML;
                          if (button) {
                            button.innerHTML = `<svg class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>`;
                            setTimeout(() => {
                              if (button && originalInnerHTML) {
                                button.innerHTML = originalInnerHTML;
                              }
                            }, 1500);
                          }
                        }}
                        className="p-1 bg-white rounded-md shadow hover:bg-gray-100"
                        title="Copy to clipboard"
                      >
                        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      {asset.id.includes('eip155') && (
                        <a
                          href={`https://sepolia.etherscan.io/address/${asset.id.split(':').pop()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 bg-white rounded-md shadow hover:bg-gray-100"
                          title="View on Etherscan"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
            
          {/* Right column: Asset properties */}
          <div className="lg:col-span-7">
            <AssetPropertiesCard
              description={assetDescription}
              types={assetTypes}
              subjects={assetSubjects}
              creators={assetCreators}
              dates={assetDates}
              identifiers={assetIdentifiers}
              languages={assetLanguages}
              locations={assetLocations}
              sources={assetSources}
              collections={assetCollections}
              id={asset.id}
              receipt={asset.receipt}
              context={asset.data["@context"]}
              checksum={asset.checksum}
              version={asset.version}
            />
          </div>
        </div>
      </div>
        
      {imageUrl && (
        <ImageModal
          imageUrl={imageUrl}
          altText={assetTitle}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </div>
  );
}
