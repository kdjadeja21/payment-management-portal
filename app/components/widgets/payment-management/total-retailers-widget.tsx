"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePaymentData } from "@/app/hooks/use-payment-data"

export function TotalRetailersWidget() {
  const { retailers, isLoading } = usePaymentData()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Retailers</CardTitle>
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
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
          ) : (
            <>
              {retailers.length}
              <p className="text-xs text-muted-foreground">
                Active retailers
              </p>
            </>
          )}
        </div>

      </CardContent>
    </Card>
  )
} 