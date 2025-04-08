"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPayments } from "@/app/actions/payments"
import { formatCurrency, formatDate } from "@/lib/utils"
import DashboardLayout from "@/app/components/dashboard-layout"
import { Payment } from "@/types"

function PaymentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get pagination parameters from URL or use defaults
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '10')

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const paymentsData = await getPayments()
        setPayments(paymentsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payments")
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  // Sort payments by date (newest first)
  const sortedPayments = [...payments].sort(
    (a, b) => b.paymentDate.getTime() - a.paymentDate.getTime()
  )

  // Pagination calculations
  const totalPages = Math.ceil(sortedPayments.length / perPage)
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const currentPayments = sortedPayments.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    router.push(`/payments?${params.toString()}`)
  }

  const handlePerPageChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('perPage', value)
    params.set('page', '1') // Reset to first page when changing items per page
    router.push(`/payments?${params.toString()}`)
  }

  if (loading) {
    return <PaymentsSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payments</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
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
            {currentPayments.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No payments found.
              </div>
            ) : (
              currentPayments.map(payment => (
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

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select 
                value={perPage.toString()} 
                onValueChange={handlePerPageChange}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="gap-1 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="gap-1 cursor-pointer"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <PaymentsContent />
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