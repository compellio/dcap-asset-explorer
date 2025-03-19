import React from 'react';
import { shouldDisplaySection } from '@/utils/assetDetailUtils';
import ConceptLink from './ConceptLink';
import { DCConcept, DCLanguageValue, DCAgent } from '@/types';

interface AssetPropertiesCardProps {
  description: string;
  types: Array<DCConcept | DCLanguageValue>;
  subjects: Array<DCConcept | DCLanguageValue>;
  creators: Array<DCConcept | DCAgent | DCLanguageValue>;
  dates: string[];
  identifiers: string[];
  languages: string[];
  locations: Array<DCConcept | DCLanguageValue>;
  sources: Array<DCLanguageValue>;
  collections: Array<DCLanguageValue>;
  id?: string;
  receipt?: string;
  context?: string;
  checksum?: string;
  version?: number;
}

const AssetPropertiesCard: React.FC<AssetPropertiesCardProps> = ({
  description,
  types,
  subjects,
  creators,
  dates,
  identifiers,
  languages,
  locations,
  sources,
  collections,
  context,
  checksum,
  version
}) => {
  const PropertyRow = ({ label, content, className = '' }: { label: string, content: React.ReactNode, className?: string }) => (
    <div className={`py-4 border-b border-slate-100 ${className}`}>
      <div className="text-sm font-bold text-slate-800 mb-2">{label}</div>
      <div className="text-sm text-slate-700">{content}</div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        {shouldDisplaySection(description) && (
          <PropertyRow 
            label="Description" 
            content={<p className="whitespace-pre-line">{description}</p>}
          />
        )}
        
        {shouldDisplaySection(creators) && (
          <PropertyRow 
            label="Creator" 
            content={
              <div className="space-y-1">
                {creators.map((creator, index) => (
                  <div key={index}><ConceptLink concept={creator} /></div>
                ))}
              </div>
            }
          />
        )}
        
        {shouldDisplaySection(dates) && (
          <PropertyRow 
            label="Date" 
            content={
              <div className="space-y-1">
                {dates.map((date, index) => (
                  <div key={index}>{date}</div>
                ))}
              </div>
            }
          />
        )}
        
        {shouldDisplaySection(types) && (
          <PropertyRow 
            label="Type" 
            content={
              <div className="space-y-1">
                {types.map((type, index) => (
                  <div key={index}><ConceptLink concept={type} /></div>
                ))}
              </div>
            }
          />
        )}
        
        {shouldDisplaySection(subjects) && (
          <PropertyRow 
            label="Subject" 
            content={
              <div className="space-y-1">
                {subjects.map((subject, index) => (
                  <div key={index}><ConceptLink concept={subject} /></div>
                ))}
              </div>
            }
          />
        )}
        
        {shouldDisplaySection(locations) && (
          <PropertyRow 
            label="Location" 
            content={
              <div className="space-y-1">
                {locations.map((location, index) => (
                  <div key={index}><ConceptLink concept={location} /></div>
                ))}
              </div>
            }
          />
        )}
        
        {shouldDisplaySection(sources) && (
          <PropertyRow 
            label="Source" 
            content={
              <div className="space-y-1">
                {sources.map((source, index) => (
                  <div key={index}><ConceptLink concept={source} /></div>
                ))}
              </div>
            }
          />
        )}
        
        {shouldDisplaySection(collections) && (
          <PropertyRow 
            label="Part of Collection" 
            content={
              <div className="space-y-1">
                {collections.map((collection, index) => (
                  <div key={index}><ConceptLink concept={collection} /></div>
                ))}
              </div>
            }
          />
        )}
        
        {shouldDisplaySection(identifiers) && (
          <PropertyRow 
            label="Identifier" 
            content={
              <div className="space-y-1">
                {identifiers.map((identifier, index) => (
                  <div key={index} className="bg-slate-50 p-2 rounded">{identifier}</div>
                ))}
              </div>
            }
          />
        )}
        
        {shouldDisplaySection(languages) && (
          <PropertyRow 
            label="Language" 
            content={
              <div className="flex flex-wrap gap-2">
                {languages.map((language, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {language}
                  </span>
                ))}
              </div>
            }
          />
        )}
        
        {shouldDisplaySection(context) && (
          <PropertyRow 
            label="Context" 
            content={<div className="font-mono text-xs bg-slate-50 p-2 rounded break-all">{context}</div>}
          />
        )}
        
        {shouldDisplaySection(checksum) && (
          <PropertyRow 
            label="Checksum" 
            content={<div className="font-mono text-xs bg-slate-50 p-2 rounded break-all">{checksum}</div>}
          />
        )}
        
        {shouldDisplaySection(version) && (
          <PropertyRow 
            label="Version" 
            content={<div className="font-mono bg-slate-50 p-2 rounded">{version}</div>}
            className="border-b-0"
          />
        )}
      </div>
    </div>
  );
};

export default AssetPropertiesCard;
