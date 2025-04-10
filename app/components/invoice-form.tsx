"use client"

// Add type declaration for MSStream
declare global {
  interface Window {
    MSStream?: any;
  }
}

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CalendarIcon } from 'lucide-react'
import { format, isFuture } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"

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

  const retailerName = invoice?.retailerName || (retailers.find(r => r.id === defaultRetailerId)?.name || "");

  const formSchema = z.object({
    retailerId: z.string().min(1, "Retailer is required"),
    retailerName: z.string(),
    invoiceName: z.string().min(1, "Invoice Name is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    invoiceDate: z.date(),
    dueDate: z.date(),
    paidAmount: z.number(),
    remainingAmount: z.number(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      retailerId: invoice?.retailerId || defaultRetailerId || "",
      retailerName: retailerName,
      invoiceName: invoice?.invoiceName || `INV-${new Date().getTime()}`,
      amount: invoice?.amount || 0,
      invoiceDate: invoice?.invoiceDate || new Date(),
      dueDate: invoice?.dueDate || new Date(),
      paidAmount: invoice?.paidAmount || 0,
      remainingAmount: invoice?.remainingAmount || 0,
    }
  })

  const handleRetailerChange = (value: string) => {
    const retailer = retailers.find(r => r.id === value)
    form.setValue("retailerId", value)
    form.setValue("retailerName", retailer?.name || "")
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      if (invoice) {
        await updateInvoice(invoice.id, values)
        toast.success("Invoice updated successfully")
      } else {
        await addInvoice(values)
        toast.success("Invoice added successfully")
      }

      setOpen(false)
      form.reset()
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
    setOpen(false)
    form.reset()
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="retailerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retailer</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleRetailerChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select retailer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {retailers.map((retailer) => (
                        <SelectItem key={retailer.id} value={retailer.id}>
                          {retailer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invoiceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter invoice name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invoiceDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Invoice Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : "Select date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      {isIOS ? (
                        <Input
                          type="date"
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const selectedDate = new Date(e.target.value);
                            if (selectedDate > new Date()) {
                              alert("Please select a valid date. It cannot be in the future.");
                              return;
                            }
                            if (selectedDate < new Date("1900-01-01")) {
                              alert("Please select a valid date. It cannot be earlier than January 1, 1900.");
                              return;
                            }
                            if (selectedDate < form.getValues("invoiceDate")) {
                              alert("Please select a valid date. It cannot be earlier than the invoice date.");
                              return;
                            }
                            field.onChange(selectedDate);
                          }}
                          autoComplete="off"
                          required
                          aria-invalid={!!form.formState.errors.invoiceDate}
                        />
                      ) : (
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : "Select date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      {isIOS ? (
                        <Input
                          type="date"
                          value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const selectedDate = new Date(e.target.value);
                            if (selectedDate > new Date()) {
                              alert("The selected date cannot be in the future.");
                              return;
                            } 
                            if (selectedDate < new Date("1900-01-01")) {
                              alert("The selected date cannot be before January 1, 1900.");
                              return;
                            }
                            if (selectedDate < form.getValues("invoiceDate")) {
                              alert("The due date cannot be earlier than the invoice date.");
                              return;
                            }
                            field.onChange(selectedDate);
                          }}
                          autoComplete="off"
                          required
                          aria-invalid={!!form.formState.errors.dueDate}
                        />
                      ) : (
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || 
                            date < new Date("1900-01-01") || 
                            date < form.getValues("invoiceDate")
                          }
                          initialFocus
                        />
                      )}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : invoice ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}