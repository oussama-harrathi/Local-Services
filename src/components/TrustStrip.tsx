'use client';

import { ShieldCheck, Flag, Star, MessageCircle } from 'lucide-react';

export default function TrustStrip() {
  const trustFeatures = [
    {
      icon: ShieldCheck,
      title: 'Verified profiles',
      description: 'All providers go through our verification process',
      color: 'text-green-600'
    },
    {
      icon: Flag,
      title: 'Report unsafe listings',
      description: 'Easy reporting system for community safety',
      color: 'text-red-600'
    },
    {
      icon: Star,
      title: 'Ratings you can trust',
      description: 'Authentic reviews from real customers',
      color: 'text-yellow-600'
    },
    {
      icon: MessageCircle,
      title: 'Direct communication',
      description: 'Connect directly with providers via WhatsApp or Messenger',
      color: 'text-blue-600'
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Your safety is our priority
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We've built LocalSpark with trust and safety at its core
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
            <span>Trusted by thousands of users across Tunisia and Hungary</span>
          </div>
        </div>
      </div>
    </section>
  );
}