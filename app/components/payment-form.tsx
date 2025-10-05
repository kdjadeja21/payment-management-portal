"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Retailer } from "@/types"
import { applyLumpSumPayment } from "@/app/actions/payments"
import { formatCurrency } from "@/lib/utils"

interface PaymentFormProps {
  retailer: Retailer
  totalDue: number
  onSuccess?: () => void // Added onSuccess prop
}

export function PaymentForm({ retailer, totalDue, onSuccess }: PaymentFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<number>(0)
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (amount <= 0) {
      toast.error("Payment amount must be greater than zero")
      return
    }

    if (!paymentDate) {
      toast.error("Payment date is required")
      return
    }

    const selectedDate = new Date(paymentDate)
    const today = new Date()
    
    // Set both dates to midnight UTC for accurate comparison
    selectedDate.setUTCHours(0, 0, 0, 0)
    today.setUTCHours(0, 0, 0, 0)

    if (selectedDate > today) {
      toast.error("Payment date cannot be in the future")
      return
    }
    
    // Show confirmation dialog instead of immediately submitting
    setShowConfirmation(true)
  }

  const handleConfirmPayment = async () => {
    setIsSubmitting(true)
    
    try {
      const result = await applyLumpSumPayment(retailer.id, amount, paymentDate.toISOString().split('T')[0])
      
      toast.success(`Payment of ${formatCurrency(amount)} applied successfully`)
      setOpen(false)
      setShowConfirmation(false)
      // Reset form
      setAmount(0)
      setPaymentDate(new Date())
      router.refresh()
      onSuccess?.() // Call onSuccess if provided
    } catch (error) {
      console.error("Error applying payment:", error)
      toast.error("Failed to apply payment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700 text-white cursor-pointer">Record Payment</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription className="text-gray-700">
              <div className="mb-2">
                Please enter the payment amount received from <strong>{retailer.name}</strong>. 
                This payment will be applied to the oldest unpaid invoices first.
              </div>
              <div className="text-red-600 font-semibold">
                Please double-check the amount entered. Once recorded, you cannot delete or edit the payment record.
              </div>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Payment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      value={paymentDate}
                      onChange={(value) => {
                        if (value instanceof Date) {
                          setPaymentDate(value)
                        }
                      }}
                      disableFutureDates
                      allowRange={false}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  placeholder="0.00"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Total due: {formatCurrency(totalDue)}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {showConfirmation && (
        <Dialog open={showConfirmation} onOpenChange={(open) => {
          setShowConfirmation(open)
          if (!open) {
            // Reset submitting state if dialog is closed
            setIsSubmitting(false)
          }
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Confirm Payment Application</DialogTitle>
              <DialogDescription>
                Please review the payment details below before confirming.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p>Please confirm the following payment details:</p>
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Retailer:</span>
                  <span>{retailer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment Amount:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment Date:</span>
                  <span>{format(paymentDate, "PPP")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Due:</span>
                  <span>{formatCurrency(totalDue)}</span>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                  ⚠️ Important Notice
                </p>
                <p className="text-sm text-red-600 mt-1">
                  This action cannot be undone. The payment will be applied to the oldest unpaid invoices first.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Processing..." : "Confirm & Apply Payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}