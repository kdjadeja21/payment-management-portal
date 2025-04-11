"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePaymentData } from "@/app/hooks/use-payment-data"
import { formatCurrency } from "@/lib/utils"
import { Invoice } from "@/types"

export function TotalOverdueWidget() {
  const { invoices, isLoading } = usePaymentData()

  const totalOverdue = invoices
    .filter((invoice: Invoice) => invoice.status === 'overdue')
    .reduce((sum: number, invoice: Invoice) => sum + invoice.remainingAmount, 0)

  const overdueCount = invoices.filter((invoice: Invoice) =>
    invoice.status === 'overdue'
  ).length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Overdue</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-bounce delay-200 h-2.5 w-2.5 rounded-full bg-gray-700 mr-1"></div>
              <div className="animate-bounce delay-400 h-2.5 w-2.5 rounded-full bg-gray-700 mr-1"></div>
              <div className="animate-bounce delay-600 h-2.5 w-2.5 rounded-full bg-gray-700"></div>
            </div>
          )
            :
            <>
              {formatCurrency(totalOverdue)}
              <p className="text-xs text-muted-foreground">
                {overdueCount} invoices
              </p>
            </>
          }
        </div>
      </CardContent>
    </Card>
  )
} 