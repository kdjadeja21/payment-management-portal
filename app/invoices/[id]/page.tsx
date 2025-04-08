// @ts-nocheck

import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, Printer } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getInvoices } from "@/app/actions/invoices"
import { getRetailers } from "@/app/actions/retailers"
import { formatCurrency, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/app/components/status-badge"
import { InvoiceForm } from "@/app/components/invoice-form"
import { markAsPaid } from "@/app/actions/invoices"
import DashboardLayout from "@/app/components/dashboard-layout"

// Define proper types for Next.js page props
type PageProps = {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function getInvoiceDetails(id: string) {
  try {
    const [invoices, retailers] = await Promise.all([
      getInvoices(),
      getRetailers()
    ])

    const invoice = invoices.find(i => i.id === id)
    if (!invoice) {
      notFound()
    }

    const retailer = retailers.find(r => r.id === invoice.retailerId)
    if (!retailer) {
      notFound()
    }

    return { invoice, retailer, retailers }
  } catch (error) {
    console.error("Error fetching invoice details:", error)
    throw error
  }
}

async function InvoiceContent({ id }: { id: string }) {
  try {
    const { invoice, retailer, retailers } = await getInvoiceDetails(id)

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon">
              <Link href="/invoices">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Invoice Details</h1>
          </div>
          <div className="flex items-center gap-4">
            <InvoiceForm
              invoice={invoice}
              retailers={retailers}
              trigger={<Button variant="outline" size="sm">Edit Invoice</Button>}
            />
            {invoice.status !== 'paid' && (
              <form action={async () => {
                'use server'
                try {
                  await markAsPaid(invoice.id)
                } catch (error) {
                  console.error("Error marking invoice as paid:", error)
                }
              }}>
                <Button type="submit" size="sm">Mark as Paid</Button>
              </form>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
              <CardDescription>
                Invoice details and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium">Invoice Name</h3>
                    <p className="text-muted-foreground">{invoice.invoiceName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Invoice Date</h3>
                    <p className="text-muted-foreground">{formatDate(invoice.invoiceDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Due Date</h3>
                    <p className="text-muted-foreground">{formatDate(invoice.dueDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Status</h3>
                    <StatusBadge status={invoice.status} dueDays={invoice.dueDays} className="mt-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Due Days</h3>
                    <p className="text-muted-foreground">
                      {invoice.dueDays > 0
                        ? `${invoice.dueDays} days remaining`
                        : invoice.dueDays < 0
                          ? `${Math.abs(invoice.dueDays)} days overdue`
                          : 'Due today'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium">Amount</h3>
                    <p className="text-xl font-bold">{formatCurrency(invoice.amount)}</p>
                  </div>
                  {invoice.paidAmount > 0 && (
                    <div>
                      <h3 className="text-sm font-medium">Paid</h3>
                      <p className="text-muted-foreground">{formatCurrency(invoice.paidAmount)}</p>
                    </div>
                  )}
                  {invoice.remainingAmount > 0 && (
                    <div>
                      <h3 className="text-sm font-medium">Remaining</h3>
                      <p className="text-muted-foreground">{formatCurrency(invoice.remainingAmount)}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Retailer Information</CardTitle>
              <CardDescription>
                Details about the retailer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Name</h3>
                  <p className="text-muted-foreground">
                    {retailer.name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Email</h3>
                    <p className="text-muted-foreground">
                      {retailer.email || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Phone</h3>
                    <p className="text-muted-foreground">
                      {retailer.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Address</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {retailer.address || "Not provided"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/retailers/${retailer.id}`}>
                  View Retailer Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error rendering invoice content:", error)
    return <div>Something went wrong loading the invoice. Please try again.</div>
  }
}

// export default async function InvoicePage({ params }: PageProps) {
//   return (
//     <DashboardLayout>
//       <Suspense fallback={<InvoiceSkeleton />}>
//         <InvoiceContent id={params.id} />
//       </Suspense>
//     </DashboardLayout>
//   )
// }

function InvoiceSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-[120px]" />
          <Skeleton className="h-9 w-[120px]" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Array(2).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(4).fill(0).map((_, j) => (
                  <div key={j} className="grid grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default async function InvoicePage({
  params
}: {
  params: { id: string }
}) {
  return (
    <DashboardLayout>
      <Suspense fallback={<InvoiceSkeleton />}>
        <InvoiceContent id={params.id} />
      </Suspense>
    </DashboardLayout>
  )
}
