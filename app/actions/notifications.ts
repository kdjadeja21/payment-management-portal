import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  Timestamp,
  startAfter,
} from "firebase/firestore";
import {
  Notification,
  NotificationType,
  NotificationTitle,
} from "@/types/notification";
import { useAuth } from "@clerk/nextjs";

export const createNotification = async (
  userId: string,
  type: NotificationType,
  message: string,
  link: string | null = null
) => {
  if (!userId) throw new Error("User not authenticated");

  // Convert NotificationType to NotificationTitle key
  const titleKey = type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("") as keyof typeof NotificationTitle;

  const notification: Omit<Notification, "id"> = {
    userId,
    title: NotificationTitle[titleKey],
    message,
    type,
    link,
    read: false,
    createdAt: Timestamp.now(),
  };

  return await addDoc(collection(db, "notifications"), notification);
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, "notifications", notificationId);
  await updateDoc(notificationRef, { read: true });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  if (!userId) throw new Error("User not authenticated");

  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    where("read", "==", false)
  );
  const snapshot = await getDocs(q);

  const batch = snapshot.docs.map((doc) => updateDoc(doc.ref, { read: true }));

  await Promise.all(batch);

  return { success: true, message: "All notifications marked as read." }; // Return success message
};

export const getUnreadNotificationsCount = (
  callback: (count: number) => void
) => {
  const { userId } = useAuth();
  if (!userId) return () => {};

  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    where("read", "==", false)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
};

export const getLatestNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  if (!userId) return () => {};

  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
    callback(notifications);
  });
};

export const getPaginatedNotifications = async (
  userId: string,
  lastDoc: any = null,
  pageSize: number = 10
) => {
  if (!userId) return { notifications: [], lastDoc: null };

  const notificationsRef = collection(db, "notifications");
  let q = query(
    notificationsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  if (lastDoc) {
    q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);
  const notifications = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Notification[];

  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return {
    notifications,
    lastDoc: lastVisible,
  };
};
