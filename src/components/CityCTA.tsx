'use client';

import { MapPin, ArrowRight, Users } from 'lucide-react';

interface CityCTAProps {
  onCitySelect: (city: string) => void;
}

const cities = [
  {
    name: 'Tunis',
    country: 'Tunisia',
    description: 'Discover authentic Tunisian cuisine, traditional crafts, and local services in the heart of Tunisia.',
    providerCount: '50+',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Sousse',
    country: 'Tunisia',
    description: 'Coastal city charm with fresh seafood, beach services, and Mediterranean hospitality.',
    providerCount: '30+',
    gradient: 'from-teal-500 to-teal-600'
  },
  {
    name: 'Budapest',
    country: 'Hungary',
    description: 'Experience Hungarian culture through local providers offering traditional services and cuisine.',
    providerCount: '40+',
    gradient: 'from-purple-500 to-purple-600'
  }
];

export default function CityCTA({ onCitySelect }: CityCTAProps) {
  return (
    <section id="cities" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore local services by city
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connect with trusted local providers in Tunisia and Hungary
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cities.map((city) => (
            <div 
              key={city.name}
              className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* City gradient background */}
              <div className="relative h-48 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${city.gradient}`} />
                
                {/* Provider count badge */}
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{city.providerCount}</span>
                </div>
                
                {/* City name overlay */}
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                  <div className="flex items-center space-x-1 text-white text-opacity-90">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{city.country}</span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {city.description}
                </p>
                
                <button
                  onClick={() => onCitySelect(city.name)}
                  className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center space-x-2 group"
                  aria-label={`Explore providers in ${city.name}`}
                >
                  <span>Explore {city.name}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            More cities coming soon! 
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
              Join our waitlist
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}