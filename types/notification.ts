import { Timestamp } from 'firebase/firestore';

export type NotificationType = 
  | 'invoice_due'
  | 'invoice_overdue'
  | 'payment_received'
  | 'invoice_created'
  | 'invoice_updated'
  | 'weekly_summary';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link: string | null;
  read: boolean;
  createdAt: Timestamp;
}

export const notificationTypeStyles: Record<NotificationType, string> = {
  invoice_due: 'bg-yellow-100 text-yellow-800',
  invoice_overdue: 'bg-red-100 text-red-800',
  payment_received: 'bg-green-100 text-green-800',
  invoice_created: 'bg-blue-100 text-blue-800',
  invoice_updated: 'bg-blue-100 text-blue-800',
  weekly_summary: 'bg-purple-100 text-purple-800',
}; 