"use client"

import { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Notification, notificationTypeStyles, notificationTypeIcons } from '@/types/notification';
import { getLatestNotifications, markNotificationAsRead } from '@/app/actions/notifications';
import { useAuth } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import React from 'react';

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

  if (!isLoaded) {
    return (
      <div className="relative p-2">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!userId) return null;

  console.log({ notifications })

  // Show only the latest 3 notifications
  const latestNotifications = notifications.slice(0, 3);
  const unreadCount = notifications.filter(notification => !notification.read).length;
  const displayCount = unreadCount > 9 ? '9+' : unreadCount;

  return (
    <Popover>
      <PopoverTrigger>
        <button className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5">
              {displayCount}
            </Badge>
          )}
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
            latestNotifications.map((notification) => {
              const Icon = notificationTypeIcons[notification.type];
              const style = notificationTypeStyles[notification.type];
              const isUnread = !notification.read;
              const hasLink = !!notification.link;

              return (
                <div
                  key={notification.id}
                  className={`w-full px-4 py-3 ${isUnread ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50 transition`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 mt-1 text-gray-500" />
                    <div className="flex-1 text-sm">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-semibold rounded px-1.5 py-0.5 ${style}`}>
                          {notification.title}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                        </span>
                      </div>
                      <div
                        className="mt-1 text-gray-700 text-sm"
                        dangerouslySetInnerHTML={{ __html: notification.message }}
                      />
                      <div className="mt-2 flex gap-2 justify-end">
                        {isUnread && (
                          <button
                            onClick={async () => await markNotificationAsRead(notification.id)}
                            className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 cursor-pointer"
                          >
                            Mark as Read
                          </button>
                        )}
                        {hasLink && (
                          <button
                            onClick={async () => {
                              if (isUnread) await markNotificationAsRead(notification.id);
                              router.push(notification.link!);
                            }}
                            className="text-xs text-blue-600 hover:text-white px-2 py-1 rounded bg-blue-50 hover:bg-blue-600 border border-blue-200 cursor-pointer"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
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