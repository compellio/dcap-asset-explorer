import React from 'react';

interface AssetHeaderProps {
  title: string;
}

const AssetHeader: React.FC<AssetHeaderProps> = ({
  title
}) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
    </div>
  );
};

export default AssetHeader;