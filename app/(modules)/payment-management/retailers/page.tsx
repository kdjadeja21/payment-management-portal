"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getRetailers } from "@/app/actions/retailers"
import { getInvoices } from "@/app/actions/invoices"
import { getPayments } from "@/app/actions/payments"
import { formatCurrency } from "@/lib/utils"
import { RetailerForm } from "@/app/components/retailer-form"
import DashboardLayout from "@/app/components/dashboard-layout"
import { Retailer, Invoice, Payment } from "@/types"

function RetailersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get pagination parameters from URL or use defaults
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '5')

  const fetchData = async () => {
    try {
      const [retailersData, invoicesData, paymentsData] = await Promise.all([
        getRetailers(),
        getInvoices(),
        getPayments()
      ])
      setRetailers(retailersData)
      setInvoices(invoicesData)
      setPayments(paymentsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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

  // Pagination calculations
  const totalPages = Math.ceil(retailersWithStats.length / perPage)
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const currentRetailers = retailersWithStats.length === 0 ? [] : retailersWithStats.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    router.push(`/payment-management/retailers?${params.toString()}`)
  }

  const handlePerPageChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('perPage', value)
    params.set('page', '1') // Reset to first page when changing items per page
    router.push(`/payment-management/retailers?${params.toString()}`)
  }

  if (loading) {
    return <RetailersSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium text-destructive">Error loading retailers</h3>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Retailers</h1>
        <RetailerForm
          trigger={
            <Button className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Add Retailer
            </Button>
          }
          onSuccess={fetchData} // Use the reusable fetchData function
        />
      </div>
      
      {retailersWithStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium">No retailers found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Get started by adding your first retailer
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentRetailers.map(retailer => (
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
                  <Button asChild variant="secondary" size="sm" className="cursor-pointer">
                    <Link href={`/payment-management/retailers/${retailer.id}`}>View Details</Link>
                  </Button>
                  <RetailerForm
                    retailer={retailer}
                    trigger={<Button className="cursor-pointer" variant="outline" size="sm">Edit</Button>}
                    onSuccess={fetchData} // Use the reusable fetchData function
                  />
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {retailersWithStats.length > 0 && (
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
          )}
        </>
      )}
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