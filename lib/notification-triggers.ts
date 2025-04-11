import { createNotification } from './notifications';
import { NotificationType } from '@/types/notification';

export async function triggerInvoiceDueNotification(invoiceId: string, invoiceNumber: string) {
  await createNotification(
    'Invoice Due',
    `Invoice #${invoiceNumber} is due today`,
    'invoice_due',
    `/invoices/${invoiceId}`
  );
}

export async function triggerInvoiceOverdueNotification(invoiceId: string, invoiceNumber: string) {
  await createNotification(
    'Invoice Overdue',
    `Invoice #${invoiceNumber} is overdue`,
    'invoice_overdue',
    `/invoices/${invoiceId}`
  );
}

export async function triggerPaymentReceivedNotification(invoiceId: string, invoiceNumber: string, amount: number) {
  await createNotification(
    'Payment Received',
    `Payment of $${amount} received for Invoice #${invoiceNumber}`,
    'payment_received',
    `/invoices/${invoiceId}`
  );
}

export async function triggerInvoiceCreatedNotification(invoiceId: string, invoiceNumber: string) {
  await createNotification(
    'New Invoice',
    `Invoice #${invoiceNumber} has been created`,
    'invoice_created',
    `/invoices/${invoiceId}`
  );
}

export async function triggerInvoiceUpdatedNotification(invoiceId: string, invoiceNumber: string) {
  await createNotification(
    'Invoice Updated',
    `Invoice #${invoiceNumber} has been updated`,
    'invoice_updated',
    `/invoices/${invoiceId}`
  );
}

export async function triggerWeeklySummaryNotification(totalDue: number, overdueCount: number) {
  await createNotification(
    'Weekly Summary',
    `You have $${totalDue} in total due payments and ${overdueCount} overdue invoices`,
    'weekly_summary',
    '/invoices'
  );
} 