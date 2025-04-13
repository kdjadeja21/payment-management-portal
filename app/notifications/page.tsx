'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Notification, notificationTypeStyles, notificationTypeIcons } from '@/types/notification';
import { getPaginatedNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/app/actions/notifications';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '@/app/components/dashboard-layout';
import React from 'react';
import Link from 'next/link'; // Import Link from next/link
import { toast } from 'sonner';

// Skeleton component for notifications
function NotificationSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 rounded px-2 py-1 text-xs inline-block bg-gray-200 animate-pulse"></div>
      <p className="text-gray-300 animate-pulse h-4 w-3/4 mb-1"></p>
      <p className="text-gray-300 animate-pulse h-3 w-1/2"></p>
    </div>
  );
}

function NotificationsContent() {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = async (doc: any = null) => {
    setLoading(true);
    const { notifications: newNotifications, lastDoc: newLastDoc } = await getPaginatedNotifications(doc ? doc.id : userId); // Use doc.id instead of the whole doc object
    setNotifications(doc ? [...notifications, ...newNotifications] : newNotifications);
    setLastDoc(newLastDoc);
    setHasMore(newNotifications.length === 10);
    setLoading(false);
  };

  useEffect(() => {
    if (!userId) return;
    loadNotifications();
  }, [userId]);

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;

    setLoadingMore(true);
    await loadNotifications(lastDoc); // Pass lastDoc directly
    setLoadingMore(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    const success = await markAllNotificationsAsRead(userId);
    if (success) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read!'); // Show success toast
      loadNotifications();
    }
  };

  if (!userId) return null;

  // New variable to check if there are notifications or unread notifications
  const hasNotifications = notifications.length > 0;

  // Group notifications by date
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = notification.createdAt.toDate();
    let label;

    if (isToday(date)) {
      label = "Today";
    } else if (isYesterday(date)) {
      label = "Yesterday";
    } else if (isThisWeek(date)) {
      label = format(date, 'EEEE'); // Day name
    } else {
      label = format(date, 'MMMM d, yyyy'); // Full date
    }

    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <div className="container mx-auto px-4 py-8 bg-white rounded-2xl"> {/* Set background color for the whole page */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button className='cursor-pointer' disabled={!hasNotifications} onClick={handleMarkAllAsRead} variant="outline">
          Mark all as read
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No notifications yet</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedNotifications).map(([dateLabel, notifications]) => (
            <div key={dateLabel}>
              <h2 className="font-semibold text-md mt-4">{dateLabel}</h2>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg border my-4 p-4 transition-shadow duration-200 shadow-sm hover:shadow-lg ${!notification.read ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {React.createElement(notificationTypeIcons[notification.type], { className: 'h-5 w-5 text-gray-600' })}
                        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${notificationTypeStyles[notification.type]}`}>
                          {notification.title}
                        </div>
                      </div>
                      <p className="text-gray-800" dangerouslySetInnerHTML={{ __html: notification.message }} />
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      {!notification.read && (
                        <Button
                          className='cursor-pointer'
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      {notification.link && (
                        <Link href={notification.link as string} onClick={() => handleMarkAsRead(notification.id)}> {/* Use Link component for navigation */}
                          <Button
                            variant="link"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border cursor-pointer"
                          >
                            View
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<NotificationSkeleton />}>
        <NotificationsContent />
      </Suspense>
    </DashboardLayout>
  )
}