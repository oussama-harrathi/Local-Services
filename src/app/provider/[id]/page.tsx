'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, MessageCircle, Phone, Calendar, Shield, ArrowLeft, Edit, Flag, ImageIcon, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ReviewModal } from '@/components/ReviewModal';
import { ReportModal } from '@/components/ReportModal';
import { LoadingSpinner, LoadingPulse } from '@/components/ui/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import BookingModal from '@/components/BookingModal';
import OrderModal from '@/components/OrderModal';
import Image from 'next/image';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
  };
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Provider {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  city: string;
  latitude: number;
  longitude: number;
  categories: string[];
  photos: string[];
  whatsapp?: string;
  messenger?: string;
  isVerified: boolean;
  createdAt: string;
  menuItems?: MenuItem[];
  review: {
    rating: number;
    count: number;
  };
  reviews: Review[];
}

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await fetch(`/api/providers/${params.id}`);
        if (!response.ok) {
          throw new Error('Provider not found');
        }
        const data = await response.json();
        setProvider(data);
      } catch (error) {
        console.error('Error fetching provider:', error);
        toast({
          title: 'Error',
          description: 'Failed to load provider details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProvider();
    }
  }, [params.id, toast]);

  const handleWhatsAppClick = () => {
    if (provider?.whatsapp) {
      window.open(`https://wa.me/${provider.whatsapp}`, '_blank');
    }
  };

  const handleMessengerClick = () => {
    if (provider?.messenger) {
      window.open(`https://m.me/${provider.messenger}`, '_blank');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Loading Hero */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-start gap-8">
              <LoadingPulse className="w-32 h-32 bg-white/20 rounded-full" />
              <div className="flex-1 space-y-4">
                <LoadingPulse className="h-8 bg-white/20 rounded w-1/3" />
                <LoadingPulse className="h-4 bg-white/20 rounded w-1/2" />
                <LoadingPulse className="h-4 bg-white/20 rounded w-2/3" />
              </div>
            </div>
          </div>
        </div>
        {/* Loading Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <LoadingPulse className="h-64 bg-white/60 rounded-xl shadow-lg" />
              <LoadingPulse className="h-96 bg-white/60 rounded-xl shadow-lg" />
            </div>
            <LoadingPulse className="h-96 bg-white/60 rounded-xl shadow-lg" />
          </div>
        </div>
        {/* Loading Indicator */}
        <div className="fixed bottom-8 right-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl">
            <LoadingSpinner size="md" text="Loading provider details..." />
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-2xl max-w-md mx-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Provider Not Found</h1>
          <p className="text-gray-600 text-lg leading-relaxed">The provider you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 rtl-flip" />
            {t('providerDetails.back')}
          </Button>
          <div className="flex items-start gap-8">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
                <AvatarImage src={provider.avatarUrl} alt={provider.name} />
                <AvatarFallback className="text-4xl bg-white/10 text-white">
                  {provider.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {provider.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white shadow-lg">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{provider.name}</h1>
                {provider.isVerified && (
                  <Badge className="bg-green-500/20 text-green-100 border-green-400/30 px-3 py-1">
                    <Shield className="w-3 h-3 mr-1" />
                    {t('providerDetails.verifiedProvider')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-6 text-blue-100 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{provider.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{t('providerDetails.joined')} {new Date(provider.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                  {renderStars(provider.review.rating)}
                  <span className="font-bold text-xl ml-2">{provider.review.rating.toFixed(1)}</span>
                  <span className="text-blue-200">({provider.review.count} reviews)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {provider.categories.map((category, index) => (
                  <Badge key={index} className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  {t('providerDetails.about')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {provider.bio || t('providerDetails.noBioAvailable')}
                </p>
              </CardContent>
            </Card>

            {/* Photo Gallery */}
            {provider.photos && provider.photos.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                  <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                    {t('providerDetails.workGallery')} ({provider.photos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {provider.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                          {photo && photo.trim() && (photo.startsWith('data:image/') || photo.startsWith('http') || photo.startsWith('/')) ? (
                            photo.startsWith('data:image/') && photo.length > 50 ? (
                              <img
                                src={photo}
                                alt={`Work sample ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // Hide the broken image and show placeholder
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                        <div class="text-center">
                                          <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"></path>
                                          </svg>
                                          <p class="text-xs text-gray-500">Invalid image</p>
                                        </div>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            ) : (photo.startsWith('http') || photo.startsWith('/')) ? (
                              <Image
                                src={photo}
                                alt={`Work sample ${index + 1}`}
                                width={300}
                                height={300}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  // Hide the broken image and show placeholder
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                        <div class="text-center">
                                          <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"></path>
                                          </svg>
                                          <p class="text-xs text-gray-500">Invalid image</p>
                                        </div>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <div className="text-center">
                                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"></path>
                                  </svg>
                                  <p className="text-xs text-gray-500">{t('providerDetails.invalidImage')}</p>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <div className="text-center">
                                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"></path>
                                </svg>
                                <p className="text-xs text-gray-500">{t('providerDetails.noImage')}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Menu Items - Only show for home cooking providers */}
            {provider.categories.includes('food_home') && provider.menuItems && provider.menuItems.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                  <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                    <UtensilsCrossed className="w-6 h-6" />
                    Menu
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {provider.menuItems.map((item) => (
                      <div key={item.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                          <span className="text-xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
                        </div>
                        {item.description && (
                          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                    {t('provider.reviews')} ({provider.review.count})
                  </CardTitle>
                  <Button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {t('providerDetails.writeReview')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {provider.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {provider.reviews.map((review) => (
                      <div key={review.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                            <AvatarImage src={review.user.image} alt={review.user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {review.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-gray-800">{review.user.name}</span>
                              <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-sm">
                                {renderStars(review.rating)}
                              </div>
                              <span className="text-sm text-gray-500 bg-white rounded-full px-2 py-1">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Star className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">{t('providerDetails.noReviewsYet')}</p>
                    <p className="text-gray-400 text-sm">{t('providerDetails.beFirstReview')}</p>
                    <Button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {t('providerDetails.writeFirstReview')}
                    </Button>
                  </div>
                )}
              </CardContent>
          </Card>
        </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-8 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                  {t('providerDetails.contact')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {provider.whatsapp && (
                  <Button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 py-3 text-lg"
                  >
                    <Phone className="w-5 h-5 mr-3" />
                    {t('providerDetails.whatsapp')}
                  </Button>
                )}
                {provider.messenger && (
                  <Button
                    onClick={handleMessengerClick}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 py-3 text-lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-3" />
                    {t('providerDetails.messenger')}
                  </Button>
                )}
                
                {/* Booking and Ordering Buttons */}
                <Separator className="my-4" />
                <div className="space-y-3">
                  {/* Show Book Appointment for service-based categories */}
                  {(provider.categories.includes('cleaning') || 
                    provider.categories.includes('repairs') || 
                    provider.categories.includes('tutoring') || 
                    provider.categories.includes('haircut_mobile') ||
                    provider.categories.includes('pet_care') ||
                    provider.categories.includes('gardening') ||
                    provider.categories.includes('photography') ||
                    provider.categories.includes('fitness_training') ||
                    provider.categories.includes('music_lessons')) && (
                    <Button
                      onClick={() => setIsBookingModalOpen(true)}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 py-3 text-lg"
                    >
                      <Calendar className="w-5 h-5 mr-3" />
                      Book Appointment
                    </Button>
                  )}
                  
                  {/* Show Order Food only for food-related categories */}
                  {provider.categories.includes('food_home') && (
                    <Button
                      onClick={() => setIsOrderModalOpen(true)}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 py-3 text-lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-3" />
                      Order Food
                    </Button>
                  )}
                </div>
                
                {!provider.whatsapp && !provider.messenger && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Phone className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">{t('providerDetails.noContactMethods')}</p>
                    <p className="text-gray-400 text-sm">{t('providerDetails.noContactInfo')}</p>
                  </div>
                )}
                <Separator className="my-4" />
                <Button
                  onClick={() => setIsReportModalOpen(true)}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {t('providerDetails.reportProvider')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        providerId={provider.id}
        onSuccess={() => {
          // Refresh provider data to show new review
          window.location.reload();
        }}
      />
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="provider"
        targetId={provider.id}
        onSuccess={() => {
          toast({
            title: 'Report Submitted',
            description: 'Thank you for your report. We will review it shortly.',
          });
        }}
      />
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        providerId={provider.id}
        providerName={provider.name}
        categories={provider.categories.filter(cat => cat !== 'food_home')}
      />
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        providerId={provider.id}
        providerName={provider.name}
        menuItems={provider.menuItems || []}
      />
    </div>
  );
}