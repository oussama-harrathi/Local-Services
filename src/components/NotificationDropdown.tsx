'use client';

import { useState } from 'react';
import { Calendar, ShoppingCart, Clock, CheckCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata?: string;
  readAt: string | null;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onClose: () => void;
  onRefresh: () => void;
}

export default function NotificationDropdown({
  notifications,
  unreadCount,
  onClose,
  onRefresh,
}: NotificationDropdownProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (!response.ok) throw new Error('Failed to mark as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmation':
      case 'booking_reminder_24h':
      case 'booking_reminder_2h':
      case 'booking_update':
      case 'new_appointment_request':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'order_update':
      case 'new_order_request':
        return <ShoppingCart className="w-4 h-4 text-green-500" />;
      case 'review_request':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRedirectPath = (notification: Notification) => {
    const { type, metadata } = notification;
    
    // Parse metadata if it exists
    let parsedMetadata = null;
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (error) {
        console.error('Failed to parse notification metadata:', error);
      }
    }

    switch (type) {
      case 'booking_confirmation':
      case 'booking_reminder_24h':
      case 'booking_reminder_2h':
      case 'booking_update':
        return parsedMetadata?.bookingId 
          ? `/bookings/${parsedMetadata.bookingId}` 
          : '/dashboard';
      
      case 'new_appointment_request':
      case 'new_order_request':
      case 'provider': // Handle generic provider notifications
        const providerPath = '/dashboard/provider';
        // Add scroll target for specific booking/order
        let scrollTarget = '';
        if (parsedMetadata?.bookingId) {
          scrollTarget = `#booking-${parsedMetadata.bookingId}`;
        } else if (parsedMetadata?.orderId) {
          scrollTarget = `#order-${parsedMetadata.orderId}`;
        }
        
        return providerPath + scrollTarget;
      
      case 'order_update':
        return parsedMetadata?.orderId 
          ? `/orders/${parsedMetadata.orderId}` 
          : '/dashboard';
      
      case 'review_request':
        return parsedMetadata?.providerId 
          ? `/provider/${parsedMetadata.providerId}` 
          : '/dashboard';
      
      default:
        return '/dashboard';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    console.log('🔔 Notification clicked:', notification);
    console.log('🔔 Notification ID:', notification.id);
    console.log('🔔 Notification type:', notification.type);
    
    // Mark as read
    console.log('🔔 Marking notification as read...');
    await markAsReadMutation.mutateAsync(notification.id);
    console.log('🔔 Notification marked as read');
    
    // Get redirect path
    const path = getRedirectPath(notification);
    console.log('🔔 Redirect path:', path);
    
    // Close dropdown
    onClose();
    
    // Handle navigation with scroll target
    if (path.includes('#')) {
      const [basePath, hashWithQuery] = path.split('#');
      // Extract just the element ID, removing any query parameters
      const elementId = hashWithQuery.split('?')[0];
      console.log('🔔 Base path:', basePath, 'Hash with query:', hashWithQuery, 'Element ID:', elementId);
      
      // Check if we're already on the target page
      if (window.location.pathname === basePath) {
        // We're already on the page, just scroll to the element
        const element = document.getElementById(elementId);
        if (element) {
          console.log('🔔 Scrolling to element (same page):', elementId);
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Add a highlight effect
          element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
          setTimeout(() => {
            element.style.boxShadow = '';
          }, 3000);
        } else {
          console.log('🔔 Element not found:', elementId);
        }
      } else {
        // Navigate to the page first, then scroll
        await router.push(basePath);
        
        // Wait a bit for the page to load, then scroll to the element
        setTimeout(() => {
          const element = document.getElementById(elementId);
          if (element) {
            console.log('🔔 Scrolling to element (after navigation):', elementId);
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            // Add a highlight effect
            element.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
            setTimeout(() => {
              element.style.boxShadow = '';
            }, 3000);
          } else {
            console.log('🔔 Element not found:', elementId);
          }
        }, 500);
      }
    } else {
      // Regular navigation
      console.log('🔔 Regular navigation to:', path);
      router.push(path);
    }
    
    console.log('🔔 Router.push called successfully');
  };



  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notification.readAt ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        !notification.readAt ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.readAt && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                router.push('/dashboard/notifications');
                onClose();
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
}