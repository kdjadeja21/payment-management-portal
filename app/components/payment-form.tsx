"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
import { Retailer } from "@/types"
import { applyLumpSumPayment } from "@/app/actions/payments"
import { formatCurrency } from "@/lib/utils"

interface PaymentFormProps {
  retailer: Retailer
  totalDue: number
}

export function PaymentForm({ retailer, totalDue }: PaymentFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState<number>(totalDue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (amount <= 0) {
      toast.error("Payment amount must be greater than zero")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await applyLumpSumPayment(retailer.id, amount)
      
      toast.success(`Payment of ${formatCurrency(amount)} applied successfully`)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error applying payment:", error)
      toast.error("Failed to apply payment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Record Payment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Enter the payment amount received from {retailer.name}.
            The payment will be applied to the oldest unpaid invoices first.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              {isSubmitting ? "Processing..." : "Apply Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}