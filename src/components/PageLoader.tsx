'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingSpinner } from './ui/LoadingSpinner';

// Route loading context
interface RouteLoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const RouteLoadingContext = createContext<RouteLoadingContextType | undefined>(undefined);

export function RouteLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const startLoading = () => {
    setIsLoading(true);
  };
  const stopLoading = () => {
    setIsLoading(false);
  };

  // Stop loading when pathname changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <RouteLoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </RouteLoadingContext.Provider>
  );
}

export function useRouteLoadingContext() {
  const context = useContext(RouteLoadingContext);
  if (!context) {
    throw new Error('useRouteLoadingContext must be used within RouteLoadingProvider');
  }
  return context;
}

interface PageLoaderProps {
  isLoading?: boolean;
  text?: string;
}

export function PageLoader({ isLoading = false, text = 'Loading page...' }: PageLoaderProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 max-w-sm mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <LoadingSpinner size="lg" variant="white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">LocalSpark</h3>
          <p className="text-gray-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

// Hook for route transition loading (legacy - kept for compatibility)
export function useRouteLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Simulate loading time

    return () => clearTimeout(timer);
  }, [pathname]);

  return isLoading;
}

// Global route loader component
export function RouteLoader() {
  const { isLoading } = useRouteLoadingContext();
  
  return <PageLoader isLoading={isLoading} text="Loading page..." />;
}

// Loading states for different page types
export const PageLoadingStates = {
  dashboard: 'Loading dashboard...',
  provider: 'Loading provider details...',
  admin: 'Loading admin panel...',
  contact: 'Loading contact form...',
  search: 'Searching providers...',
  profile: 'Loading profile...',
} as const;

export type PageLoadingState = keyof typeof PageLoadingStates;

// Enhanced page loader with different states
export function EnhancedPageLoader({ 
  isLoading = false, 
  state = 'dashboard' 
}: { 
  isLoading?: boolean; 
  state?: PageLoadingState; 
}) {
  return (
    <PageLoader 
      isLoading={isLoading} 
      text={PageLoadingStates[state]} 
    />
  );
}