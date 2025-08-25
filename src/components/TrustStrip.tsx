'use client';

import { ShieldCheck, Flag, Star, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TrustStrip() {
  const { t } = useLanguage();
  
  const trustFeatures = [
    {
      icon: ShieldCheck,
      title: t('trust.verifiedProfiles'),
      description: t('trust.verifiedDescription'),
      color: 'text-green-600'
    },
    {
      icon: Flag,
      title: t('trust.reportUnsafe'),
      description: t('trust.reportDescription'),
      color: 'text-red-600'
    },
    {
      icon: Star,
      title: t('trust.ratingsYouCanTrust'),
      description: t('trust.ratingsDescription'),
      color: 'text-yellow-600'
    },
    {
      icon: MessageCircle,
      title: t('trust.directCommunication'),
      description: t('trust.communicationDescription'),
      color: 'text-blue-600'
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('trust.safetyPriority')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('trust.builtWithTrust')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustFeatures.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('trust.trustedByThousands')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}