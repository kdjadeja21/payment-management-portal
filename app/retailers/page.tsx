import { Suspense } from "react"
import Link from "next/link"
import { Plus } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getRetailers } from "@/app/actions/retailers"
import { getInvoices } from "@/app/actions/invoices"
import { getPayments } from "@/app/actions/payments"
import { formatCurrency } from "@/lib/utils"
import { RetailerForm } from "@/app/components/retailer-form"
import DashboardLayout from "@/app/components/dashboard-layout"

async function RetailersContent() {
  const [retailers, invoices, payments] = await Promise.all([
    getRetailers(),
    getInvoices(),
    getPayments()
  ])
  
  // Calculate outstanding amounts for each retailer
  const retailersWithStats = retailers.map(retailer => {
    const retailerInvoices = invoices.filter(invoice => invoice.retailerId === retailer.id)
    const retailerPayments = payments.filter(payment => payment.retailerId === retailer.id)
    
    const totalInvoiced = retailerInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    const totalPaid = retailerPayments.reduce((sum, payment) => sum + payment.amount, 0)
    
    const totalOutstanding = retailerInvoices
      .filter(invoice => invoice.status === 'due' || invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.remainingAmount, 0)
    
    const totalOverdue = retailerInvoices
      .filter(invoice => invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.remainingAmount, 0)
    
    return {
      ...retailer,
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      totalOverdue,
      invoiceCount: retailerInvoices.length
    }
  })
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Retailers</h1>
        <RetailerForm
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Retailer
            </Button>
          }
        />
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {retailersWithStats.map(retailer => (
          <Card key={retailer.id}>
            <CardHeader>
              <CardTitle>{retailer.name}</CardTitle>
              <CardDescription>
                {retailer.invoiceCount} {retailer.invoiceCount === 1 ? 'invoice' : 'invoices'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Invoiced:</span>
                  <span>{formatCurrency(retailer.totalInvoiced)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Paid:</span>
                  <span>{formatCurrency(retailer.totalPaid)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-sm">Outstanding:</span>
                  <span>{formatCurrency(retailer.totalOutstanding)}</span>
                </div>
                {retailer.totalOverdue > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span className="text-sm">Overdue:</span>
                    <span>{formatCurrency(retailer.totalOverdue)}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <RetailerForm
                retailer={retailer}
                trigger={<Button variant="outline" size="sm">Edit</Button>}
              />
              <Button asChild variant="secondary" size="sm">
                <Link href={`/retailers/${retailer.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function RetailersPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<RetailersSkeleton />}>
        <RetailersContent />
      </Suspense>
    </DashboardLayout>
  )
}

function RetailersSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array(4).fill(0).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}