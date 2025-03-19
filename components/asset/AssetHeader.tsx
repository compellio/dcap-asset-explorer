import React from 'react';
import { LanguageIcon } from '@heroicons/react/24/outline';

interface AssetHeaderProps {
  title: string;
  availableLanguages: string[];
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const AssetHeader: React.FC<AssetHeaderProps> = ({
  title,
  availableLanguages,
  selectedLanguage,
  onLanguageChange
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
      </div>
      
      {availableLanguages.length > 1 && (
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <LanguageIcon className="h-5 w-5 text-slate-400" />
            <select 
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              {availableLanguages.map(lang => (
                <option key={lang} value={lang}>
                  {lang === 'en' ? 'English' : 
                   lang === 'fr' ? 'Français' : 
                   lang === 'de' ? 'Deutsch' : 
                   lang === 'es' ? 'Español' : 
                   lang === 'it' ? 'Italiano' : 
                   lang === 'el' ? 'Ελληνικά' : 
                   lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetHeader;
