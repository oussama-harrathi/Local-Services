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

export default function NotificationIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  // Fetch notifications
  const { data: notificationData, refetch } = useQuery<NotificationResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications?limit=10&type=customer');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notificationData?.unreadCount || 0;

  // Don't render if user is not logged in
  if (!session?.user?.id) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
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