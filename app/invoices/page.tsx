"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { FileText, Plus, Filter, X } from "lucide-react"
import { useRouter } from "next/navigation"

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

function InvoiceContent() {
  const router = useRouter()
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
      paid: "text-green-500",
      due: "text-yellow-500",
      overdue: "text-red-500",
    }
    return statusColors[status] || "text-gray-500"
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <InvoiceForm
            retailers={retailers}
            trigger={
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            }
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 rounded-lg border p-4 animate-pulse">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
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
              <Button size="sm">
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
        <h1 className="text-3xl font-bold">Invoices</h1>
        <InvoiceForm
          retailers={retailers}
          trigger={
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          }
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by Due Days</span>
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
            <SelectTrigger className="w-[120px]">
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
            className="w-[100px]"
          />
          {dueDaysFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retailer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Remaining Amount</TableHead>
                <TableHead>Due Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/invoices/${invoice.id}`)}
                  >
                    <TableCell>{invoice.retailerName}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <span className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.paidAmount)}</TableCell>
                    <TableCell>{formatCurrency(invoice.remainingAmount)}</TableCell>
                    <TableCell>{invoice.dueDays}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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