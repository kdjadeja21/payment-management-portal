"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table/data-table";
import { getPayments } from "@/app/actions/payments";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import DashboardLayout from "@/app/components/dashboard-layout";
import { Payment } from "@/types";

function PaymentsContent() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "retailerName",
      header: "Retailer",
    },
    {
      accessorKey: "paymentDate",
      header: "Payment Date",
      cell: ({ row }) => formatDateTime(row.original.paymentDate),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.amount),
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
  ];

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentsData = await getPayments();
        // Sort payments by date (newest first)
        const sortedPayments = paymentsData.sort(
          (a, b) => b.paymentDate.getTime() - a.paymentDate.getTime()
        );
        setPayments(sortedPayments);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load payments"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return <PaymentsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payments</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={payments}
            searchKey="retailerName"
            pageSize={10}
            onView={(row) =>
              router.push(`/payment-management/payments/${row.id}`)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<PaymentsSkeleton />}>
        <PaymentsContent />
      </Suspense>
    </DashboardLayout>
  );
}

function PaymentsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
            </div>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t p-4"
                >
                  {Array(4)
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
