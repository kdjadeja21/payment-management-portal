import { ReactNode } from "react"

interface InventoryManagementLayoutProps {
  children: ReactNode
}

export default function InventoryManagementLayout({ children }: InventoryManagementLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </div>
    </div>
  )
} 