import React from 'react';

const AssetDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        {/* Back button skeleton */}
        <div className="h-4 bg-slate-200 rounded w-24 mb-6"></div>
        
        {/* Header skeleton */}
        <div className="h-8 bg-slate-200 rounded w-1/2 mb-8"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column skeleton */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              {/* Image section skeleton */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="bg-slate-200 rounded-lg aspect-square"></div>
              </div>
              
              {/* Verification section skeleton */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Right column skeleton - single properties card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Properties list skeleton */}
              {[...Array(6)].map((_, index) => (
                <div key={index} className="py-4 border-b border-slate-100 last:border-b-0">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailSkeleton;
