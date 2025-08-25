'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryPills from '@/components/CategoryPills';
import ProviderGrid from '@/components/ProviderGrid';
import MapPreview from '@/components/MapPreview';
import TrustStrip from '@/components/TrustStrip';
import CityCTA from '@/components/CityCTA';
import Footer from '@/components/Footer';
import { CITY_CENTERS } from '@/lib/cities';
import { Category, Provider } from '@/lib/types';

export default function Home() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  // Build query parameters for API call
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    
    if (selectedCity) params.append('city', selectedCity);
    if (selectedCategory) params.append('category', selectedCategory);
    if (searchQuery) params.append('q', searchQuery);
    
    // Add location-based filtering if city is selected
    if (selectedCity && CITY_CENTERS[selectedCity]) {
      const cityCenter = CITY_CENTERS[selectedCity];
      params.append('lat', cityCenter.lat.toString());
      params.append('lng', cityCenter.lng.toString());
      params.append('maxKm', selectedDistance.toString());
    }
    
    return params.toString();
  }, [selectedCategory, selectedCity, selectedDistance, searchQuery]);

  // Fetch providers using React Query
  const { data: providers = [], isLoading, error } = useQuery({
    queryKey: ['providers', queryParams],
    queryFn: async () => {
      const url = `/api/providers${queryParams ? `?${queryParams}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      return response.json() as Promise<Provider[]>;
    },
  });

  // Note: Removed auto-loading of saved preferences to ensure clean initial state
  // Users will start with 'All Categories' and 'All Cities' by default

  // Optional: Save preferences to localStorage for user convenience
  // This can be re-enabled if you want to remember user selections across sessions
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     if (selectedCity) localStorage.setItem('localspark_city', selectedCity);
  //     if (selectedCategory) localStorage.setItem('localspark_category', selectedCategory);
  //   }
  // }, [selectedCity, selectedCategory]);

  // Providers are already filtered by the API, so we use them directly
  const filteredProviders = providers;

  const handleSearch = (filters: {
    category: Category | '';
    city: string;
    distance: number;
    query?: string;
  }) => {
    setSelectedCategory(filters.category);
    setSelectedCity(filters.city);
    setSelectedDistance(filters.distance);
    if (filters.query !== undefined) {
      setSearchQuery(filters.query);
    }
    
    // Scroll to results
    setTimeout(() => {
      const resultsSection = document.getElementById('results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleCategorySelect = (category: Category | '') => {
    setSelectedCategory(category);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    // Scroll to results after city selection
    setTimeout(() => {
      const resultsSection = document.getElementById('results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "LocalSpark",
            "description": "Find trusted local service providers for home-cooked meals, mobile haircuts, cleaning, tutoring, and repairs in Tunisia and Hungary.",
            "url": "https://localspark.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://localspark.com/?category={category}&city={city}"
              },
              "query-input": "required name=category,city"
            },
            "areaServed": [
              {
                "@type": "Country",
                "name": "Tunisia"
              },
              {
                "@type": "Country",
                "name": "Hungary"
              }
            ]
          })
        }}
      />
      
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main>
          <Hero onSearch={handleSearch} />
          
          <CategoryPills 
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
          
          <section id="results" className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Providers Grid - Takes 2 columns on large screens */}
                <div className="lg:col-span-2">
                  <ProviderGrid 
                    providers={filteredProviders} 
                    isLoading={isLoading}
                  />
                </div>
                
                {/* Map Preview - Takes 1 column on large screens */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24">
                    <MapPreview 
                      providers={filteredProviders}
                      selectedCity={selectedCity}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <TrustStrip />
          
          {/* How It Works Section */}
          <section id="how-it-works" className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('howItWorks.title')}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {t('howItWorks.subtitle')}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('howItWorks.step1.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('howItWorks.step1.description')}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('howItWorks.step2.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('howItWorks.step2.description')}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('howItWorks.step3.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('howItWorks.step3.description')}
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <CityCTA onCitySelect={handleCitySelect} />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
