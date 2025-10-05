'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import NotificationDropdown from './NotificationDropdown';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata?: string;
  readAt: string | null;
  createdAt: string;
}

interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
}

export default function ProviderNotificationButtonFixed() {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications directly without session dependency
  const { data: notificationData, refetch, error, isLoading } = useQuery<NotificationResponse>({
    queryKey: ['provider-notifications-fixed'],
    queryFn: async () => {
      console.log('🔔 Fetching provider notifications (fixed version)...');
      
      // Try to get the session token from cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const sessionToken = cookies['next-auth.session-token'];
      console.log('Session token found:', !!sessionToken);

      const response = await fetch('/api/notifications?limit=10&type=provider', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken && { 'Cookie': `next-auth.session-token=${sessionToken}` })
        },
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        
        // If unauthorized, return empty data instead of throwing
        if (response.status === 401) {
          console.log('🔒 Unauthorized - returning empty notifications');
          return {
            notifications: [],
            unreadCount: 0,
            hasMore: false
          };
        }
        
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Notification data received:', data);
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const unreadCount = notificationData?.unreadCount || 0;

  // Debug logging
  useEffect(() => {
    console.log('🔔 ProviderNotificationButtonFixed state:');
    console.log('- Loading:', isLoading);
    console.log('- Error:', error);
    console.log('- Notification data:', notificationData);
    console.log('- Unread count:', unreadCount);
  }, [isLoading, error, notificationData, unreadCount]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Provider Notifications"
      >
        <Bell className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">Notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {isLoading && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notificationData?.notifications || []}
          unreadCount={unreadCount}
          onClose={() => setIsOpen(false)}
          onRefresh={refetch}
        />
      )}
    </div>
  );
}