'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, MapPin, MessageCircle, Phone, Calendar, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

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
  whatsapp?: string;
  messenger?: string;
  isVerified: boolean;
  createdAt: string;
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
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

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
            <div className="animate-pulse flex items-start gap-8">
              <div className="w-32 h-32 bg-white/20 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-white/20 rounded w-1/3"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
                <div className="h-4 bg-white/20 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Loading Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-white/60 rounded-xl shadow-lg"></div>
              <div className="h-96 bg-white/60 rounded-xl shadow-lg"></div>
            </div>
            <div className="h-96 bg-white/60 rounded-xl shadow-lg"></div>
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
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
                    Verified Provider
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
                  <span>Joined {new Date(provider.createdAt).toLocaleDateString()}</span>
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
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {provider.bio || 'No bio available.'}
                </p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  Reviews ({provider.review.count})
                </CardTitle>
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
                    <p className="text-gray-500 text-lg">No reviews yet.</p>
                    <p className="text-gray-400 text-sm">Be the first to leave a review!</p>
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
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {provider.whatsapp && (
                  <Button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 py-3 text-lg"
                  >
                    <Phone className="w-5 h-5 mr-3" />
                    WhatsApp
                  </Button>
                )}
                {provider.messenger && (
                  <Button
                    onClick={handleMessengerClick}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 py-3 text-lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-3" />
                    Messenger
                  </Button>
                )}
                {!provider.whatsapp && !provider.messenger && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Phone className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No contact methods available</p>
                    <p className="text-gray-400 text-sm">Provider hasn't added contact info yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}