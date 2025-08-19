'use client';

import { Provider } from '@/lib/types';
import ProviderCard from './ProviderCard';
import { Search } from 'lucide-react';

interface ProviderGridProps {
  providers: Provider[];
  isLoading?: boolean;
}

export default function ProviderGrid({ providers, isLoading = false }: ProviderGridProps) {
  if (isLoading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-80"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No providers found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              We couldn't find any providers matching your search criteria. Try adjusting your filters or expanding your search area.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Try selecting "All categories" or a different category</p>
              <p>• Increase the distance range</p>
              <p>• Select "All cities" to see providers from other areas</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Available providers
          </h2>
          <p className="text-gray-600">
            {providers.length} provider{providers.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
        
        {providers.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Showing {providers.length} of {providers.length} providers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}