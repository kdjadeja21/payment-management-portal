"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table/data-table";
import { getPaymentById } from "@/app/actions/payments";
import { getInvoices } from "@/app/actions/invoices";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import DashboardLayout from "@/app/components/dashboard-layout";
import { Payment, Invoice } from "@/types";

function PaymentDetailsContent() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceName",
      header: "Invoice Number",
      cell: ({ row }) => (
        <div className="font-bold">{row.original.invoiceName}</div>
      ),
    },
    {
      accessorKey: "invoiceDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.invoiceDate),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      id: "amountApplied",
      header: "Amount Applied",
      cell: ({ row }) => {
        const paymentInfo = payment?.invoices.find(
          (inv) => inv.invoiceId === row.original.id
        );
        return formatCurrency(paymentInfo?.amountApplied || 0);
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          className="cursor-pointer"
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`/payment-management/invoices/${row.original.id}`)
          }
        >
          View
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const paymentData = await getPaymentById(id);
        setPayment(paymentData);

        // Fetch all invoices for this payment
        const invoiceIds = paymentData.invoices.map((inv) => inv.invoiceId);
        const allInvoices = await getInvoices();
        const paymentInvoices = allInvoices.filter((invoice) =>
          invoiceIds.includes(invoice.id)
        );
        setInvoices(paymentInvoices);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load payment details"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <PaymentDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link className="cursor-pointer" href="/payment-management/payments">
            <Button className="cursor-pointer" variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 font-semibold">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payment) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/payment-management/payments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Payment Details</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Payment made on {payment ? formatDateTime(payment.paymentDate) : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <h3 className="font-medium text-lg">Retailer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Retailer Name</p>
                  <Link
                    href={`/payment-management/retailers/${payment?.retailerId}`}
                    className="text-blue-600 hover:underline font-bold"
                  >
                    {payment?.retailerName}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Amount</p>
                  <p className="font-medium text-lg">
                    {payment ? formatCurrency(payment.amount) : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <h3 className="font-medium text-lg">Applied Invoices</h3>
              <DataTable columns={columns} data={invoices} pageSize={5} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-[120px]" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32 mt-1" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32 mt-1" />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Skeleton className="h-5 w-32" />
              <div className="rounded-md border border-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-5 w-full" />
                    ))}
                </div>
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t p-4"
                    >
                      {Array(4)
                        .fill(0)
                        .map((_, j) => (
                          <Skeleton key={j} className="h-5 w-full" />
                        ))}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentDetailsPage() {
  return (
    <DashboardLayout>
      <PaymentDetailsContent />
    </DashboardLayout>
  );
}
