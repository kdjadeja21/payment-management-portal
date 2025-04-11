"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { usePaymentData } from "@/app/hooks/use-payment-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/app/components/status-badge"
import { Invoice } from "@/types"

export function RecentInvoicesWidget() {
  const { invoices, isLoading } = usePaymentData()

  // Get recent invoices (last 5)
  const recentInvoices = [...invoices]
    .sort((a: Invoice, b: Invoice) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <Card className="bg-[#F0FDFA]">
        <CardHeader>
          <CardTitle className="text-[#0EA5E9]">Recent Invoices</CardTitle>
          <CardDescription>Latest invoices created in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-[#CCFBF1] animate-pulse rounded" />
                  <div className="h-3 w-24 bg-[#CCFBF1] animate-pulse rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 bg-[#CCFBF1] animate-pulse rounded" />
                  <div className="h-5 w-20 bg-[#CCFBF1] animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full border-[#E5E7EB]" disabled>
            View All Invoices
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-[#F0FDFA]">
      <CardHeader>
        <CardTitle className="text-[#0EA5E9]">Recent Invoices</CardTitle>
        <CardDescription>
          Latest invoices created in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentInvoices.map((invoice: Invoice) => (
            <div key={invoice.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{invoice.retailerName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(invoice.invoiceDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={invoice.status} />
                <p className="font-medium">{formatCurrency(invoice.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full border-[#E5E7EB]">
          <Link href="/payment-management/invoices">
            View All Invoices
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 