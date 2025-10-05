'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, ShoppingCart, Clock, User, MapPin, Phone, MessageSquare, Check, X, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { LoadingButton, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useLanguage } from '@/contexts/LanguageContext'

interface Booking {
  id: string
  serviceType: string
  date: string
  time: string
  duration: number
  notes?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  totalPrice?: number
  customer: {
    name: string
    email: string
    phone: string
  }
}

interface Order {
  id: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalPrice: number
  deliveryAddress: string
  notes?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  createdAt: string
  customer: {
    name: string
    email: string
    phone: string
  }
}

interface ProviderOrdersManagerProps {
  providerId: string
}

export default function ProviderOrdersManager({ providerId }: ProviderOrdersManagerProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders'>('bookings')
  const { t } = useLanguage()
  const queryClient = useQueryClient()

  // Fetch bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['provider-bookings', providerId],
    queryFn: async () => {
      const response = await fetch(`/api/bookings?type=provider`)
      if (!response.ok) throw new Error('Failed to fetch bookings')
      return (await response.json()) as Booking[]
    }
  })

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['provider-orders', providerId],
    queryFn: async () => {
      const response = await fetch(`/api/orders?type=provider`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      return (await response.json()) as Order[]
    }
  })

  // Update booking status
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: 'confirmed' | 'cancelled' }) => {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error('Failed to update booking')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-bookings', providerId] })
      toast.success('Booking status updated successfully')
    },
    onError: () => {
      toast.error('Failed to update booking status')
    }
  })

  // Update order status
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: 'confirmed' | 'cancelled' }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error('Failed to update order')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-orders', providerId] })
      toast.success('Order status updated successfully')
    },
    onError: () => {
      toast.error('Failed to update order status')
    }
  })

  const handleBookingAction = (bookingId: string, status: 'confirmed' | 'cancelled') => {
    updateBookingMutation.mutate({ bookingId, status })
  }

  const handleOrderAction = (orderId: string, status: 'confirmed' | 'cancelled') => {
    updateOrderMutation.mutate({ orderId, status })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'preparing': return 'bg-blue-100 text-blue-800'
      case 'ready': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Providers can reject/cancel appointments at any time (no 24-hour restriction)
  const canCancelBooking = (bookingDate: string) => {
    // Providers have full control over their appointments and can reject them anytime
    return true;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    try {
      // Handle different time formats
      if (!timeString) return 'Time not set';
      
      // If it's already in HH:MM format, use it directly
      if (/^\d{2}:\d{2}$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // If it's a full datetime string, extract time
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Fallback for other formats
      return timeString;
    } catch (error) {
      console.warn('Error formatting time:', timeString, error);
      return 'Invalid Time';
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Orders & Appointments Management</h2>
        <p className="text-gray-600 mt-1">Manage your incoming bookings and orders</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Appointments ({bookings?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShoppingCart className="w-4 h-4 inline mr-2" />
            Orders ({orders?.length || 0})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : bookings && bookings.length > 0 ? (
              bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  id={`booking-${booking.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(booking.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2">{booking.serviceType}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{booking.customer.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(booking.time)} ({booking.duration} min)</span>
                        </div>
                        {booking.notes && (
                          <div className="flex items-start gap-2 md:col-span-2">
                            <MessageSquare className="w-4 h-4 mt-0.5" />
                            <span>{booking.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <div className="flex gap-2 ml-4">
                        {booking.status === 'pending' && (
                          <LoadingButton
                            onClick={() => handleBookingAction(booking.id, 'confirmed')}
                            isLoading={updateBookingMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            <Check className="w-4 h-4" />
                          </LoadingButton>
                        )}
                        {canCancelBooking(booking.date) ? (
                          <LoadingButton
                            onClick={() => handleBookingAction(booking.id, 'cancelled')}
                            isLoading={updateBookingMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            <X className="w-4 h-4" />
                          </LoadingButton>
                        ) : (
                          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs">Cannot cancel (less than 24h)</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : orders && orders.length > 0 ? (
              orders.map((order) => (
                <div 
                  key={order.id} 
                  id={`order-${order.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Order Total: ${order.totalPrice.toFixed(2)}
                      </h3>
                      
                      <div className="space-y-2 mb-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {item.quantity}x {item.name} - ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{order.customer.name}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </div>
                        {order.notes && (
                          <div className="flex items-start gap-2 md:col-span-2">
                            <MessageSquare className="w-4 h-4 mt-0.5" />
                            <span>{order.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {order.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <LoadingButton
                          onClick={() => handleOrderAction(order.id, 'confirmed')}
                          isLoading={updateOrderMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          <Check className="w-4 h-4" />
                        </LoadingButton>
                        <LoadingButton
                          onClick={() => handleOrderAction(order.id, 'cancelled')}
                          isLoading={updateOrderMutation.isPending}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          <X className="w-4 h-4" />
                        </LoadingButton>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}