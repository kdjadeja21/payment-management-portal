import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Plus } from 'lucide-react'
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getInvoices } from "@/app/actions/invoices"
import { getRetailers } from "@/app/actions/retailers"
import { formatCurrency, formatDate, getCardColor } from "@/lib/utils"
import { StatusBadge } from "@/app/components/status-badge"
import { DashboardStats } from "@/app/components/dashboard-stats"
import DashboardLayout from "@/app/components/dashboard-layout"

async function DashboardContent() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  try {
    const [invoices, retailers] = await Promise.all([
      getInvoices(),
      getRetailers()
    ])
    
    // Get recent invoices (last 5)
    const recentInvoices = [...invoices]
      .sort((a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime())
      .slice(0, 5)
    
    // Get retailers with outstanding invoices
    const retailersWithOutstanding = retailers.map(retailer => {
      const retailerInvoices = invoices.filter(invoice => 
        invoice.retailerId === retailer.id &&
        (invoice.status === 'due' || invoice.status === 'overdue')
      )
      
      const totalOutstanding = retailerInvoices.reduce(
        (sum, invoice) => sum + invoice.remainingAmount, 
        0
      )
      
      return {
        ...retailer,
        totalOutstanding,
        invoiceCount: retailerInvoices.length
      }
    })
    .filter(retailer => retailer.totalOutstanding > 0)
    .sort((a, b) => b.totalOutstanding - a.totalOutstanding)
    .slice(0, 5)
    
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <DashboardStats invoices={invoices} retailers={retailers} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className={getCardColor('Recent Invoices').bgColor}>
            <CardHeader>
              <CardTitle className={getCardColor('Recent Invoices').textColor}>Recent Invoices</CardTitle>
              <CardDescription>
                Latest invoices created in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map(invoice => (
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
              <Button asChild variant="outline" className="w-full">
                <Link href="/invoices">
                  View All Invoices
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className={getCardColor('Outstanding Balances').bgColor}>
            <CardHeader>
              <CardTitle className={getCardColor('Outstanding Balances').textColor}>Outstanding Balances</CardTitle>
              <CardDescription>
                Retailers with the highest outstanding balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retailersWithOutstanding.map(retailer => (
                  <div key={retailer.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{retailer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {retailer.invoiceCount} {retailer.invoiceCount === 1 ? 'invoice' : 'invoices'}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(retailer.totalOutstanding)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/retailers">
                  View All Retailers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      redirect('/sign-in')
    }
    throw error
  }
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </DashboardLayout>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-10 w-[180px]" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28 mb-1" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {Array(2).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(5).fill(0).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}