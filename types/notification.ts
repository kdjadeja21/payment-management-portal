import { Timestamp } from "firebase/firestore";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  FileText,
  Receipt,
  TrendingUp,
} from "lucide-react";

export enum NotificationType {
  InvoiceDue = "invoice_due",
  InvoiceOverdue = "invoice_overdue",
  MultipleInvoiceDue = "multiple_invoice_due",
  MultipleInvoiceOverdue = "multiple_invoice_overdue",
  PaymentReceived = "payment_received",
  InvoiceCreated = "invoice_created",
  InvoiceUpdated = "invoice_updated",
  WeeklySummary = "weekly_summary",
}

export enum NotificationTitle {
  InvoiceDue = "Invoice Due",
  InvoiceOverdue = "Invoice Overdue",
  MultipleInvoiceDue = "Multiple Invoices Due",
  MultipleInvoiceOverdue = "Multiple Invoices Overdue",
  PaymentReceived = "Payment Received",
  InvoiceCreated = "New Invoice Created",
  InvoiceUpdated = "Invoice Updated",
  WeeklySummary = "Weekly Summary Report",
}

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
  [NotificationType.InvoiceDue]: "bg-yellow-100 text-yellow-800",
  [NotificationType.InvoiceOverdue]: "bg-red-100 text-red-800",
  [NotificationType.MultipleInvoiceDue]: "bg-yellow-100 text-yellow-800",
  [NotificationType.MultipleInvoiceOverdue]: "bg-red-100 text-red-800",
  [NotificationType.PaymentReceived]: "bg-green-100 text-green-800",
  [NotificationType.InvoiceCreated]: "bg-blue-100 text-blue-800",
  [NotificationType.InvoiceUpdated]: "bg-blue-100 text-blue-800",
  [NotificationType.WeeklySummary]: "bg-purple-100 text-purple-800",
};

export const notificationTypeIcons: Record<
  NotificationType,
  React.ComponentType<{ className?: string }>
> = {
  [NotificationType.InvoiceDue]: Calendar,
  [NotificationType.InvoiceOverdue]: AlertCircle,
  [NotificationType.MultipleInvoiceDue]: Calendar,
  [NotificationType.MultipleInvoiceOverdue]: AlertCircle,
  [NotificationType.PaymentReceived]: CheckCircle2,
  [NotificationType.InvoiceCreated]: FileText,
  [NotificationType.InvoiceUpdated]: Receipt,
  [NotificationType.WeeklySummary]: TrendingUp,
};
