"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileText, Plus, Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table/data-table";
import { getInvoices } from "@/app/actions/invoices";
import { getRetailers } from "@/app/actions/retailers";
import { formatCurrency } from "@/lib/utils";
import DashboardLayout from "@/app/components/dashboard-layout";
import { Invoice, Retailer } from "@/types";
import { InvoiceForm } from "@/app/components/invoice-form";
import { useAuth } from "@clerk/nextjs";
import { InlineLoader } from "@/app/components/loader";

function InvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dueDaysFilter, setDueDaysFilter] = useState<{
    operator: ">" | "<" | "=";
    value: number;
  } | null>(null);

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "retailerName",
      header: "Retailer",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: "invoiceDate",
      header: "Invoice Date",
      cell: ({ row }) =>
        format(new Date(row.original.invoiceDate), "MMM dd, yyyy"),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => format(new Date(row.original.dueDate), "MMM dd, yyyy"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={getStatusColor(row.original.status)}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "paidAmount",
      header: "Paid Amount",
      cell: ({ row }) => formatCurrency(row.original.paidAmount),
    },
    {
      accessorKey: "remainingAmount",
      header: "Remaining Amount",
      cell: ({ row }) => formatCurrency(row.original.remainingAmount),
    },
    {
      accessorKey: "dueDays",
      header: "Due Days",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(`/payment-management/invoices/${row.original.id}`)
          }
          className="cursor-pointer"
        >
          View
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesData, retailersData] = await Promise.all([
          getInvoices({
            dueDays: dueDaysFilter || undefined,
          }),
          getRetailers(),
        ]);
        setInvoices(invoicesData);
        setRetailers(retailersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, dueDaysFilter]);

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      paid: "text-emerald-600",
      due: "text-amber-600",
      overdue: "text-rose-600",
    };
    return statusColors[status] || "text-slate-600";
  };

  const handleDueDaysFilterChange = (
    operator: ">" | "<" | "=" | "",
    value: string
  ) => {
    if (!operator || !value) {
      setDueDaysFilter(null);
      return;
    }
    setDueDaysFilter({
      operator,
      value: parseInt(value),
    });
  };

  const clearFilters = () => {
    setDueDaysFilter(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
        <Card className="border-gray-200">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-gray-800">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <InlineLoader />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <InvoiceForm
            retailers={retailers}
            trigger={
              <Button size="sm" className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            }
          />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
        <InvoiceForm
          retailers={retailers}
          trigger={
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          }
          onSuccess={() => {
            const fetchData = async () => {
              try {
                const [invoicesData, retailersData] = await Promise.all([
                  getInvoices({
                    dueDays: dueDaysFilter || undefined,
                  }),
                  getRetailers(),
                ]);
                setInvoices(invoicesData);
                setRetailers(retailersData);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Failed to load data"
                );
              }
            };
            fetchData();
          }}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            Filter by Due Days
          </span>
          <Select
            value={dueDaysFilter?.operator || ""}
            onValueChange={(value) => {
              if (!value) {
                setDueDaysFilter(null);
                return;
              }
              setDueDaysFilter({
                operator: value as ">" | "<" | "=",
                value: dueDaysFilter?.value || 0,
              });
            }}
          >
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=">">Greater than</SelectItem>
              <SelectItem value="<">Less than</SelectItem>
              <SelectItem value="=">Equals</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Days"
            value={dueDaysFilter?.value || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) {
                setDueDaysFilter({
                  operator: dueDaysFilter?.operator || ">",
                  value: 0,
                });
                return;
              }
              setDueDaysFilter({
                operator: dueDaysFilter?.operator || ">",
                value: parseInt(value),
              });
            }}
            className="w-[100px] bg-white"
          />
          {dueDaysFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-gray-800">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={invoices}
            searchKey="retailerName"
            pageSize={10}
            onView={(row) =>
              router.push(`/payment-management/invoices/${row.id}`)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <DashboardLayout>
      <InvoiceContent />
    </DashboardLayout>
  );
}
