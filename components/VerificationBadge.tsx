import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

interface VerificationBadgeProps {
  id: string;
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  id,
  className = '',
}) => {
  if (!id) return null;
  return (
    <div className={`bg-gray-100 rounded-lg p-2 ${className}`}>
      <div className="flex items-center">
        <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
        <span className="text-sm text-gray-700 font-medium">Verified:</span>
      </div>
      <div className="mt-1">
        <span className="text-sm text-gray-600 font-mono break-all">
          {id}
        </span>
      </div>
    </div>
  );
};

export default VerificationBadge;
