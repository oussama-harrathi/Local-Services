'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
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

export default function ProviderNotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  // Fetch notifications for provider
  const { data: notificationData, refetch, error, isLoading } = useQuery<NotificationResponse>({
    queryKey: ['provider-notifications'],
    queryFn: async () => {
      console.log('🔔 Fetching provider notifications...');
      console.log('Session user:', session?.user);
      
      const response = await fetch('/api/notifications?limit=10&type=provider', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Notification data received:', data);
      return data;
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, but not for auth errors
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
    console.log('🔔 ProviderNotificationButton state:');
    console.log('- Session:', !!session?.user?.id);
    console.log('- Loading:', isLoading);
    console.log('- Error:', error);
    console.log('- Notification data:', notificationData);
    console.log('- Unread count:', unreadCount);
  }, [session, isLoading, error, notificationData, unreadCount]);

  // Don't render if user is not logged in
  if (!session?.user?.id) {
    console.log('🔔 Not rendering - no session');
    return null;
  }

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