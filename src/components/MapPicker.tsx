'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, city: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialCity?: string;
}

export default function MapPicker({ 
  onLocationSelect, 
  initialLat = 0, 
  initialLng = 0, 
  initialCity = '' 
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet
        const L = (await import('leaflet')).default;
        
        if (!mapRef.current || mapInstanceRef.current) return;

        // Set default icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/marker-icon.svg',
          iconUrl: '/marker-icon.svg',
          shadowUrl: '/marker-shadow.svg',
        });

        // Initialize map
        const map = L.map(mapRef.current).setView([initialLat || 46.2044, initialLng || 6.1432], 13);
        mapInstanceRef.current = map;

        // Add tile layer with fallback servers
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        });

        // Add error handling for tile loading
        tileLayer.on('tileerror', function(error: any) {
          console.warn('Tile loading error:', error);
          // Optionally switch to a different tile provider
          if (error.tile && error.tile.src.includes('openstreetmap.org')) {
            // Fallback to CartoDB tiles
            const fallbackLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
              attribution: '© OpenStreetMap contributors, © CARTO',
              maxZoom: 19,
              subdomains: 'abcd'
            });
            map.removeLayer(tileLayer);
            fallbackLayer.addTo(map);
          }
        });

        tileLayer.addTo(map);

        // Custom marker icon
        const customIcon = L.icon({
          iconUrl: '/marker-icon.svg',
          shadowUrl: '/marker-shadow.svg',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        // Add initial marker if coordinates exist
        if (initialLat && initialLng) {
          const marker = L.marker([initialLat, initialLng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<div class="p-2"><strong>${initialCity || 'Selected Location'}</strong></div>`);
          markerRef.current = marker;
        }

        // Handle map clicks
        map.on('click', async (e: any) => {
          const { lat, lng } = e.latlng;
          
          // Remove existing marker
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }

          // Add new marker
          const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
          markerRef.current = marker;

          // Reverse geocoding to get city name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
            );
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown Location';
            
            marker.bindPopup(`<div class="p-2"><strong>${city}</strong><br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}</div>`).openPopup();
            
            // Call the callback
            onLocationSelect(lat, lng, city);
          } catch (error) {
            console.error('Geocoding error:', error);
            marker.bindPopup(`<div class="p-2"><strong>Selected Location</strong><br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}</div>`).openPopup();
            onLocationSelect(lat, lng, 'Unknown Location');
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [initialLat, initialLng, initialCity, onLocationSelect]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const city = result.address?.city || result.address?.town || result.address?.village || result.display_name;

        // Move map to location
        mapInstanceRef.current.setView([lat, lng], 15);

        // Remove existing marker
        if (markerRef.current) {
          mapInstanceRef.current.removeLayer(markerRef.current);
        }

        // Add new marker
        const L = (await import('leaflet')).default;
        const customIcon = L.icon({
          iconUrl: '/marker-icon.svg',
          shadowUrl: '/marker-shadow.svg',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<div class="p-2"><strong>${city}</strong></div>`)
          .openPopup();
        
        markerRef.current = marker;
        onLocationSelect(lat, lng, city);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e);
              }
            }}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="h-64 md:h-80 w-full rounded-lg border border-gray-300"
          style={{ minHeight: '320px' }}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="mt-2 flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          <span>Click on the map to select your location</span>
        </div>
      </div>
    </div>
  );
}