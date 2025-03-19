import React from 'react';
import { InformationCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface AssetNotFoundProps {
  error: string | null;
  onBack: () => void;
}

const AssetNotFound: React.FC<AssetNotFoundProps> = ({ error, onBack }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
          <InformationCircleIcon className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Asset Not Found</h2>
        <p className="text-slate-600 mb-6">{error || 'We couldn\'t find the asset you\'re looking for.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default AssetNotFound;