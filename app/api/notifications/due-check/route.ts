import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust path as needed
import { differenceInCalendarDays, isToday } from "date-fns";
import { NotificationType, NotificationTitle } from "@/types/notification"; // Import NotificationType and NotificationTitle

export const dynamic = "force-dynamic";

// Create sample notifications with specific messages and dates
async function generateSampleNotifications(count = 5) {
  const notifications = [];

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i); // Subtract i days for each notification

    const notification = {
      id: `notif_${i + 1}`,
      message: `Sample notification message for notification ${i + 1}`,
      createdAt: Timestamp.fromDate(date),
    };

    notifications.push(notification);

    // Add each notification to Firestore
    await addDoc(collection(db, "notifications"), {
      userId: "user_", // Replace with actual user ID as needed
      type: NotificationType.InvoiceDue, // Replace with appropriate type
      title: NotificationTitle.InvoiceDue, // Use NotificationTitle enum
      message: notification.message,
      createdAt: notification.createdAt,
      read: false,
      link: "", // Add a link if necessary
    });
  }

  return notifications;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    // await generateSampleNotifications(10);

    const today = new Date();
    const notifiedRetailerIds: string[] = [];
    const retailerInvoices: {
      [key: string]: {
        due: number;
        overdue: number;
        retailerName: string;
        invoices: Array<{
          id: string;
          dueDate: Date;
          invoiceNumber: string;
          userId: string;
          invoiceName: string;
        }>;
      };
    } = {};

    // 📌 Step 1: Query all unpaid invoices
    const invoiceQuery = query(
      collection(db, "invoices"),
      where("status", "!=", "paid")
    );

    const snapshot = await getDocs(invoiceQuery);

    // First pass: Group invoices by retailer
    for (const doc of snapshot.docs) {
      const invoice = doc.data();
      const retailerId = invoice.retailerId;
      const dueDate = invoice.dueDate?.toDate?.() || new Date(invoice.dueDate);

      if (!retailerInvoices[retailerId]) {
        retailerInvoices[retailerId] = {
          due: 0,
          overdue: 0,
          retailerName: invoice.retailerName,
          invoices: [],
        };
      }

      retailerInvoices[retailerId].invoices.push({
        id: doc.id,
        dueDate,
        invoiceNumber: invoice.invoiceNumber,
        userId: invoice.userId,
        invoiceName: invoice.invoiceName, // Added invoice name
      });

      if (isToday(dueDate)) {
        retailerInvoices[retailerId].due++;
      } else if (dueDate < today) {
        retailerInvoices[retailerId].overdue++;
      }
    }

    // Second pass: Create notifications
    for (const [retailerId, data] of Object.entries(retailerInvoices)) {
      if (notifiedRetailerIds.includes(retailerId)) continue;

      // Logic for a single invoice
      if (data.invoices.length === 1) {
        const invoice = data.invoices[0];
        let type: NotificationType | null = null;

        if (isToday(invoice.dueDate)) {
          type = NotificationType.InvoiceDue;
          const message = `Your invoice <strong>${invoice.invoiceName}</strong> from <strong>${data.retailerName}</strong> is due today.`;
          await addDoc(collection(db, "notifications"), {
            userId: invoice.userId,
            invoiceId: invoice.id,
            type,
            title: NotificationTitle.InvoiceDue, // Use NotificationTitle enum
            message,
            createdAt: serverTimestamp(),
            read: false,
            link: `payment-management/invoices/${invoice.id}`,
          });
        } else if (invoice.dueDate < today) {
          type = NotificationType.InvoiceOverdue;
          const message = `Your invoice <strong>${
            invoice.invoiceName
          }</strong> from <strong>${
            data.retailerName
          }</strong> is past due by <strong>${differenceInCalendarDays(
            today,
            invoice.dueDate
          )} day(s)</strong>.`;
          await addDoc(collection(db, "notifications"), {
            userId: invoice.userId,
            invoiceId: invoice.id,
            type,
            title: NotificationTitle.InvoiceOverdue, // Use NotificationTitle enum
            message,
            createdAt: serverTimestamp(),
            read: false,
            link: `payment-management/invoices/${invoice.id}`,
          });
        }
      }
      // Logic for multiple invoices
      else {
        let type: NotificationType | null = null;
        let message = "";
        let title = "";

        const hasDueToday = data.due > 0;
        const hasOverdue = data.overdue > 0;

        if (hasDueToday && hasOverdue) {
          type = NotificationType.MultipleInvoiceOverdue;
          title = NotificationTitle.MultipleInvoiceOverdue;
          message = `<strong>${data.retailerName}</strong> has <strong>${data.due}</strong> invoice(s) due today and <strong>${data.overdue}</strong> overdue invoice(s).`;
        } else if (hasDueToday) {
          type = NotificationType.MultipleInvoiceDue;
          title = NotificationTitle.MultipleInvoiceDue;
          message = `You have <strong>${data.due}</strong> invoice(s) from <strong>${data.retailerName}</strong> due today.`;
        } else if (hasOverdue) {
          type = NotificationType.MultipleInvoiceOverdue;
          title = NotificationTitle.MultipleInvoiceOverdue;
          message = `You have <strong>${data.overdue}</strong> invoice(s) from <strong>${data.retailerName}</strong> that are overdue.`;
        }

        if (type) {
          await addDoc(collection(db, "notifications"), {
            userId: data.invoices[0].userId,
            retailerId,
            type,
            title,
            message,
            createdAt: serverTimestamp(),
            read: false,
            link: `payment-management/retailers/${retailerId}`,
          });
        }
      }

      notifiedRetailerIds.push(retailerId);
    }

    return NextResponse.json({
      success: true,
      message: `${notifiedRetailerIds.length} notifications created successfully.`,
    });
  } catch (error) {
    console.error("Error creating notifications:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
