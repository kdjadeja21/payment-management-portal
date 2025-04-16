"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Notification,
  notificationTypeStyles,
  notificationTypeIcons,
} from "@/types/notification";
import {
  getPaginatedNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/app/actions/notifications";
import {
  formatDistanceToNow,
  format,
  isToday,
  isYesterday,
  isThisWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/app/components/dashboard-layout";
import React from "react";
import Link from "next/link"; // Import Link from next/link
import { toast } from "sonner";

// Skeleton component for notifications
function NotificationSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3 w-full">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-full" />
      </div>
      <div className="space-y-2 w-full">
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="flex justify-between items-center w-full">
        <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadNotifications = async (doc: any = null) => {
    if (loadingMore || !userId) return;

    setLoading(doc ? false : true);
    setLoadingMore(doc ? true : false);

    try {
      const { notifications: newNotifications, lastDoc: newLastDoc } =
        await getPaginatedNotifications(userId, doc, 10);

      setNotifications((prev) =>
        doc ? [...prev, ...newNotifications] : newNotifications
      );
      setLastDoc(newLastDoc);
      setHasMore(newNotifications.length === 10);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reset notifications when userId changes
  useEffect(() => {
    setNotifications([]);
    setLastDoc(null);
    setHasMore(true);
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  useEffect(() => {
    if (!observerTarget.current || !hasMore || !userId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && lastDoc) {
          loadNotifications(lastDoc);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, lastDoc, userId]);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    const success = await markAllNotificationsAsRead(userId);
    if (success) {
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read!"); // Show success toast
      loadNotifications();
    }
  };

  if (!userId) return null;

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
      label = format(date, "EEEE"); // Day name
    } else {
      label = format(date, "MMMM d, yyyy"); // Full date
    }

    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  return (
    <div className="container mx-auto px-4 py-8 bg-white rounded-2xl relative">
      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg z-50 bg-blue-600 hover:bg-blue-700 text-white text-2xl transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl animate-fade-in cursor-pointer"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          ↑
        </Button>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button
          className="cursor-pointer"
          disabled={!hasNotifications}
          onClick={handleMarkAllAsRead}
          variant="outline"
        >
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
        <div className="text-center py-8 text-gray-500">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedNotifications).map(
            ([dateLabel, notifications]) => (
              <div key={dateLabel}>
                <h2 className="font-semibold text-md mt-4">{dateLabel}</h2>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-lg border my-4 p-4 transition-shadow duration-200 shadow-sm hover:shadow-lg ${
                      !notification.read ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {React.createElement(
                            notificationTypeIcons[notification.type],
                            { className: "h-5 w-5 text-gray-600" }
                          )}
                          <div
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              notificationTypeStyles[notification.type]
                            }`}
                          >
                            {notification.title}
                          </div>
                        </div>
                        <p
                          className="text-gray-800"
                          dangerouslySetInnerHTML={{
                            __html: notification.message,
                          }}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDistanceToNow(
                            notification.createdAt.toDate(),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        {!notification.read && (
                          <Button
                            className="cursor-pointer"
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        {notification.link && (
                          <Link
                            href={notification.link as string}
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
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
            )
          )}

          {hasMore && (
            <div ref={observerTarget} className="flex justify-center py-4">
              {loadingMore && (
                <div className="space-y-4 w-full">
                  <NotificationSkeleton />
                  <NotificationSkeleton />
                </div>
              )}
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
  );
}
