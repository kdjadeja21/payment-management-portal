"use client";
const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  EditIcon,
  EyeIcon,
  Plus,
  Trash2,
  Share2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { getRetailers } from "@/app/actions/retailers";
import { getInvoices } from "@/app/actions/invoices";
import { getPayments } from "@/app/actions/payments";
import { formatCurrency, formatDate, numberToIndianWords } from "@/lib/utils";
import { StatusBadge } from "@/app/components/status-badge";
import { RetailerForm } from "@/app/components/retailer-form";
import { InvoiceForm } from "@/app/components/invoice-form";
import { PaymentForm } from "@/app/components/payment-form";
import DashboardLayout from "@/app/components/dashboard-layout";
import { Retailer, Invoice, Payment } from "@/types";
import { deleteRetailer } from "@/app/actions/retailers";
import { ConfirmationDialog } from "@/app/components/confirmation-dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useUser } from "@clerk/nextjs";

type JsPDFWithAutoTable = jsPDF & {
  autoTable: (options: any) => jsPDF;
  internal: {
    getNumberOfPages: () => number;
    pageSize: {
      height: number;
    };
  };
};

function RetailerContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [retailer, setRetailer] = useState<Retailer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [retailersData, invoicesData, paymentsData] = await Promise.all([
        getRetailers(),
        getInvoices({ retailerId: id as string }),
        getPayments({ retailerId: id as string }),
      ]);
      setRetailers(retailersData);
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setLoading(false);

      const foundRetailer = retailersData.find((r) => r.id === id);

      if (!foundRetailer) {
        notFound();
      } else {
        setRetailer(foundRetailer);
      }
    }

    fetchData();
  }, [id]);

  const refreshData = async () => {
    const [retailersData, invoicesData, paymentsData] = await Promise.all([
      getRetailers(),
      getInvoices({ retailerId: id as string }),
      getPayments({ retailerId: id as string }),
    ]);
    setRetailers(retailersData);
    setInvoices(invoicesData);
    setPayments(paymentsData);

    const foundRetailer = retailersData.find((r) => r.id === id);

    if (!foundRetailer) {
      notFound();
    } else {
      setRetailer(foundRetailer);
    }
  };

  const handleRetailerSuccess = () => {
    refreshData();
  };

  const handleInvoiceSuccess = () => {
    refreshData();
  };

  const handlePaymentSuccess = () => {
    refreshData();
  };

  // Calculate stats
  const totalInvoiced = invoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  );
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutstanding = invoices
    .filter(
      (invoice) => invoice.status === "due" || invoice.status === "overdue"
    )
    .reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  const totalOverdue = invoices
    .filter((invoice) => invoice.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.remainingAmount, 0);

  const sortedInvoices = [...invoices].sort(
    (a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime()
  );
  const sortedPayments = [...payments].sort(
    (a, b) => b.paymentDate.getTime() - a.paymentDate.getTime()
  );

  const generatePDFReport = () => {
    const doc = new jsPDF() as any;
    const today = new Date();
    const formattedDate = formatDate(today);

    // Add logo placeholder (replace with actual image if available)
    // doc.addImage('logo.png', 'PNG', 15, 10, 20, 20); // Uncomment to use an actual logo

    // Professional Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24); // Increased font size for better visibility
    doc.setTextColor(40, 40, 40);
    doc.text("Retailer Invoice Summary", 105, 20, { align: "center" });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(15, 25, 195, 25); // underline header

    // Retailer info
    const retailerName = retailer?.name
      ? retailer.name.charAt(0).toUpperCase() + retailer.name.slice(1)
      : "N/A";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(15); // Increased font size for retailer name
    doc.setTextColor(60, 60, 60);
    doc.text(`Retailer:`, 20, 40); // Adjusted Y position for better spacing
    doc.setFont("helvetica", "bold");
    doc.text(retailerName, 45, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13); // Slightly smaller font for report date
    doc.text(`Report Date:`, 130, 40); // Adjusted Y position for better spacing
    doc.setFont("helvetica", "bold");
    doc.text(formattedDate, 165, 40);

    // Total due amount
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16); // Increased font size for total due amount
    doc.setTextColor(20, 20, 20);
    const totalDueText = `Total Due: ${totalOutstanding.toFixed(2)}`; // Added currency symbol
    const totalDueWidth = doc.getTextWidth(totalDueText);
    doc.text(totalDueText, 20, 55); // Adjusted Y position for better spacing
    doc.setDrawColor(100, 100, 255);
    doc.setLineWidth(0.7);
    doc.line(20, 57, 20 + totalDueWidth, 57);

    // Table Data
    const tableData = sortedInvoices.map((invoice) => {
      const invoiceDate = new Date(invoice.invoiceDate);
      const dueDate = new Date(invoice.dueDate);
      const overdueDays = Math.max(
        0,
        Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24))
      );
      return [
        invoice.invoiceName || "",
        formatDate(invoiceDate),
        formatDate(dueDate),
        `${invoice.amount.toFixed(2)}`, // Added currency symbol
        invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1),
        invoice.remainingAmount
          ? `${invoice.remainingAmount.toFixed(2)}` // Added currency symbol
          : "N/A",
        invoice.status === "paid"
          ? "-"
          : overdueDays > 0
          ? `${overdueDays} days overdue`
          : "On time",
      ];
    });

    // Table Styling
    autoTable(doc, {
      startY: 65, // Adjusted start position for better spacing
      head: [
        [
          "Invoice ID",
          "Invoice Date",
          "Due Date",
          "Amount",
          "Status",
          "Remaining Amount",
          "Overdue",
        ],
      ],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        3: { halign: "right" }, // Amount column
      },
      didParseCell: function (data: any) {
        if (data.section === "body") {
          const cell = data.row.cells[4]; // Status column
          const status = Array.isArray(cell.text)
            ? cell.text[0]?.toLowerCase()
            : String(cell.text).toLowerCase();

          if (status === "unpaid" || status === "partial") {
            data.cell.styles.fillColor = [255, 230, 230]; // Soft red
          }

          const dueDate = new Date(data.row.raw[2]);
          if (
            dueDate < today &&
            (status === "unpaid" || status === "partial")
          ) {
            data.cell.styles.fillColor = [255, 210, 210]; // More red if overdue
          }
        }
      },
    });

    // Footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Save file with professional naming
    const filename = `Retailer_Report_${
      retailer?.name?.replace(/\s+/g, "_") || "Unknown"
    }_${formattedDate}.pdf`;
    doc.save(filename);
  };

  const { user } = useUser();

  const generateReceiptPDF = (payment: Payment) => {
    const doc = new jsPDF() as JsPDFWithAutoTable;
    const primaryColor = "#2C3E50"; // Blue
    const secondaryColor = "#64748b"; // Slate
    const textColor = "#1e293b"; // Slate dark
    const successColor = "#006D77"; // Green

    // Calculate outstanding amount
    const outstandingAmount = invoices
      .filter(
        (invoice) => invoice.status === "due" || invoice.status === "overdue"
      )
      .reduce((sum, invoice) => sum + invoice.remainingAmount, 0);

    // Title Section with colored header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    doc.setTextColor("#ffffff");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Payment Receipt", 105, 25, { align: "center" });

    // Main Content
    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const startY = 60;
    const col1 = 20;
    const col2 = 100;

    // Payment Details
    doc.setFont("helvetica", "bold");
    doc.text("Payment Details", col1, startY);
    doc.setLineWidth(0.5);
    doc.setDrawColor(primaryColor);
    doc.line(col1, startY + 2, 190, startY + 2);

    // Info grid
    doc.setFont("helvetica", "bold");
    doc.text("Payment ID:", col1, startY + 20);
    doc.text("Date:", col1, startY + 35);
    doc.text("Received From:", col1, startY + 50);
    doc.text("Amount Received:", col1, startY + 65);
    doc.text("Outstanding:", col1, startY + 80);

    doc.setFont("helvetica", "normal");
    doc.text(`# ${payment.id}`, col2, startY + 20);
    doc.text(formatDate(payment.paymentDate), col2, startY + 35);
    doc.text(retailer?.name || "Unknown", col2, startY + 50);

    // Helper function to split text into lines based on available width
    const splitTextIntoLines = (text: string, maxWidth: number): string[] => {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (doc.getTextWidth(testLine) <= maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    // Function to draw wrapped text
    const drawWrappedText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number
    ): number => {
      const lines = splitTextIntoLines(text, maxWidth);
      let currentY = y;
      const lineHeight = 12; // Adjust line height as needed

      lines.forEach((line, index) => {
        doc.text(line, x, currentY);
        currentY += lineHeight;
      });

      return currentY; // Return the Y position after drawing all lines
    };

    // Amount Received section
    const amountReceivedText = `INR ${payment.amount}`;
    doc.setTextColor(successColor);
    doc.text(amountReceivedText, col2, startY + 65);

    // Calculate position for amount in words
    const amountWidth = doc.getTextWidth(amountReceivedText);
    const amountInWords = `( ${numberToIndianWords(payment.amount)})`;

    doc.setFontSize(10);

    // Draw amount in words with wrapping if needed
    const maxWordsWidth = 90; // Adjust based on your needs
    const amountWordsX = col2 + amountWidth + 5;
    drawWrappedText(amountInWords, amountWordsX, startY + 65, maxWordsWidth);

    // Outstanding amount section
    const outstandingText = `INR ${outstandingAmount}`;
    doc.setTextColor(textColor);
    doc.setFontSize(12);
    doc.text(outstandingText, col2, startY + 80);

    // Calculate position for outstanding in words
    const outstandingWidth = doc.getTextWidth(outstandingText);
    const outstandingInWords = `( ${numberToIndianWords(outstandingAmount)})`;
    doc.setFontSize(10);

    // Draw outstanding in words with wrapping if needed
    const outstandingWordsX = col2 + outstandingWidth + 5;
    drawWrappedText(
      outstandingInWords,
      outstandingWordsX,
      startY + 80,
      maxWordsWidth
    );

    // Footer
    const footerY = doc.internal.pageSize.height - 30;
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, footerY, 190, footerY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      `Authorized by: ${user?.fullName || "System Admin"}`,
      20,
      footerY + 10
    );

    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor);
    doc.setFontSize(8);
    doc.text(
      "This is a computer-generated document. No signature is required.",
      105,
      footerY + 15,
      { align: "center" }
    );

    // Save the PDF
    doc.save(`Receipt_${payment.id.slice(0, 8)}.pdf`);
  };

  const invoiceColumns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceName",
      header: "Invoice Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("invoiceName")}</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(row.original.invoiceDate)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {formatCurrency(row.getValue("amount"))}
          </div>
          <div className="text-sm text-muted-foreground">
            Due: {formatDate(row.original.dueDate)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "paidAmount",
      header: "Paid Amount",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {formatCurrency(row.original.paidAmount)}
          </div>
          <div className="text-sm text-muted-foreground">
            Remaining: {formatCurrency(row.original.remainingAmount)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.getValue("status")}
          dueDays={row.original.dueDays}
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <div className="flex justify-end gap-2">
            <InvoiceForm
              invoice={invoice}
              retailers={retailers}
              onSuccess={handleInvoiceSuccess}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center cursor-pointer"
                >
                  <EditIcon className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              }
            />
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex items-center cursor-pointer"
            >
              <Link href={`/payment-management/invoices/${invoice.id}`}>
                <EyeIcon className="mr-2 h-4 w-4" />
                View
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  const paymentColumns: ColumnDef<Payment>[] = [
    {
      accessorKey: "paymentDate",
      header: "Payment Date",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatDate(row.original.paymentDate)}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.getValue("amount"))}
        </div>
      ),
    },
    {
      accessorKey: "invoices",
      header: "Applied To",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.invoices.length}{" "}
          {row.original.invoices.length === 1 ? "invoice" : "invoices"}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center cursor-pointer"
              onClick={() => generateReceiptPDF(payment)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Receipt
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex items-center cursor-pointer"
            >
              <Link href={`/payment-management/payments/${payment.id}`}>
                <EyeIcon className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <RetailerSkeleton />;
  }

  if (!retailer) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/payment-management/retailers">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold truncate">{retailer.name}</h1>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <RetailerForm
            retailer={retailer}
            onSuccess={handleRetailerSuccess}
            trigger={
              <Button className="w-full md:w-auto" variant="outline" size="sm">
                Edit Retailer
              </Button>
            }
          />
          <ConfirmationDialog
            title="Delete Retailer"
            description="Are you sure you want to delete this retailer? This action cannot be undone. Note: You can only delete retailers that have no associated invoices."
            trigger={
              <Button
                variant="destructive"
                className="w-full md:w-auto"
                disabled={invoices.length > 0}
                title={
                  invoices.length > 0
                    ? "Cannot delete retailer with associated invoices"
                    : ""
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Retailer
              </Button>
            }
            onConfirm={() => deleteRetailer(retailer.id)}
            onSuccess={() => router.push("/payment-management/retailers")}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full md:w-auto"
            onClick={generatePDFReport}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Report
          </Button>
          {totalOutstanding > 0 && (
            <PaymentForm
              retailer={retailer}
              totalDue={totalOutstanding}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoiced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalInvoiced)}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.length} {payments.length === 1 ? "payment" : "payments"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              {
                invoices.filter(
                  (i) => i.status === "due" || i.status === "overdue"
                ).length
              }{" "}
              unpaid
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalOverdue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status === "overdue").length} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger className="cursor-pointer" value="invoices">
              Invoices
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="payments">
              Payments
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="details">
              Details
            </TabsTrigger>
          </TabsList>

          <InvoiceForm
            retailers={retailers}
            defaultRetailerId={retailer.id}
            onSuccess={handleInvoiceSuccess}
            trigger={
              <Button
                size="sm"
                className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Invoice
              </Button>
            }
          />
        </div>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                Manage invoices for {retailer.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedInvoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No invoices found for this retailer.
                </p>
              ) : (
                <DataTable
                  columns={invoiceColumns}
                  data={sortedInvoices}
                  searchKey="invoiceName"
                  pageSize={10}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View payment history for {retailer.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedPayments.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No payments recorded for this retailer.
                </p>
              ) : (
                <DataTable
                  columns={paymentColumns}
                  data={sortedPayments}
                  searchKey="paymentDate"
                  pageSize={10}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Retailer Details</CardTitle>
              <CardDescription>Manage retailer information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Name</h3>
                  <p className="text-muted-foreground">{retailer.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Email</h3>
                    <p className="text-muted-foreground">
                      {retailer.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Phone</h3>
                    <p className="text-muted-foreground">
                      {retailer.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Address</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {retailer.address || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function RetailerPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<RetailerSkeleton />}>
        <RetailerContent />
      </Suspense>
    </DashboardLayout>
  );
}

function RetailerSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-[120px]" />
          <Skeleton className="h-9 w-[150px]" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-9 w-[120px]" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 p-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
            </div>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="grid grid-cols-5 gap-4 border-t p-4">
                  {Array(5)
                    .fill(0)
                    .map((_, j) => (
                      <Skeleton key={j} className="h-5 w-full" />
                    ))}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
