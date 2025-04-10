"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CalendarIcon } from 'lucide-react'
import { format, isFuture } from "date-fns"

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
  const [formErrors, setFormErrors] = useState<string[]>([])

  const retailerName = invoice?.retailerName || (retailers.find(r => r.id === defaultRetailerId)?.name || "");

  const initialFormData = {
    retailerId: invoice?.retailerId || defaultRetailerId || "",
    retailerName: retailerName,
    invoiceName: invoice?.invoiceName || `INV-${new Date().getTime()}`,
    amount: invoice?.amount || 0,
    invoiceDate: invoice?.invoiceDate || new Date(),
    dueDate: invoice?.dueDate || new Date(),
    paidAmount: invoice?.paidAmount || 0,
    remainingAmount: invoice?.remainingAmount || 0,
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleRetailerChange = (value: string) => {
    const retailer = retailers.find(r => r.id === value)
    setFormData(prev => ({
      ...prev,
      retailerId: value,
      retailerName: retailer?.name || "",
    }))
  }

  const validateForm = () => {
    const errors: string[] = []
    if (!formData.retailerId) errors.push("Retailer is required.")
    if (!formData.invoiceName) errors.push("Invoice Name is required.")
    if (formData.amount <= 0) errors.push("Amount must be greater than 0.")
    if (!formData.invoiceDate) errors.push("Invoice Date is required.")
    if (!formData.dueDate) errors.push("Due Date is required.")
    if (formData.dueDate < formData.invoiceDate) errors.push("Due Date must be after Invoice Date.")
    if (isFuture(formData.invoiceDate)) errors.push("Invoice Date cannot be in the future.")
    if (isFuture(formData.dueDate)) errors.push("Due Date cannot be in the future.")
    setFormErrors(errors)
    return errors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    try {
      if (invoice) {
        await updateInvoice(invoice.id, formData)
        toast.success("Invoice updated successfully")
      } else {
        await addInvoice(formData)
        toast.success("Invoice added successfully")
      }

      setOpen(false)
      setFormData(initialFormData); // Reset form data after submit
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast.error("Failed to save invoice. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setOpen(false);
    setFormData(initialFormData); // Reset form data on cancel
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
                <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={10}>
                  <Calendar
                    mode="single"
                    selected={formData.invoiceDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, invoiceDate: date }))}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
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
                <PopoverContent className="w-auto p-0" align="start" side="bottom" sideOffset={10}>
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, dueDate: date }))}
                    disabled={(date) =>
                      date < formData.invoiceDate
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {formErrors.length > 0 && (
              <div className="text-red-600">
                {formErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.retailerId}>
              {isSubmitting ? "adding..." : invoice ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}