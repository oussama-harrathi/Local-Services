'use client';

import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Category } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchBarProps {
  onSearch: (filters: {
    category: Category | '';
    city: string;
    distance: number;
    query?: string;
  }) => void;
}

const cities = ['', 'Tunis', 'Sousse', 'Budapest'];

export default function SearchBar({ onSearch }: SearchBarProps) {
  const { t } = useLanguage();
  const [category, setCategory] = useState<Category | ''>('');
  const [city, setCity] = useState('');
  const [distance, setDistance] = useState(5);
  const [query, setQuery] = useState('');

  const categories = [
    { value: '', label: t('search.allCategories') },
    { value: 'food_home', label: t('categories.food_home') },
    { value: 'mobile_barber', label: t('categories.mobile_barber') },
    { value: 'cleaning', label: t('categories.cleaning') },
    { value: 'tutoring', label: t('categories.tutoring') },
    { value: 'repairs', label: t('categories.repairs') },
  ] as const;

  const handleSearch = () => {
    onSearch({ category, city, distance, query: query.trim() || undefined });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* Search Query Input */}
        <div className="space-y-2">
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 h-5">
            {t('search.searchPlaceholder')}
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('search.searchPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10 text-gray-900"
          />
        </div>

        {/* Category Select */}
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 h-5">
            {t('search.allCategories')}
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10 bg-white text-gray-900"
            style={{
              color: '#111827',
              backgroundColor: '#ffffff'
            }}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* City Select */}
        <div className="space-y-2">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 h-5">
            <MapPin className="inline w-4 h-4 mr-1" />
            {t('search.allCities')}
          </label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10 bg-white text-gray-900"
            style={{
              color: '#111827',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="">{t('search.allCities')}</option>
            {cities.slice(1).map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </select>
        </div>

        {/* Distance Slider */}
        <div className="space-y-2">
          <label htmlFor="distance" className="block text-sm font-medium text-gray-700 h-5">
            {t('search.maxDistance')}
          </label>
          <div className="flex items-center space-x-2 h-10">
            <span className="text-xs text-gray-500">2</span>
            <input
              id="distance"
              type="range"
              min="2"
              max="10"
              step="1"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              onKeyPress={handleKeyPress}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-gray-500">10</span>
          </div>
        </div>

        {/* Search Button */}
        <div className="space-y-2">
          <div className="h-5"></div>
          <button
            onClick={handleSearch}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2 h-10"
            aria-label="Search for providers"
          >
            <Search className="w-4 h-4" />
            <span>{t('search.searchButton')}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}