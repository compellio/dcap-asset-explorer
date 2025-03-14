import React from 'react';
import {
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

interface VerificationBadgeProps {
  id: string;
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  id,
  className = '',
}) => {
  // Extract the Ethereum address if the ID is in the URN format
  // Example: "urn:tar:eip155.128123:304e3f5101ea467ac87e3e3793bb14bfcb4bee8d"
  const extractEthAddress = (urnId: string): string => {
    if (!urnId || !urnId.startsWith('urn:tar:eip155')) return '';
    const parts = urnId.split(':');
    if (parts.length < 3) return '';
    return parts[parts.length - 1];
  };

  const ethAddress = extractEthAddress(id);
  const etherscanUrl = ethAddress
    ? `https://sepolia.etherscan.io/address/${ethAddress}`
    : '';

  const displayId =
    id.length > 30
      ? `${id.substring(0, 15)}...${id.substring(id.length - 15)}`
      : id;

  if (!id) return null;

  return (
    <div className={`bg-gray-100 rounded-lg p-2 ${className}`}>
      {/* First row: icon + label */}
      <div className="flex items-center">
        <ShieldCheckIcon className="h-5 w-5 text-green-600 mr-2" />
        <span className="text-sm text-gray-700 font-medium">
          Verified on Trustchain:
        </span>
      </div>

      {/* Second row: ID + optional link */}
      <div className="flex items-center mt-1">
        <span className="text-sm text-gray-600 font-mono break-all">
          {displayId}
        </span>
        {etherscanUrl && (
          <a
            href={etherscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-indigo-600 hover:text-indigo-800 flex items-center"
            title="View on Etherscan"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
};

export default VerificationBadge;
