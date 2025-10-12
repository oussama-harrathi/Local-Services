'use client';

import { Provider } from '@/lib/types';
import { Star, MapPin, MessageCircle, Phone, Clock, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import VerificationBadge from './VerificationBadge';

interface ProviderCardProps {
  provider: Provider;
}

const categoryLabels = {
  food_home: 'Food at home',
  haircut_mobile: 'Haircut at home',
  cleaning: 'Cleaning',
  tutoring: 'Tutoring',
  repairs: 'Repairs',
  pet_care: 'Pet Care',
  gardening: 'Gardening',
  photography: 'Photography',
  fitness_training: 'Fitness Training',
  music_lessons: 'Music Lessons',
};

const categoryColors = {
  food_home: 'bg-orange-100 text-orange-700',
  haircut_mobile: 'bg-purple-100 text-purple-700',
  cleaning: 'bg-blue-100 text-blue-700',
  tutoring: 'bg-green-100 text-green-700',
  repairs: 'bg-red-100 text-red-700',
  pet_care: 'bg-pink-100 text-pink-700',
  gardening: 'bg-emerald-100 text-emerald-700',
  photography: 'bg-indigo-100 text-indigo-700',
  fitness_training: 'bg-yellow-100 text-yellow-700',
  music_lessons: 'bg-violet-100 text-violet-700',
};

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export default function ProviderCard({ provider }: ProviderCardProps) {
  const router = useRouter();
  
  // Helper function to check if provider is currently open
  const isProviderOpen = (schedules?: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[]) => {
    if (!schedules || schedules.length === 0) return null;
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    
    const todaySchedule = schedules.find(schedule => schedule.dayOfWeek === currentDay);
    if (!todaySchedule) return false;
    
    const [startHour, startMin] = todaySchedule.startTime.split(':').map(Number);
    const [endHour, endMin] = todaySchedule.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  };
  
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
            {provider.avatarUrl && provider.avatarUrl.trim() !== '' && (provider.avatarUrl.startsWith('data:image/') || provider.avatarUrl.startsWith('http') || provider.avatarUrl.startsWith('/')) ? (
              provider.avatarUrl.startsWith('data:image/') && provider.avatarUrl.length > 50 ? (
                <img
                  src={provider.avatarUrl}
                  alt={`${provider.name}'s profile`}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    // Hide the broken image and show placeholder
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <span class="text-gray-500 text-xl font-semibold">
                            ${provider.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (provider.avatarUrl.startsWith('http') || provider.avatarUrl.startsWith('/')) ? (
                <Image
                  src={provider.avatarUrl}
                  alt={`${provider.name}'s profile`}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    // Hide the broken image and show placeholder
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <span class="text-gray-500 text-xl font-semibold">
                            ${provider.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xl font-semibold">
                    {provider.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl font-semibold">
                  {provider.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="w-full">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {provider.name}
              </h3>
              <VerificationBadge
                verificationStatus={provider.verificationStatus || 'unverified'}
                verificationLevel={provider.verificationLevel}
                verificationBadgeType={provider.verificationBadgeType}
                size="sm"
                showText={false}
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{provider.city}</span>
            </div>

            {/* Verification Status */}
            <div className="flex items-center justify-center gap-1 mt-1">
              {provider.verificationStatus === 'approved' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">Verified</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Unverified</span>
                </>
              )}
            </div>

            {/* Current Status */}
            {provider.schedules && provider.schedules.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {(() => {
                  const isOpen = isProviderOpen(provider.schedules);
                  if (isOpen === null) return null;
                  return (
                    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      isOpen 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isOpen ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">{isOpen ? 'Open' : 'Closed'}</span>
                    </div>
                  );
                })()}
              </div>
            )}
            
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