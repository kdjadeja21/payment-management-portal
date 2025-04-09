"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getPaymentById } from "@/app/actions/payments"
import { getInvoices } from "@/app/actions/invoices"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import DashboardLayout from "@/app/components/dashboard-layout"
import { Payment, Invoice } from "@/types"

function PaymentDetailsContent() {
  const { id } = useParams<{ id: string }>()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const paymentData = await getPaymentById(id)
        setPayment(paymentData)

        // Fetch all invoices for this payment
        const invoiceIds = paymentData.invoices.map(inv => inv.invoiceId)
        const allInvoices = await getInvoices()
        const paymentInvoices = allInvoices.filter(invoice =>
          invoiceIds.includes(invoice.id)
        )
        setInvoices(paymentInvoices)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payment details")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return <PaymentDetailsSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link className="cursor-pointer" href="/payments">
            <Button className="cursor-pointer" variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 font-semibold">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!payment) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/payments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Payment Details</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Payment made on {formatDateTime(payment.paymentDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <h3 className="font-medium text-lg">Retailer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Retailer Name</p>
                  <Link
                    href={`/retailers/${payment.retailerId}`}
                    className="text-blue-600 hover:underline font-bold"
                    aria-label={`View details for retailer ${payment.retailerName}`}
                  >
                    {payment.retailerName}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Amount</p>
                  <p className="font-medium text-lg">{formatCurrency(payment.amount)}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <h3 className="font-medium text-lg">Applied Invoices</h3>
              <div className="rounded-md border border-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 font-medium bg-gray-100">
                  <div>Invoice Number</div>
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Amount Applied</div>
                </div>
                {invoices.map((invoice) => {
                  const paymentInfo = payment.invoices.find(
                    inv => inv.invoiceId === invoice.id
                  )
                  return (
                    <div
                      key={invoice.id}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t p-4 hover:bg-gray-50"
                    >
                      <div>
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:underline font-bold"
                          aria-label={`View details for invoice ${invoice.invoiceName}`}
                        >
                          {invoice.invoiceName}
                        </Link>
                      </div>
                      <div>{formatDate(invoice.invoiceDate)}</div>
                      <div>{formatCurrency(invoice.amount)}</div>
                      <div>{formatCurrency(paymentInfo?.amountApplied || 0)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PaymentDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-[120px]" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32 mt-1" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32 mt-1" />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Skeleton className="h-5 w-32" />
              <div className="rounded-md border border-gray-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t p-4">
                    {Array(4).fill(0).map((_, j) => (
                      <Skeleton key={j} className="h-5 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentDetailsPage() {
  return (
    <DashboardLayout>
      <PaymentDetailsContent />
    </DashboardLayout>
  )
} 