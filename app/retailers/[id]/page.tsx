"use client"

import { Suspense, useEffect, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, EditIcon, EyeIcon, Plus } from 'lucide-react'
import { useParams } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getRetailers } from "@/app/actions/retailers"
import { getInvoices } from "@/app/actions/invoices"
import { getPayments } from "@/app/actions/payments"
import { formatCurrency, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/app/components/status-badge"
import { RetailerForm } from "@/app/components/retailer-form"
import { InvoiceForm } from "@/app/components/invoice-form"
import { PaymentForm } from "@/app/components/payment-form"
import DashboardLayout from "@/app/components/dashboard-layout"
import { Retailer, Invoice, Payment } from "@/types"

function RetailerContent() {
  // const params = useParams()

  const { id } = useParams<{ id: string }>()

  // console.log({ params })
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [retailersData, invoicesData, paymentsData] = await Promise.all([
        getRetailers(),
        getInvoices({ retailerId: id as string }),
        getPayments({ retailerId: id as string })
      ])
      console.log({ retailersData })
      setRetailers(retailersData)
      setInvoices(invoicesData)
      setPayments(paymentsData)
      setLoading(false)

      const foundRetailer = retailersData.find(r => r.id === id)

      if (!foundRetailer) {
        notFound();
      }
    }

    fetchData()
  }, [id]) // Ensure useEffect is called when params.id changes

  console.log({ retailers })

  const retailer = retailers[0]; // Assuming retailers is an array with a single retailer based on the passed param

  // Calculate stats
  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalOutstanding = invoices
    .filter(invoice => invoice.status === 'due' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.remainingAmount, 0)
  const totalOverdue = invoices
    .filter(invoice => invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.remainingAmount, 0)

  // Sort invoices by date (newest first)
  const sortedInvoices = [...invoices].sort(
    (a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime()
  )

  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort(
    (a, b) => b.paymentDate.getTime() - a.paymentDate.getTime()
  )

  if (loading) {
    return <RetailerSkeleton />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/retailers">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{retailer.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <RetailerForm
            retailer={retailer}
            trigger={<Button className="cursor-pointer" variant="outline" size="sm">Edit Retailer</Button>}
          />
          {totalOutstanding > 0 && (
            <PaymentForm retailer={retailer} totalDue={totalOutstanding} />
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.length} {payments.length === 1 ? 'payment' : 'payments'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(i => i.status === 'due' || i.status === 'overdue').length} unpaid
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOverdue)}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.filter(i => i.status === 'overdue').length} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger className="cursor-pointer" value="invoices">Invoices</TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="payments">Payments</TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="details">Details</TabsTrigger>
          </TabsList>

          <InvoiceForm
            retailers={retailers}
            defaultRetailerId={retailer.id}
            trigger={
              <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Add Invoice
              </Button>
            }
            onSuccess={() => {
              // Refresh the page to get updated data
              // window.location.reload()
            }}
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
              <div className="space-y-4">
                {sortedInvoices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No invoices found for this retailer.
                  </p>
                ) : (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 font-medium">
                      <div>Invoice Name</div>
                      <div>Amount</div>
                      <div>Paid Amount</div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>
                    {sortedInvoices.map(invoice => (
                      <div
                        key={invoice.id}
                        className="grid grid-cols-1 md:grid-cols-5 gap-4 border-t p-4"
                      >
                        <div>
                          <div className="font-medium">{invoice.invoiceName}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(invoice.invoiceDate)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{formatCurrency(invoice.amount)}</div>
                          <div className="text-sm text-muted-foreground">
                            Due: {formatDate(invoice.dueDate)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{formatCurrency(invoice.paidAmount)}</div>
                          <div className="text-sm text-muted-foreground">
                            Remaining: {formatCurrency(invoice.remainingAmount)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={invoice.status} dueDays={invoice.dueDays} />
                        </div>
                        <div className="flex justify-end gap-2">
                          <InvoiceForm
                            invoice={invoice}
                            retailers={retailers}
                            trigger={
                              <Button variant="outline" size="sm" className="flex items-center cursor-pointer">
                                <EditIcon />Edit
                              </Button>
                            }
                          />
                          <Button asChild variant="outline" size="sm" className="flex items-center cursor-pointer">
                            <Link href={`/invoices/${invoice.id}`}><EyeIcon />View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              <div className="space-y-4">
                {sortedPayments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No payments recorded for this retailer.
                  </p>
                ) : (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-3 gap-4 p-4 font-medium">
                      <div>Payment Date</div>
                      <div>Amount</div>
                      <div>Applied To</div>
                    </div>
                    {sortedPayments.map(payment => (
                      <div
                        key={payment.id}
                        className="grid grid-cols-3 gap-4 border-t p-4"
                      >
                        <div>{formatDate(payment.paymentDate)}</div>
                        <div>{formatCurrency(payment.amount)}</div>
                        <div>
                          <div className="text-sm">
                            {payment.invoices.length} {payment.invoices.length === 1 ? 'invoice' : 'invoices'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Retailer Details</CardTitle>
              <CardDescription>
                Contact information for {retailer.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">
                      {retailer.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">
                      {retailer.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Address</h3>
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
  )
}

export default function RetailerPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<RetailerSkeleton />}>
        <RetailerContent />
      </Suspense>
    </DashboardLayout>
  )
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
        {Array(4).fill(0).map((_, i) => (
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
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 border-t p-4">
                {Array(5).fill(0).map((_, j) => (
                  <Skeleton key={j} className="h-5 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}