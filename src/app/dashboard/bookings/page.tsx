'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { LoadingSpinner, LoadingButton } from '@/components/ui/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';

interface Booking {
  id: string;
  date: string;
  duration: number;
  notes?: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  serviceType: string;
  provider: {
    name: string;
    city: string;
    avatarUrl?: string;
  };
}

export default function BookingsPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // Fetch user's bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: async () => {
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json() as Promise<Booking[]>;
    },
    enabled: !!session?.user?.id,
  });

  // Helper function to check if booking can be cancelled (24 hours before appointment)
  const canCancelBooking = (bookingDate: string): boolean => {
    const appointmentTime = new Date(bookingDate);
    const currentTime = new Date();
    const timeDifference = appointmentTime.getTime() - currentTime.getTime();
    const hoursUntilAppointment = timeDifference / (1000 * 60 * 60);
    
    return hoursUntilAppointment >= 24;
  };

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!response.ok) throw new Error('Failed to cancel booking');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('Pending');
      case 'confirmed':
        return t('Confirmed');
      case 'cancelled':
        return t('Cancelled');
      case 'completed':
        return t('Completed');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('Back')}
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('My Appointments')}</h1>
          <p className="text-gray-600 mt-2">{t('View and manage your scheduled appointments')}</p>
        </div>

        {!bookings || bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('No appointments yet')}</h3>
            <p className="text-gray-500 mb-6">{t('When you book appointments, they will appear here')}</p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {t('Browse Providers')}
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="flex-shrink-0">
                          {booking.provider.avatarUrl ? (
                            <img
                              src={booking.provider.avatarUrl}
                              alt={booking.provider.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-black">{booking.provider.name}</h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            {booking.provider.city}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                          <span className="text-black">{new Date(booking.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock className="w-5 h-5 mr-2 text-gray-400" />
                          <span className="text-black">
                            {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                            ({booking.duration} {t('minutes')})
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">{t('Service Type')}</p>
                        <p className="text-black font-medium">{booking.serviceType}</p>
                      </div>

                      {booking.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">{t('Notes')}</p>
                          <p className="text-black">{booking.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(booking.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-black">${booking.totalPrice}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-end">
                        {canCancelBooking(booking.date) ? (
                          <LoadingButton
                            onClick={() => cancelBookingMutation.mutate(booking.id)}
                            isLoading={cancelBookingMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                          >
                            {t('Cancel Appointment')}
                          </LoadingButton>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-md">
                            <AlertCircle className="w-4 h-4" />
                            {t('Cannot cancel (less than 24 hours)')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}