import { Suspense } from "react"
import { Download, FileText, Printer } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getInvoices } from "@/app/actions/invoices"
import { getRetailers } from "@/app/actions/retailers"
import { formatCurrency } from "@/lib/utils"
import DashboardLayout from "@/app/components/dashboard-layout"

async function ReportsContent() {
  const [invoices, retailers] = await Promise.all([
    getInvoices(),
    getRetailers()
  ])
  
  // Calculate retailer-wise breakdown
  const retailerBreakdown = retailers.map(retailer => {
    const retailerInvoices = invoices.filter(invoice => invoice.retailerId === retailer.id)
    
    const totalInvoiced = retailerInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    
    const totalPaid = retailerInvoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.paidAmount, 0)
    
    const totalOutstanding = retailerInvoices
      .filter(invoice => invoice.status === 'due' || invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.remainingAmount, 0)
    
    const totalOverdue = retailerInvoices
      .filter(invoice => invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.remainingAmount, 0)
    
    return {
      id: retailer.id,
      name: retailer.name,
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      totalOverdue,
      invoiceCount: retailerInvoices.length
    }
  })
  .filter(retailer => retailer.invoiceCount > 0)
  .sort((a, b) => b.totalOutstanding - a.totalOutstanding)
  
  // Calculate monthly breakdown
  const monthlyBreakdown: Record<string, {
    month: string,
    invoiced: number,
    paid: number,
    outstanding: number
  }> = {}
  
  invoices.forEach(invoice => {
    const month = invoice.invoiceDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    
    if (!monthlyBreakdown[month]) {
      monthlyBreakdown[month] = {
        month,
        invoiced: 0,
        paid: 0,
        outstanding: 0
      }
    }
    
    monthlyBreakdown[month].invoiced += invoice.amount
    monthlyBreakdown[month].paid += invoice.paidAmount
    monthlyBreakdown[month].outstanding += invoice.remainingAmount
  })
  
  const monthlyData = Object.values(monthlyBreakdown)
    .sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 6)
    .reverse()
  
  // Calculate status breakdown
  const statusBreakdown = {
    paid: invoices.filter(invoice => invoice.status === 'paid').length,
    due: invoices.filter(invoice => invoice.status === 'due').length,
    overdue: invoices.filter(invoice => invoice.status === 'overdue').length,
  }
  
  const totalInvoices = invoices.length
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="retailers">Retailers</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(invoices.reduce((sum, invoice) => sum + invoice.amount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {invoices.length} invoices
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statusBreakdown.paid} paid invoices
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(invoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statusBreakdown.due + statusBreakdown.overdue} unpaid invoices
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Invoice Status Breakdown</CardTitle>
              <CardDescription>
                Distribution of invoices by payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Paid</span>
                      <span className="text-sm text-muted-foreground">
                        {statusBreakdown.paid} invoices ({Math.round((statusBreakdown.paid / totalInvoices) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${(statusBreakdown.paid / totalInvoices) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Due</span>
                      <span className="text-sm text-muted-foreground">
                        {statusBreakdown.due} invoices ({Math.round((statusBreakdown.due / totalInvoices) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-yellow-500"
                        style={{ width: `${(statusBreakdown.due / totalInvoices) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overdue</span>
                      <span className="text-sm text-muted-foreground">
                        {statusBreakdown.overdue} invoices ({Math.round((statusBreakdown.overdue / totalInvoices) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{ width: `${(statusBreakdown.overdue / totalInvoices) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="retailers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Retailer Breakdown</CardTitle>
              <CardDescription>
                Outstanding amounts by retailer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                  <div>Retailer</div>
                  <div>Invoices</div>
                  <div>Total Invoiced</div>
                  <div>Total Paid</div>
                  <div>Outstanding</div>
                </div>
                {retailerBreakdown.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No data available.
                  </div>
                ) : (
                  retailerBreakdown.map(retailer => (
                    <div
                      key={retailer.id}
                      className="grid grid-cols-5 gap-4 border-t p-4"
                    >
                      <div>{retailer.name}</div>
                      <div>{retailer.invoiceCount}</div>
                      <div>{formatCurrency(retailer.totalInvoiced)}</div>
                      <div>{formatCurrency(retailer.totalPaid)}</div>
                      <div className={retailer.totalOverdue > 0 ? 'text-destructive font-medium' : ''}>
                        {formatCurrency(retailer.totalOutstanding)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>
                Invoice and payment trends by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <div className="flex h-full items-end gap-2">
                  {monthlyData.map((month, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full space-y-2">
                        <div
                          className="bg-primary rounded-t-sm w-full"
                          style={{ height: `${(month.invoiced / Math.max(...monthlyData.map(m => m.invoiced))) * 200}px` }}
                        />
                        <div
                          className="bg-green-500 rounded-t-sm w-full"
                          style={{ height: `${(month.paid / Math.max(...monthlyData.map(m => m.invoiced))) * 200}px` }}
                        />
                        <div
                          className="bg-yellow-500 rounded-t-sm w-full"
                          style={{ height: `${(month.outstanding / Math.max(...monthlyData.map(m => m.invoiced))) * 200}px` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{month.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Invoiced</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-muted-foreground">Outstanding</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsContent />
      </Suspense>
    </DashboardLayout>
  )
}

function ReportsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[180px]" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      
      <Skeleton className="h-10 w-[300px]" />
      
      <div className="grid gap-6 md:grid-cols-3">
        {Array(3).fill(0).map((_, i) => (
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
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}