'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Tab } from '@headlessui/react';
import { 
  ArrowLeftIcon, 
  InformationCircleIcon, 
  PhotoIcon, 
  BookOpenIcon,
  ShareIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import { getAssetById } from '@/lib/api';
import { TAR } from '@/types';
import { getFullImageUrl } from '@/utils/imageUtils';
import { getSafeMultilingualValue } from '@/utils/assetUtils';
import ImageModal from '@/components/ImageModal';
import VerificationBadge from '@/components/VerificationBadge';

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  const handleImageClick = () => {
    if (selectedImage) {
      setIsModalOpen(true);
    }
  };

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
  const assetTitle = rwa.rwa_title 
    ? getSafeMultilingualValue(rwa.rwa_title, 'Archaeological Artifact')
    : getSafeMultilingualValue(rwa.rwa_kind || {}, 'Archaeological Artifact');
  
  const assetDescObj = rwa.rwa_description || {};
  const assetDescription = getSafeMultilingualValue(assetDescObj, 'No description available.');

  // Get the selected image caption
  const selectedImageCaption = selectedImage 
    ? getSafeMultilingualValue(assetImages.find(img => img.url === selectedImage)?.caption || {}, '')
    : '';

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
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{assetTitle}</h1>
          <p className="mt-2 text-gray-500 italic">
            {getSafeMultilingualValue(rwa.rwa_kind || {}, 'Archaeological Artifact')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Main image */}
              <div 
                className="bg-gray-100 rounded-lg overflow-hidden mb-4 relative aspect-square cursor-pointer transition-all hover:shadow-lg"
                onClick={handleImageClick}
              >
                {selectedImage && (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <Image
                      src={getFullImageUrl(selectedImage)}
                      alt={assetTitle}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Overlay with zoom hint */}
                    <div
                      className="
                        absolute 
                        inset-0 
                        transition-opacity 
                        flex 
                        items-center 
                        justify-center 
                        opacity-0 
                        hover:opacity-100 
                        bg-white/20 
                        backdrop-blur-md
                      "
                    >
                      <span 
                        className="
                          bg-white 
                          bg-opacity-75 
                          rounded-md 
                          px-3 
                          py-1 
                          text-sm
                        "
                      >
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Thumbnail gallery */}
              {assetImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {assetImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image.url)}
                      className={classNames(
                        "relative aspect-square rounded overflow-hidden border-2 border-gray-300",
                        selectedImage === image.url ? "border-indigo-500" : "border-transparent hover:border-gray-300"
                      )}
                    >
                      <Image
                        src={getFullImageUrl(image.url)}
                        alt={`${assetTitle} - View ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 10vw"
                      />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Image caption */}
              {selectedImageCaption && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedImageCaption}
                </div>
              )}
              
              {/* Verification badge */}
              {asset.id && (
                <div className="mt-4">
                  <VerificationBadge id={asset.id} />
                </div>
              )}
              
              {/* Image attribution */}
              <div className="mt-4 text-xs text-gray-500">
                {dcar.dar_rights?.attribution || '© All rights reserved'}
              </div>
              
              {/* Basic information card */}
              <div className="mt-6 border-t pt-4 border-gray-300">
                <h3 className="text-lg font-semibold mb-2">Quick Info</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">ID:</dt>
                    <dd className="text-sm text-gray-900">{rwa.rwa_id || 'Unknown'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Institution:</dt>
                    <dd className="text-sm text-gray-900">{getSafeMultilingualValue(dcar.dar_institution || {}, 'Unknown')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Period:</dt>
                    <dd className="text-sm text-gray-900">{getSafeMultilingualValue(rwa.rwa_creation?.date || {}, 'Unknown')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Origin:</dt>
                    <dd className="text-sm text-gray-900">{getSafeMultilingualValue(rwa.rwa_creation?.location || {}, 'Unknown')}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          
          {/* Right column - Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-lg bg-indigo-50 p-1 mb-6">
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
                <Tab.Panels>
                  {/* Overview Panel */}
                  <Tab.Panel>
                    <div className="prose prose-indigo max-w-none">
                      <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                        <p className="text-indigo-800">{assetDescription}</p>
                      </div>
                      
                      <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-900 flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-600" />
                        Significance
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p>{getSafeMultilingualValue(rwa.rwa_significance || {}, 'No significance information available.')}</p>
                      </div>
                      
                      <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-900">Creation Information</h3>
                      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <dl>
                          <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="px-4 py-3 sm:px-6 bg-gray-50">
                              <dt className="text-sm font-medium text-gray-500">Creator</dt>
                              <dd className="mt-1 text-sm text-gray-900">{getSafeMultilingualValue(rwa.rwa_creation?.creator || {}, 'Unknown')}</dd>
                            </div>
                            <div className="px-4 py-3 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">Date</dt>
                              <dd className="mt-1 text-sm text-gray-900">{getSafeMultilingualValue(rwa.rwa_creation?.date || {}, 'Unknown')}</dd>
                            </div>
                            <div className="px-4 py-3 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">Culture</dt>
                              <dd className="mt-1 text-sm text-gray-900">{getSafeMultilingualValue(rwa.rwa_creation?.culture || {}, 'Unknown')}</dd>
                            </div>
                            <div className="px-4 py-3 sm:px-6 bg-gray-50">
                              <dt className="text-sm font-medium text-gray-500">Location</dt>
                              <dd className="mt-1 text-sm text-gray-900">{getSafeMultilingualValue(rwa.rwa_creation?.location || {}, 'Unknown')}</dd>
                            </div>
                            <div className="px-4 py-3 sm:px-6 bg-gray-50 md:col-span-2">
                              <dt className="text-sm font-medium text-gray-500">Technique</dt>
                              <dd className="mt-1 text-sm text-gray-900">{getSafeMultilingualValue(rwa.rwa_creation?.technique || {}, 'Unknown')}</dd>
                            </div>
                          </div>
                        </dl>
                      </div>
                      
                      <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-900">Current Location</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium">{getSafeMultilingualValue(rwa.rwa_current_storage || {}, 'Unknown')}</p>
                        {rwa.rwa_storage_location && (
                          <p className="text-sm mt-1">{getSafeMultilingualValue(rwa.rwa_storage_location, '')}</p>
                        )}
                      </div>
                      
                      {/* Keywords */}
                      {rwa.rwa_keywords && rwa.rwa_keywords.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-xl font-semibold mb-2 text-gray-900">Keywords</h3>
                          <div className="flex flex-wrap gap-2">
                            {rwa.rwa_keywords.map((keyword, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Tab.Panel>
                  
                  {/* Details Panel */}
                  <Tab.Panel>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Physical Properties</h3>
                        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                          <dl>
                            <div className="grid grid-cols-1 md:grid-cols-2">
                              <div className="px-4 py-3 sm:px-6 bg-gray-50">
                                <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {rwa.rwa_physical_properties?.dimensions ? 
                                    `${rwa.rwa_physical_properties.dimensions.length} × ${rwa.rwa_physical_properties.dimensions.width} × ${rwa.rwa_physical_properties.dimensions.height} ${rwa.rwa_physical_properties.dimensions.unit}` : 
                                    'Not specified'
                                  }
                                </dd>
                              </div>
                              <div className="px-4 py-3 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Weight</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {rwa.rwa_physical_properties?.weight ? 
                                    `${rwa.rwa_physical_properties.weight.value} ${rwa.rwa_physical_properties.weight.unit}` : 
                                    'Not specified'
                                  }
                                </dd>
                              </div>
                              <div className="px-4 py-3 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Materials</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {rwa.rwa_physical_properties?.materials ? 
                                    rwa.rwa_physical_properties.materials.join(', ') : 
                                    'Not specified'
                                  }
                                </dd>
                              </div>
                              <div className="px-4 py-3 sm:px-6 bg-gray-50">
                                <dt className="text-sm font-medium text-gray-500">Condition</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {getSafeMultilingualValue(rwa.rwa_physical_properties?.condition || {}, 'Not specified')}
                                </dd>
                              </div>
                            </div>
                          </dl>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Discovery</h3>
                        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                          <dl>
                            <div className="grid grid-cols-1 md:grid-cols-2">
                              <div className="px-4 py-3 sm:px-6 bg-gray-50">
                                <dt className="text-sm font-medium text-gray-500">Discoverer</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {getSafeMultilingualValue(rwa.rwa_discovery?.discoverer || {}, 'Unknown')}
                                </dd>
                              </div>
                              <div className="px-4 py-3 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Date</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {rwa.rwa_discovery?.discovery_date ? 
                                    new Date(rwa.rwa_discovery.discovery_date).toLocaleDateString() : 
                                    'Unknown'
                                  }
                                </dd>
                              </div>
                              <div className="px-4 py-3 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Location</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {getSafeMultilingualValue(rwa.rwa_discovery?.discovery_location || {}, 'Unknown')}
                                </dd>
                              </div>
                            </div>
                            <div className="px-4 py-3 sm:px-6 bg-gray-50 border-t border-gray-300">
                              <dt className="text-sm font-medium text-gray-500">Discovery Context</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {getSafeMultilingualValue(rwa.rwa_discovery?.discovery_context || {}, 'No context information available.')}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Conservation</h3>
                        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                          <dl>
                            <div className="grid grid-cols-1 md:grid-cols-2">
                              <div className="px-4 py-3 sm:px-6 bg-gray-50">
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {getSafeMultilingualValue(rwa.rwa_conservation?.status || {}, 'Not specified')}
                                </dd>
                              </div>
                              <div className="px-4 py-3 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Last Assessment</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {rwa.rwa_conservation?.last_assessment ? 
                                    new Date(rwa.rwa_conservation.last_assessment).toLocaleDateString() : 
                                    'Not specified'
                                  }
                                </dd>
                              </div>
                            </div>
                            <div className="px-4 py-3 sm:px-6 bg-gray-50 border-t border-gray-300">
                              <dt className="text-sm font-medium text-gray-500">Special Requirements</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {getSafeMultilingualValue(rwa.rwa_conservation?.special_requirements || {}, 'None specified')}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                      
                      {/* Inscriptions */}
                      {rwa.rwa_inscriptions && rwa.rwa_inscriptions.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-gray-900">Inscriptions</h3>
                          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                            <ul className="divide-y divide-gray-200">
                              {rwa.rwa_inscriptions.map((inscription, index) => (
                                <li key={index} className="px-4 py-3">
                                  <p className="text-sm text-gray-900">{inscription}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </Tab.Panel>
                  
                  {/* References Panel */}
                  <Tab.Panel>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Bibliography</h3>
                        {dcar.dar_references?.bibliography && dcar.dar_references.bibliography.length > 0 ? (
                          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                            <ul className="divide-y divide-gray-200">
                              {dcar.dar_references.bibliography.map((reference, index) => (
                                <li key={index} className="px-4 py-3 text-sm">
                                  {reference}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">No bibliography available.</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Related Objects</h3>
                        {dcar.dar_references?.related_objects && dcar.dar_references.related_objects.length > 0 ? (
                          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                            <ul className="divide-y divide-gray-200">
                              {dcar.dar_references.related_objects.map((object, index) => (
                                <li key={index} className="px-4 py-3 text-sm">
                                  {object}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">No related objects available.</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">External Links</h3>
                        {dcar.dar_references?.external_links && dcar.dar_references.external_links.length > 0 ? (
                          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                            <ul className="divide-y divide-gray-200">
                              {dcar.dar_references.external_links.map((link, index) => (
                                <li key={index} className="px-4 py-3 text-sm">
                                  <a 
                                    href={link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center"
                                  >
                                    {link}
                                    <ArrowLeftIcon className="h-4 w-4 ml-1 rotate-45" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">No external links available.</p>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Record Metadata</h3>
                        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                          <dl>
                            <div className="grid grid-cols-1 md:grid-cols-2">
                              <div className="px-4 py-3 sm:px-6 bg-gray-50">
                                <dt className="text-sm font-medium text-gray-500">Record ID</dt>
                                <dd className="mt-1 text-sm text-gray-900">{dcar.dar_id || 'Not specified'}</dd>
                              </div>
                              <div className="px-4 py-3 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">System ID</dt>
                                <dd className="mt-1 text-sm text-gray-900">{dcar.dar_system_id || 'Not specified'}</dd>
                              </div>
                              <div className="px-4 py-3 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Cataloger</dt>
                                <dd className="mt-1 text-sm text-gray-900">{dcar.dar_metadata?.cataloger || 'Not specified'}</dd>
                              </div>
                              <div className="px-4 py-3 sm:px-6 bg-gray-50">
                                <dt className="text-sm font-medium text-gray-500">Catalog Date</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {dcar.dar_metadata?.catalog_date ? 
                                    new Date(dcar.dar_metadata.catalog_date).toLocaleDateString() : 
                                    'Not specified'
                                  }
                                </dd>
                              </div>
                              <div className="px-4 py-3 sm:px-6 bg-gray-50">
                                <dt className="text-sm font-medium text-gray-500">Last Modified</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {dcar.dar_metadata?.last_modified ? 
                                    new Date(dcar.dar_metadata.last_modified).toLocaleString() : 
                                    'Not specified'
                                  }
                                </dd>
                              </div>
                              <div className="px-4 py-3 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">Record Status</dt>
                                <dd className="mt-1 text-sm text-gray-900">{dcar.dar_metadata?.record_status || 'Not specified'}</dd>
                              </div>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
              
              {/* Action buttons */}
              <div className="mt-6 flex space-x-3 border-t pt-6 border-gray-300">
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <ShareIcon className="h-5 w-5 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Full screen image modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          altText={selectedImageCaption || assetTitle}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
