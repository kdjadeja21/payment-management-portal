import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Payment Management",
  description: "Manage payments, invoices, and subscriptions",
}

export default function PaymentManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Payment Management</h1>
        {/* Payment management content will go here */}
    </div>
  )
} 