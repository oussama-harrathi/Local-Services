'use client';

import { Provider } from '@/lib/types';
import { Star, MapPin, MessageCircle, Phone } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProviderCardProps {
  provider: Provider;
}

const categoryLabels = {
  food_home: 'Food at home',
  haircut_mobile: 'Haircut at home',
  cleaning: 'Cleaning',
  tutoring: 'Tutoring',
  repairs: 'Repairs',
};

const categoryColors = {
  food_home: 'bg-orange-100 text-orange-700',
  haircut_mobile: 'bg-purple-100 text-purple-700',
  cleaning: 'bg-blue-100 text-blue-700',
  tutoring: 'bg-green-100 text-green-700',
  repairs: 'bg-red-100 text-red-700',
};

export default function ProviderCard({ provider }: ProviderCardProps) {
  const router = useRouter();
  
  const normalizePhone = (phone: string) => {
    return phone.replace(/[^\d+]/g, '');
  };

  const whatsappUrl = provider.whatsapp 
    ? `https://wa.me/${normalizePhone(provider.whatsapp)}`
    : null;

  const messengerUrl = provider.messenger 
    ? `https://${provider.messenger}`
    : null;

  const handleCardClick = () => {
    router.push(`/provider/${provider.id}`);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking contact buttons
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header with avatar and basic info */}
      <div className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <Image
              src={provider.avatarUrl}
              alt={`${provider.name}'s profile`}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-900">
              {provider.name}
            </h3>
            
            <div className="flex items-center justify-center space-x-1 mt-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{provider.city}</span>
            </div>
            
            {/* Rating */}
            <div className="flex items-center justify-center space-x-1 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(provider.review.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {provider.review.rating}
              </span>
              <span className="text-sm text-gray-500">
                ({provider.review.count} reviews)
              </span>
            </div>
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {provider.categories.map((category) => (
            <span
              key={category}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                categoryColors[category]
              }`}
            >
              {categoryLabels[category]}
            </span>
          ))}
        </div>
        
        {/* Bio */}
        <p className="text-gray-600 text-sm mt-4 text-center line-clamp-3">
          {provider.bio}
        </p>
      </div>
      
      {/* Contact buttons */}
      <div className="px-6 pb-6">
        <div className="flex gap-3 justify-center">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleContactClick}
              className="bg-green-600 text-white p-3 rounded-full font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
              aria-label={`Contact ${provider.name} on WhatsApp`}
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
          
          {messengerUrl && (
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleContactClick}
              className="bg-blue-600 text-white p-3 rounded-full font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
              aria-label={`Contact ${provider.name} on Messenger`}
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          )}
          
          {!whatsappUrl && !messengerUrl && (
            <div className="flex-1 bg-gray-100 text-gray-500 px-3 py-2 rounded-lg font-medium text-center text-sm">
              Contact info not available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}