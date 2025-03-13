'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Tab } from '@headlessui/react';
import { ArrowLeftIcon, BookmarkIcon, ShareIcon, InformationCircleIcon, PhotoIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import { getAssetById } from '@/lib/api';
import { TAR } from '@/types';
import { getFullImageUrl } from '@/utils/imageUtils';
import { getSafeMultilingualValue } from '@/utils/assetUtils';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Properly unwrap params in Next.js 15
  const unwrappedParams = params instanceof Promise ? React.use(params) : params;
  const { id } = unwrappedParams;
  
  const router = useRouter();
  
  const [asset, setAsset] = useState<TAR | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        
        // Get the images array safely
        const images = assetData?.data?.tar_payload?.dcar?.dar_digital_representations?.images || [];
        
        // Set the first image as selected by default
        if (images.length > 0 && images[0]?.url) {
          setSelectedImage(images[0].url);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 h-96 rounded-lg"></div>
              <div>
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error || 'Asset not found'}</p>
                <button
                  onClick={() => router.back()}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Go back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safely access the nested data structure
  const tarPayload = asset.data?.tar_payload || {};
  const rwa = tarPayload.rwa || {};
  const dcar = tarPayload.dcar || {};
  
  // Get images array safely
  const assetImages = dcar.dar_digital_representations?.images || [];
  
  // Get asset information with fallbacks
  const assetKind = rwa.rwa_kind || {};
  const assetTitle = getSafeMultilingualValue(assetKind, 'Archaeological Artifact');
  
  const assetDescObj = rwa.rwa_description || {};
  const assetDescription = getSafeMultilingualValue(assetDescObj, 'No description available.');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button and breadcrumbs */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex cursor-pointer items-center text-sm text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to results
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Images */}
          <div>
            {/* Main image */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4 relative aspect-w-4 aspect-h-3">
              {selectedImage && (
                <div className="relative h-96 w-full">
                  <Image
                    src={getFullImageUrl(selectedImage)}
                    alt={assetTitle}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {assetImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {assetImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image.url)}
                    className={classNames(
                      "relative h-24 rounded overflow-hidden border-2",
                      selectedImage === image.url ? "border-indigo-500" : "border-transparent hover:border-gray-300"
                    )}
                  >
                    <Image
                      src={getFullImageUrl(image.url)}
                      alt={`${assetTitle} - View ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Image caption */}
            {selectedImage && assetImages.find(img => img.url === selectedImage)?.caption && (
              <div className="mt-2 text-sm text-gray-600">
                {getSafeMultilingualValue(assetImages.find(img => img.url === selectedImage)?.caption || {}, '')}
              </div>
            )}
            
            {/* Image attribution */}
            <div className="mt-4 text-xs text-gray-500">
              {dcar.dar_rights?.attribution || '© All rights reserved'}
            </div>
          </div>
          
          {/* Right column - Details */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{assetTitle}</h1>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">ID: </span>
                  {rwa.rwa_id || asset.id || 'Unknown ID'}
                </div>
                
                <div className="flex mt-4 space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {getSafeMultilingualValue(rwa.rwa_creation?.culture || {}, 'Unknown culture')}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getSafeMultilingualValue(rwa.rwa_creation?.date || {}, 'Unknown date')}
                  </span>
                </div>
              </div>
              
              <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-lg bg-indigo-50 p-1">
                  <Tab className={({ selected }) =>
                    classNames(
                      'w-full py-2.5 text-sm font-medium leading-5 rounded-md',
                      'flex items-center justify-center',
                      selected
                        ? 'bg-white text-indigo-700 shadow'
                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-indigo-600'
                    )
                  }>
                    <InformationCircleIcon className="h-5 w-5 mr-2" />
                    Overview
                  </Tab>
                  <Tab className={({ selected }) =>
                    classNames(
                      'w-full py-2.5 text-sm font-medium leading-5 rounded-md',
                      'flex items-center justify-center',
                      selected
                        ? 'bg-white text-indigo-700 shadow'
                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-indigo-600'
                    )
                  }>
                    <PhotoIcon className="h-5 w-5 mr-2" />
                    Details
                  </Tab>
                  <Tab className={({ selected }) =>
                    classNames(
                      'w-full py-2.5 text-sm font-medium leading-5 rounded-md',
                      'flex items-center justify-center',
                      selected
                        ? 'bg-white text-indigo-700 shadow'
                        : 'text-gray-600 hover:bg-white/[0.12] hover:text-indigo-600'
                    )
                  }>
                    <BookOpenIcon className="h-5 w-5 mr-2" />
                    References
                  </Tab>
                </Tab.List>
                <Tab.Panels className="mt-4">
                  {/* Overview Panel */}
                  <Tab.Panel className="rounded-lg bg-white p-3">
                    <div className="prose prose-sm max-w-none">
                      <p className="mb-4">{assetDescription}</p>
                      
                      <h3 className="text-lg font-semibold mt-4">Significance</h3>
                      <p>{getSafeMultilingualValue(rwa.rwa_significance || {}, 'No significance information available.')}</p>
                      
                      <h3 className="text-lg font-semibold mt-4">Creation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><span className="font-medium">Creator: </span>{getSafeMultilingualValue(rwa.rwa_creation?.creator || {}, 'Unknown')}</p>
                          <p><span className="font-medium">Date: </span>{getSafeMultilingualValue(rwa.rwa_creation?.date || {}, 'Unknown')}</p>
                          <p><span className="font-medium">Culture: </span>{getSafeMultilingualValue(rwa.rwa_creation?.culture || {}, 'Unknown')}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Location: </span>{getSafeMultilingualValue(rwa.rwa_creation?.location || {}, 'Unknown')}</p>
                          <p><span className="font-medium">Technique: </span>{getSafeMultilingualValue(rwa.rwa_creation?.technique || {}, 'Unknown')}</p>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold mt-4">Current Location</h3>
                      <p>{getSafeMultilingualValue(rwa.rwa_current_storage || {}, 'Unknown')}</p>
                      {rwa.rwa_storage_location && (
                        <p className="text-sm">{getSafeMultilingualValue(rwa.rwa_storage_location, '')}</p>
                      )}
                    </div>
                  </Tab.Panel>
                  
                  {/* Details Panel */}
                  <Tab.Panel className="rounded-lg bg-white p-3">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Physical Properties</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-sm"><span className="font-medium">Dimensions: </span>
                              {rwa.rwa_physical_properties?.dimensions ? 
                                `${rwa.rwa_physical_properties.dimensions.length} × ${rwa.rwa_physical_properties.dimensions.width} × ${rwa.rwa_physical_properties.dimensions.height} ${rwa.rwa_physical_properties.dimensions.unit}` : 
                                'Not specified'
                              }
                            </p>
                            <p className="text-sm"><span className="font-medium">Weight: </span>
                              {rwa.rwa_physical_properties?.weight ? 
                                `${rwa.rwa_physical_properties.weight.value} ${rwa.rwa_physical_properties.weight.unit}` : 
                                'Not specified'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm"><span className="font-medium">Materials: </span>
                              {rwa.rwa_physical_properties?.materials ? 
                                rwa.rwa_physical_properties.materials.join(', ') : 
                                'Not specified'
                              }
                            </p>
                            <p className="text-sm"><span className="font-medium">Condition: </span>
                              {getSafeMultilingualValue(rwa.rwa_physical_properties?.condition || {}, 'Not specified')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Discovery</h3>
                        <div className="mt-2">
                          <p className="text-sm"><span className="font-medium">Discoverer: </span>
                            {getSafeMultilingualValue(rwa.rwa_discovery?.discoverer || {}, 'Unknown')}
                          </p>
                          <p className="text-sm"><span className="font-medium">Date: </span>
                            {rwa.rwa_discovery?.discovery_date ? 
                              new Date(rwa.rwa_discovery.discovery_date).toLocaleDateString() : 
                              'Unknown'
                            }
                          </p>
                          <p className="text-sm"><span className="font-medium">Location: </span>
                            {getSafeMultilingualValue(rwa.rwa_discovery?.discovery_location || {}, 'Unknown')}
                          </p>
                          <p className="text-sm"><span className="font-medium">Context: </span>
                            {getSafeMultilingualValue(rwa.rwa_discovery?.discovery_context || {}, 'No context information available.')}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Conservation</h3>
                        <div className="mt-2">
                          <p className="text-sm"><span className="font-medium">Status: </span>
                            {getSafeMultilingualValue(rwa.rwa_conservation?.status || {}, 'Not specified')}
                          </p>
                          <p className="text-sm"><span className="font-medium">Requirements: </span>
                            {getSafeMultilingualValue(rwa.rwa_conservation?.special_requirements || {}, 'None specified')}
                          </p>
                          <p className="text-sm"><span className="font-medium">Last Assessment: </span>
                            {rwa.rwa_conservation?.last_assessment ? 
                              new Date(rwa.rwa_conservation.last_assessment).toLocaleDateString() : 
                              'Not specified'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {rwa.rwa_inscriptions && rwa.rwa_inscriptions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold">Inscriptions</h3>
                          <ul className="mt-2 list-disc list-inside">
                            {rwa.rwa_inscriptions.map((inscription, index) => (
                              <li key={index} className="text-sm">{inscription}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {rwa.rwa_keywords && rwa.rwa_keywords.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold">Keywords</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {rwa.rwa_keywords.map((keyword, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Tab.Panel>
                  
                  {/* References Panel */}
                  <Tab.Panel className="rounded-lg bg-white p-3">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Bibliography</h3>
                        {dcar.dar_references?.bibliography && dcar.dar_references.bibliography.length > 0 ? (
                          <ul className="mt-2 space-y-1 list-disc list-inside">
                            {dcar.dar_references.bibliography.map((reference, index) => (
                              <li key={index} className="text-sm">{reference}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm mt-2">No bibliography available.</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Related Objects</h3>
                        {dcar.dar_references?.related_objects && dcar.dar_references.related_objects.length > 0 ? (
                          <ul className="mt-2 space-y-1 list-disc list-inside">
                            {dcar.dar_references.related_objects.map((object, index) => (
                              <li key={index} className="text-sm">{object}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm mt-2">No related objects available.</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">External Links</h3>
                        {dcar.dar_references?.external_links && dcar.dar_references.external_links.length > 0 ? (
                          <ul className="mt-2 space-y-1 list-disc list-inside">
                            {dcar.dar_references.external_links.map((link, index) => (
                              <li key={index} className="text-sm">
                                <a 
                                  href={link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 hover:underline"
                                >
                                  {link}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm mt-2">No external links available.</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Record Metadata</h3>
                        <div className="mt-2">
                          <p className="text-sm"><span className="font-medium">Record ID: </span>{dcar.dar_id || 'Not specified'}</p>
                          <p className="text-sm"><span className="font-medium">System ID: </span>{dcar.dar_system_id || 'Not specified'}</p>
                          <p className="text-sm"><span className="font-medium">Cataloger: </span>{dcar.dar_metadata?.cataloger || 'Not specified'}</p>
                          <p className="text-sm"><span className="font-medium">Catalog Date: </span>
                            {dcar.dar_metadata?.catalog_date ? 
                              new Date(dcar.dar_metadata.catalog_date).toLocaleDateString() : 
                              'Not specified'
                            }
                          </p>
                          <p className="text-sm"><span className="font-medium">Last Modified: </span>
                            {dcar.dar_metadata?.last_modified ? 
                              new Date(dcar.dar_metadata.last_modified).toLocaleString() : 
                              'Not specified'
                            }
                          </p>
                          <p className="text-sm"><span className="font-medium">Record Status: </span>{dcar.dar_metadata?.record_status || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
              
              {/* Action buttons */}
              <div className="mt-6 flex space-x-3">
                <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ShareIcon className="h-5 w-5 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}