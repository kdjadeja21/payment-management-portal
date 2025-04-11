"use client"

import { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Notification, notificationTypeStyles } from '@/types/notification';
import { getLatestNotifications, markNotificationAsRead } from '@/lib/notifications';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Importing shadcn Popover
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'; // Importing shadcn components

export function NotificationDropdown() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!isLoaded || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = getLatestNotifications(userId, (notifications) => {
      if (isMounted) {
        setNotifications(notifications);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isLoaded, userId]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  if (!isLoaded) {
    return (
      <div className="relative p-2">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!userId) return null;

  return (
    <Popover>
      <PopoverTrigger>
        <button className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer">
          <Bell className="h-6 w-6" />
          <Badge className="absolute -top-1.5 -right-1.5">21</Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="z-50 mt-2 w-[90vw] max-w-sm rounded-md bg-white shadow-lg sm:w-96"
      >
        <div className="py-1">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-700">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} className={`mb-2 ${!notification.read ? 'bg-gray-50' : ''}`}>
                <CardHeader>
                  <div className={`mb-1 rounded px-2 py-1 text-xs ${notificationTypeStyles[notification.type]}`}>
                    {notification.title}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{notification.message}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                  </p>
                </CardContent>
                <CardFooter>
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="block w-full text-left text-sm hover:bg-gray-100"
                  >
                    View
                  </button>
                </CardFooter>
              </Card>
            ))
          )}
          <div className="border-t border-gray-100">
            <a
              href="/notifications"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              View all notifications
            </a>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 