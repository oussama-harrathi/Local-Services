'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategoryPills from '@/components/CategoryPills';
import ProviderGrid from '@/components/ProviderGrid';
import MapPreview from '@/components/MapPreview';
import TrustStrip from '@/components/TrustStrip';
import CityCTA from '@/components/CityCTA';
import Footer from '@/components/Footer';
// import { mockProviders } from '@/lib/mockData'; // Replaced with API call
import { haversineKm } from '@/lib/geo';
import { CITY_CENTERS } from '@/lib/cities';
import { Category, Provider } from '@/lib/types';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | ''>('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);

  // Fetch providers from API
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/providers');
        if (response.ok) {
          const data = await response.json();
          setProviders(data);
        } else {
          console.error('Failed to fetch providers');
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Load saved preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCity = localStorage.getItem('localspark_city');
      const savedCategory = localStorage.getItem('localspark_category');
      
      if (savedCity) setSelectedCity(savedCity);
      if (savedCategory) setSelectedCategory(savedCategory as Category | '');
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedCity) localStorage.setItem('localspark_city', selectedCity);
      if (selectedCategory) localStorage.setItem('localspark_category', selectedCategory);
    }
  }, [selectedCity, selectedCategory]);

  // Filter providers based on search criteria
  const filteredProviders = useMemo(() => {
    let filtered = [...providers];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(provider => 
        provider.categories.includes(selectedCategory)
      );
    }

    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(provider => provider.city === selectedCity);
    }

    // Filter by distance
    if (selectedCity && CITY_CENTERS[selectedCity]) {
      const cityCenter = CITY_CENTERS[selectedCity];
      filtered = filtered.filter(provider => {
        const distance = haversineKm(cityCenter, provider.coords);
        return distance <= selectedDistance;
      });
    }

    return filtered;
  }, [providers, selectedCategory, selectedCity, selectedDistance]);

  const handleSearch = (filters: {
    category: Category | '';
    city: string;
    distance: number;
  }) => {
    setIsLoading(true);
    
    // Simulate search delay for better UX
    setTimeout(() => {
      setSelectedCategory(filters.category);
      setSelectedCity(filters.city);
      setSelectedDistance(filters.distance);
      setIsLoading(false);
      
      // Scroll to results
      const resultsSection = document.getElementById('results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
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
          
          <CityCTA onCitySelect={handleCitySelect} />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
