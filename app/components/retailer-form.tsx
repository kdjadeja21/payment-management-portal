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
import { Textarea } from "@/components/ui/textarea"
import { Retailer } from "@/types"
import { addRetailer, updateRetailer, getRetailers } from "@/app/actions/retailers"

interface RetailerFormProps {
  retailer?: Retailer
  trigger: React.ReactNode
  onSuccess?: () => void // Added onSuccess prop
}

export function RetailerForm({ retailer, trigger, onSuccess }: RetailerFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  
  const initialFormData = {
    name: retailer?.name || "",
    email: retailer?.email || "",
    phone: retailer?.phone || "",
    address: retailer?.address || "",
  }
  
  const [formData, setFormData] = useState(initialFormData)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Validate phone number length
    if (name === "phone") {
      if (value.length > 10) {
        setPhoneError("Phone number cannot be more than 10 digits.");
      } else if (value.length < 10) {
        setPhoneError("Phone number cannot be less than 10 digits.");
      } else {
        setPhoneError(null);
      }
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    if (phoneError) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (retailer) {
        await updateRetailer(retailer.id, formData)
        toast.success("Retailer updated successfully");
        onSuccess?.();
      } else {
        await addRetailer(formData)
        toast.success("Retailer added successfully")
        // Fetch the updated retailer data after adding
        await getRetailers(); // Assuming getRetailer fetches the updated list or data
      }
      
      setOpen(false)
      router.refresh()
      if (onSuccess) onSuccess(); // Call onSuccess if provided
    } catch (error) {
      console.error("Error saving retailer:", error)
      toast.error("Failed to save retailer. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData(initialFormData)
      setPhoneError(null); // Reset phone error on close
    }
    setOpen(open)
  }
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{retailer ? "Edit Retailer" : "Add Retailer"}</DialogTitle>
          <DialogDescription>
            {retailer
              ? "Update the retailer's information below."
              : "Enter the retailer's information to add them to your system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                aria-invalid={!!phoneError}
              />
              {phoneError && <p className="text-red-600">{phoneError}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !!phoneError}>
              {isSubmitting ? "Saving..." : retailer ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}