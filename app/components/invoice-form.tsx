"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CalendarIcon } from 'lucide-react'
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Retailer, Invoice } from "@/types"
import { addInvoice, updateInvoice } from "@/app/actions/invoices"

interface InvoiceFormProps {
  invoice?: Invoice
  retailers: Retailer[]
  trigger: React.ReactNode
  defaultRetailerId?: string
  onSuccess?: () => void
}

export function InvoiceForm({ invoice, retailers, trigger, defaultRetailerId, onSuccess }: InvoiceFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    retailerId: invoice?.retailerId || defaultRetailerId || "",
    retailerName: invoice?.retailerName || "",
    invoiceName: invoice?.invoiceName || `INV-${new Date().getTime()}`,
    amount: invoice?.amount || 0,
    invoiceDate: invoice?.invoiceDate || new Date(),
    dueDate: invoice?.dueDate || new Date(),
    paidAmount: invoice?.paidAmount || 0,
    remainingAmount: invoice?.remainingAmount || 0,
  })
  
  const handleRetailerChange = (value: string) => {
    const retailer = retailers.find(r => r.id === value)
    setFormData(prev => ({
      ...prev,
      retailerId: value,
      retailerName: retailer?.name || "",
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (invoice) {
        await updateInvoice(invoice.id, formData)
        toast.success("Invoice updated successfully")
      } else {
        await addInvoice(formData)
        toast.success("Invoice added successfully")
      }
      
      setOpen(false)
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast.error("Failed to save invoice. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "Add Invoice"}</DialogTitle>
          <DialogDescription>
            {invoice
              ? "Update the invoice information below."
              : "Enter the invoice details to add it to your system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="retailer">Retailer</Label>
              <Select
                value={formData.retailerId}
                onValueChange={handleRetailerChange}
              >
                <SelectTrigger id="retailer">
                  <SelectValue placeholder="Select retailer" />
                </SelectTrigger>
                <SelectContent>
                  {retailers.map((retailer) => (
                    <SelectItem key={retailer.id} value={retailer.id}>
                      {retailer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invoiceName">Invoice Name</Label>
              <Input
                id="invoiceName"
                value={formData.invoiceName}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceName: e.target.value }))}
                placeholder="Enter invoice name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Invoice Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.invoiceDate ? format(formData.invoiceDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.invoiceDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, invoiceDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, dueDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : invoice ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}