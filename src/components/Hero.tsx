'use client';

import SearchBar from './SearchBar';
import { Category } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeroProps {
  onSearch: (filters: {
    category: Category | '';
    city: string;
    distance: number;
  }) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const { t } = useLanguage();
  
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('hero.title')}
            <span className="text-blue-600 block">{t('hero.subtitle')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            {t('hero.description')}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <SearchBar onSearch={onSearch} />
        </div>
        
        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{t('hero.verifiedProfiles')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>{t('hero.directMessaging')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>{t('hero.localCommunity')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}