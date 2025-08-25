'use client';

import { useEffect, useRef } from 'react';
import { Provider } from '@/lib/types';
import { CITY_CENTERS } from '@/lib/cities';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface MapPreviewProps {
  providers: Provider[];
  selectedCity?: string;
}

export default function MapPreview({ providers, selectedCity }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamic import of Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Determine map center
      let center = { lat: 36.8065, lng: 10.1815 }; // Default to Tunis
      let zoom = 10;

      if (selectedCity && CITY_CENTERS[selectedCity]) {
        center = CITY_CENTERS[selectedCity];
        zoom = 12;
      } else if (providers.length > 0) {
        // Calculate center from providers
        const avgLat = providers.reduce((sum, p) => sum + p.coords.lat, 0) / providers.length;
        const avgLng = providers.reduce((sum, p) => sum + p.coords.lng, 0) / providers.length;
        center = { lat: avgLat, lng: avgLng };
      }

      // Create map
      const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Define custom marker icon
      const customIcon = L.icon({
        iconUrl: '/marker-icon.svg',
        shadowUrl: '/marker-shadow.svg',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Add markers for providers
      providers.forEach((provider) => {
        const marker = L.marker([provider.coords.lat, provider.coords.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${provider.name}</h3>
              <p class="text-xs text-gray-600 mt-1">${provider.city}</p>
              <p class="text-xs mt-1">${provider.categories.join(', ')}</p>
              <div class="flex items-center mt-2">
                <span class="text-xs font-medium">★ ${provider.review.rating}</span>
                <span class="text-xs text-gray-500 ml-1">(${provider.review.count})</span>
              </div>
            </div>
          `);
      });

      // Fit bounds if multiple providers
      if (providers.length > 1) {
        const group = new L.FeatureGroup(providers.map(p => 
          L.marker([p.coords.lat, p.coords.lng], { icon: customIcon })
        ));
        map.fitBounds(group.getBounds().pad(0.1));
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [providers, selectedCity]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Provider locations
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {providers.length} provider{providers.length !== 1 ? 's' : ''} in your area
        </p>
      </div>
      
      <div 
        ref={mapRef} 
        className="h-64 md:h-80 lg:h-96 w-full"
        style={{ minHeight: '300px' }}
      >
        {/* Fallback content while map loads */}
        <div className="h-full w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center rounded-lg">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <LoadingSpinner size="lg" text="Loading interactive map..." />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50">
        <p className="text-xs text-gray-500">
          Click on markers to see provider details
        </p>
      </div>
    </div>
  );
}