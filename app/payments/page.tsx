import { Suspense } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getPayments } from "@/app/actions/payments"
import { formatCurrency, formatDate } from "@/lib/utils"
import DashboardLayout from "@/app/components/dashboard-layout"

async function PaymentsContent() {
  const payments = await getPayments()

  console.log({payments})
  
  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort(
    (a, b) => b.paymentDate.getTime() - a.paymentDate.getTime()
  )
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-4 gap-4 p-4 font-medium">
              <div>Retailer</div>
              <div>Payment Date</div>
              <div>Amount</div>
              <div>Applied To</div>
            </div>
            {sortedPayments.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No payments found.
              </div>
            ) : (
              sortedPayments.map(payment => (
                <div
                  key={payment.id}
                  className="grid grid-cols-4 gap-4 border-t p-4"
                >
                  <div>
                    <Link 
                      href={`/retailers/${payment.retailerId}`}
                      className="text-primary hover:underline"
                    >
                      {payment.retailerName}
                    </Link>
                  </div>
                  <div>{formatDate(payment.createdAt)}</div>
                  <div>{formatCurrency(payment.amount)}</div>
                  <div>
                    <div className="text-sm">
                      {payment.invoices.length} {payment.invoices.length === 1 ? 'invoice' : 'invoices'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<PaymentsSkeleton />}>
        <PaymentsContent />
      </Suspense>
    </DashboardLayout>
  )
}

function PaymentsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[180px]" />
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-4 gap-4 p-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 border-t p-4">
                {Array(4).fill(0).map((_, j) => (
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