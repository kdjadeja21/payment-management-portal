import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Udyog360 | Inventory Management",
  description: "Manage inventory, stock levels, and products",
}

export default function InventoryManagementPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
      <div className="grid gap-4">
        {/* Inventory management content will go here */}
      </div>
    </div>
  )
} 