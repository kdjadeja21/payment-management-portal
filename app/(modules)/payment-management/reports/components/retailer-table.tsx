"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type RetailerBreakdown = {
  id: string;
  name: string;
  invoiceCount: number;
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
};

const columns: ColumnDef<RetailerBreakdown>[] = [
  {
    accessorKey: "name",
    header: "Retailer",
  },
  {
    accessorKey: "invoiceCount",
    header: "Invoices",
  },
  {
    accessorKey: "totalInvoiced",
    header: "Total Invoiced",
    cell: ({ row }) => formatCurrency(row.getValue("totalInvoiced")),
  },
  {
    accessorKey: "totalPaid",
    header: "Total Paid",
    cell: ({ row }) => formatCurrency(row.getValue("totalPaid")),
  },
  {
    accessorKey: "totalOutstanding",
    header: "Outstanding",
    cell: ({ row }) => {
      const amount = row.getValue("totalOutstanding") as number;
      const overdue = row.original.totalOverdue;
      return (
        <div className={overdue > 0 ? "text-destructive font-medium" : ""}>
          {formatCurrency(amount)}
        </div>
      );
    },
  },
];

interface RetailerTableProps {
  data: RetailerBreakdown[];
}

export function RetailerTable({ data }: RetailerTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Retailer Breakdown</CardTitle>
        <CardDescription>Outstanding amounts by retailer</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={data}
          pageSize={10}
          searchKey="name"
        />
      </CardContent>
    </Card>
  );
}
