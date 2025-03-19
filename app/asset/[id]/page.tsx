'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://testnet.explorer.etherlink.com';

// Function to get registration timestamp from the explorer API
async function getRegistrationTimestamp(address: string): Promise<Date | null> {
  try {
    const response = await fetch(`${EXPLORER_URL}/api/v2/addresses/${address}/transactions`);
    if (!response.ok) {
      console.error('Error fetching transaction data:', response.statusText);
      return null;
    }
    
    const transactions = await response.json();
    
    if (!transactions || !transactions.items || !Array.isArray(transactions.items)) {
      console.error('Invalid transaction data format:', transactions);
      return null;
    }
    
    const creationTx = transactions.items.find((tx: Record<string, any>) => 
      tx['transaction_types'] && tx['transaction_types'].includes("contract_creation")
    );
    
    if (!creationTx || !creationTx.timestamp) {
      console.error('Creation transaction not found');
      return null;
    }
    
    return new Date(creationTx.timestamp);
  } catch (error) {
    console.error('Error fetching registration timestamp:', error);
    return null;
  }
}

// Function to format the date in a localized format
function formatDate(date: Date | null): string {
  if (!date) return 'Unknown date';
  
  try {
    return date.toLocaleString(undefined, { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

// Extract contract address from TAR ID
function extractContractAddress(tarId: string): string | null {
  try {
    // TAR ID format is like "urn:tar:eip155.128123:196a014c4d4998f493bb621d2448a241cab50ce0"
    const parts = tarId.split(':');
    if (parts.length >= 3) {
      const addressPart = parts[parts.length - 1];
      // Add 0x prefix to the address
      return `0x${addressPart}`;
    }
    return null;
  } catch (error) {
    console.error('Error extracting contract address:', error);
    return null;
  }
}

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
  const [registrationDate, setRegistrationDate] = useState<Date | null>(null);
  const [isLoadingDate, setIsLoadingDate] = useState<boolean>(false);

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

  // Effect to fetch registration timestamp when asset is loaded
  useEffect(() => {
    const fetchRegistrationDate = async () => {
      if (!asset?.id) return;
      
      try {
        setIsLoadingDate(true);
        const contractAddress = extractContractAddress(asset.id);
        
        if (contractAddress) {
          const timestamp = await getRegistrationTimestamp(contractAddress);
          setRegistrationDate(timestamp);
        }
      } catch (error) {
        console.error('Error fetching registration date:', error);
      } finally {
        setIsLoadingDate(false);
      }
    };

    fetchRegistrationDate();
  }, [asset?.id]);

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

  // Extract contract address from TAR ID for explorer link
  const getExplorerUrl = (tarId: string) => {
    try {
      // TAR ID format is like "urn:tar:eip155.128123:196a014c4d4998f493bb621d2448a241cab50ce0"
      const parts = tarId.split(':');
      if (parts.length >= 3) {
        const addressPart = parts[parts.length - 1];
        // Add 0x prefix to the address
        return `${EXPLORER_URL}/address/0x${addressPart}`;
      }
      return null;
    } catch (error) {
      console.error('Error parsing TAR ID for explorer link:', error);
      return null;
    }
  };

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
                <div className="flex items-center mb-3">
                  <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm font-bold text-slate-800">Digital Cultural Asset Passport</div>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs font-bold text-slate-700 mb-1">Token Id:</div>
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
                      {asset.id && asset.id.includes('eip155') && (
                        <a
                          href={getExplorerUrl(asset.id) ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 bg-white rounded-md shadow hover:bg-gray-100"
                          title="View on Etherlink Explorer"
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
                
                  <div className="mt-3">
                    <div className="text-xs font-bold text-slate-700 mb-1">Registered At:</div>
                    <div className="text-sm text-slate-600">
                      {isLoadingDate ? (
                        <span className="inline-flex items-center">
                          <svg className="animate-spin h-3 w-3 mr-2 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading registration date...
                        </span>
                      ) : formatDate(registrationDate)}
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
