import React, { useState } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { DCConcept, DCLanguageValue } from '@/types';
import { getConceptLabel } from '@/utils/assetUtils';

interface ConceptLinkProps {
  concept: DCConcept | DCLanguageValue | any;
}

const ConceptLink: React.FC<ConceptLinkProps> = ({ concept }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Simple text value
  if (typeof concept === 'string') {
    return <span className="text-slate-700">{concept}</span>;
  }
  
  // Handle language value objects
  if (concept["@language"] && concept["@value"]) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-slate-700">{concept["@value"]}</span>
        <span className="text-xs bg-slate-200 px-1 rounded text-slate-600">{concept["@language"]}</span>
      </div>
    );
  }
  
  // Handle concept/authority objects
  if (concept["@id"]) {
    const label = getConceptLabel(concept, 'Unknown');
    const id = concept["@id"];
    const type = concept["@type"] || '';
    
    // Make the URL clickable if it's a valid web URL
    const isValidUrl = id.startsWith('http://') || id.startsWith('https://');
    
    return (
      <div className="relative">
        <div
          className="flex items-center gap-1 cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {isValidUrl ? (
            <a 
              href={id} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline inline-flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {label}
              <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 text-indigo-400" />
            </a>
          ) : (
            <span className="text-indigo-600">{label}</span>
          )}
        </div>
        
        {showTooltip && (
          <div className="absolute z-50 mt-1 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 p-2 text-xs">
            <div className="font-medium mb-1">{label}</div>
            {type && <div className="text-slate-500">Type: {type}</div>}
            <div className="text-slate-500 truncate">ID: {id}</div>
          </div>
        )}
      </div>
    );
  }
  
  // Fallback
  return <span className="text-slate-700">{getConceptLabel(concept, 'Unknown')}</span>;
};

export default ConceptLink;
