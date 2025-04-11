"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { usePaymentData } from "@/app/hooks/use-payment-data"
import { formatCurrency } from "@/lib/utils"
import { Invoice, Retailer, RetailerWithOutstanding } from "@/types"

export function OutstandingBalancesWidget() {
  const { invoices, retailers, isLoading } = usePaymentData()

  // Get retailers with outstanding invoices
  const retailersWithOutstanding: RetailerWithOutstanding[] = retailers.map((retailer: Retailer) => {
    const retailerInvoices = invoices.filter((invoice: Invoice) => 
      invoice.retailerId === retailer.id &&
      (invoice.status === 'due' || invoice.status === 'overdue')
    )
    
    const totalOutstanding = retailerInvoices.reduce(
      (sum: number, invoice: Invoice) => sum + invoice.remainingAmount, 
      0
    )
    
    return {
      ...retailer,
      totalOutstanding,
      invoiceCount: retailerInvoices.length
    }
  })
  .filter((retailer: RetailerWithOutstanding) => retailer.totalOutstanding > 0)
  .sort((a: RetailerWithOutstanding, b: RetailerWithOutstanding) => 
    b.totalOutstanding - a.totalOutstanding
  )
  .slice(0, 5)

  if (isLoading) {
    return (
      <Card className="bg-[#F0F4F8]">
        <CardHeader>
          <CardTitle className="text-gray-800">Outstanding Balances</CardTitle>
          <CardDescription className="text-gray-600">Retailers with the highest outstanding balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-gray-300 animate-pulse rounded" />
                  <div className="h-3 w-24 bg-gray-300 animate-pulse rounded" />
                </div>
                <div className="h-5 w-20 bg-gray-300 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full bg-[#E2E8F0]" disabled>
            View All Retailers
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-[#F0F4F8] shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-800">Outstanding Balances</CardTitle>
        <CardDescription className="text-gray-600">
          Retailers with the highest outstanding balances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {retailersWithOutstanding.map((retailer: RetailerWithOutstanding) => (
            <div key={retailer.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">{retailer.name}</p>
                <p className="text-sm text-gray-500">
                  {retailer.invoiceCount} {retailer.invoiceCount === 1 ? 'invoice' : 'invoices'}
                </p>
              </div>
              <p className="font-medium text-gray-800">{formatCurrency(retailer.totalOutstanding)}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full bg-[#E2E8F0]">
          <Link href="/payment-management/retailers">
            View All Retailers
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 