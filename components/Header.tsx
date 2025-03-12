import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl">Tru-IP AMiCA</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;