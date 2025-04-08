"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { FileText, Plus, Filter, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getInvoices } from "@/app/actions/invoices"
import { getRetailers } from "@/app/actions/retailers"
import { formatCurrency } from "@/lib/utils"
import DashboardLayout from "@/app/components/dashboard-layout"
import { Invoice, Retailer } from "@/types"
import { InvoiceForm } from "@/app/components/invoice-form"
import { useAuth } from "@clerk/nextjs"
import { InlineLoader } from "@/app/components/loader"

function InvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userId } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dueDaysFilter, setDueDaysFilter] = useState<{
    operator: '>' | '<' | '='
    value: number
  } | null>(null)

  // Get pagination parameters from URL or use defaults
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = parseInt(searchParams.get('perPage') || '10')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesData, retailersData] = await Promise.all([
          getInvoices({
            dueDays: dueDaysFilter || undefined
          }),
          getRetailers()
        ])
        setInvoices(invoicesData)
        setRetailers(retailersData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId, dueDaysFilter])

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      paid: "text-emerald-600",
      due: "text-amber-600",
      overdue: "text-rose-600",
    }
    return statusColors[status] || "text-slate-600"
  }

  const handleDueDaysFilterChange = (operator: '>' | '<' | '=' | '', value: string) => {
    if (!operator || !value) {
      setDueDaysFilter(null)
      return
    }
    setDueDaysFilter({
      operator,
      value: parseInt(value)
    })
  }

  const clearFilters = () => {
    setDueDaysFilter(null)
  }

  // Pagination calculations
  const totalPages = Math.ceil(invoices.length / perPage)
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage
  const currentInvoices = invoices.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    router.push(`/invoices?${params.toString()}`)
  }

  const handlePerPageChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('perPage', value)
    params.set('page', '1') // Reset to first page when changing items per page
    router.push(`/invoices?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
        <Card className="border-gray-200">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-gray-800">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <InlineLoader />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <InvoiceForm
            retailers={retailers}
            trigger={
              <Button size="sm" className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            }
          />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
        <InvoiceForm
          retailers={retailers}
          trigger={
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          }
          onSuccess={() => {
            // Refresh the data
            const fetchData = async () => {
              try {
                const [invoicesData, retailersData] = await Promise.all([
                  getInvoices({
                    dueDays: dueDaysFilter || undefined
                  }),
                  getRetailers()
                ])
                setInvoices(invoicesData)
                setRetailers(retailersData)
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load data")
              }
            }
            fetchData()
          }}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by Due Days</span>
          <Select
            value={dueDaysFilter?.operator || ''}
            onValueChange={(value) => {
              if (!value) {
                setDueDaysFilter(null)
                return
              }
              setDueDaysFilter({
                operator: value as '>' | '<' | '=',
                value: dueDaysFilter?.value || 0
              })
            }}
          >
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=">">Greater than</SelectItem>
              <SelectItem value="<">Less than</SelectItem>
              <SelectItem value="=">Equals</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Days"
            value={dueDaysFilter?.value || ''}
            onChange={(e) => {
              const value = e.target.value
              if (!value) {
                setDueDaysFilter({
                  operator: dueDaysFilter?.operator || '>',
                  value: 0
                })
                return
              }
              setDueDaysFilter({
                operator: dueDaysFilter?.operator || '>',
                value: parseInt(value)
              })
            }}
            className="w-[100px] bg-white"
          />
          {dueDaysFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-gray-800">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="text-gray-600">Retailer</TableHead>
                <TableHead className="text-gray-600">Amount</TableHead>
                <TableHead className="text-gray-600">Invoice Date</TableHead>
                <TableHead className="text-gray-600">Due Date</TableHead>
                <TableHead className="text-gray-600">Status</TableHead>
                <TableHead className="text-gray-600">Paid Amount</TableHead>
                <TableHead className="text-gray-600">Remaining Amount</TableHead>
                <TableHead className="text-gray-600">Due Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-600">
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                currentInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                  >
                    <TableCell className="text-gray-700">{invoice.retailerName}</TableCell>
                    <TableCell className="text-gray-700">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell className="text-gray-700">{format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="text-gray-700">{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <span className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700">{formatCurrency(invoice.paidAmount)}</TableCell>
                    <TableCell className="text-gray-700">{formatCurrency(invoice.remainingAmount)}</TableCell>
                    <TableCell className="text-gray-700">{invoice.dueDays}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

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

export default function InvoicePage() {
  return (
    <DashboardLayout>
      <InvoiceContent />
    </DashboardLayout>
  )
}