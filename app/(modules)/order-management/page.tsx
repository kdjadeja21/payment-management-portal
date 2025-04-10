import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Order Management",
  description: "Manage orders, fulfillment, and customer requests",
}

export default function OrderManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Order Management</h1>
      <div className="grid gap-4">
        {/* Order management content will go here */}
      </div>
    </div>
  )
} 